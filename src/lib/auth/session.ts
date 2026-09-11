import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth/secret";
import { findUserById } from "@/lib/auth/users";
import {
  consumeRefreshJti,
  persistRefreshToken,
  revokeRefreshByJti,
} from "@/lib/auth/refresh-store";

/** @deprecated legacy single-cookie name — still cleared on logout */
export const COOKIE = "dth_session";
export const ACCESS_COOKIE = "dth_access";
export const REFRESH_COOKIE = "dth_refresh";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

const secret = () => new TextEncoder().encode(getAuthSecret());

export type SessionUser = {
  id: number;
  email: string;
  name: string;
};

type RefreshClaims = SessionUser & {
  jti?: string;
  familyId?: string;
};

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function payloadToUser(payload: {
  sub?: string;
  email?: unknown;
  name?: unknown;
}): SessionUser | null {
  const id = Number(payload.sub);
  if (!id || typeof payload.email !== "string" || typeof payload.name !== "string") {
    return null;
  }
  return { id, email: payload.email, name: payload.name };
}

function refreshExpiresAtIso() {
  return new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();
}

export async function createAccessToken(user: SessionUser) {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret());
}

export async function createRefreshToken(
  user: SessionUser,
  opts?: { familyId?: string },
) {
  const jti = randomUUID();
  const familyId = opts?.familyId ?? randomUUID();
  persistRefreshToken({
    jti,
    userId: user.id,
    familyId,
    expiresAt: refreshExpiresAtIso(),
  });
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    typ: "refresh",
    fid: familyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(secret());
}

/** @deprecated use createAccessToken + createRefreshToken */
export async function createSessionToken(user: SessionUser) {
  return createAccessToken(user);
}

async function verifyTyped(
  token: string,
  typ: "access" | "refresh" | "legacy",
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const tokenTyp = payload.typ;
    if (typ === "legacy") {
      // Old dth_session cookies had no typ claim
      if (tokenTyp === "refresh") return null;
    } else if (tokenTyp !== typ) {
      return null;
    }
    return payloadToUser(payload);
  } catch {
    return null;
  }
}

async function verifyRefreshClaims(token: string): Promise<RefreshClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== "refresh") return null;
    const user = payloadToUser(payload);
    if (!user) return null;
    return {
      ...user,
      jti: typeof payload.jti === "string" ? payload.jti : undefined,
      familyId: typeof payload.fid === "string" ? payload.fid : undefined,
    };
  } catch {
    return null;
  }
}

async function liveUser(user: SessionUser): Promise<SessionUser | null> {
  const row = findUserById(user.id);
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name };
}

async function applyRefreshedCookies(
  jar: Awaited<ReturnType<typeof cookies>>,
  user: SessionUser,
  nextRefresh?: string,
) {
  const nextAccess = await createAccessToken(user);
  jar.set(ACCESS_COOKIE, nextAccess, cookieOpts(ACCESS_MAX_AGE));
  if (nextRefresh) {
    jar.set(REFRESH_COOKIE, nextRefresh, cookieOpts(REFRESH_MAX_AGE));
  }
}

/**
 * Silent access renew from a refresh JWT. Rotates the refresh family on use
 * (with a short grace window) so a stolen token cannot be replayed indefinitely.
 */
async function sessionFromRefreshCookie(
  jar: Awaited<ReturnType<typeof cookies>>,
  token: string,
): Promise<SessionUser | null> {
  const claims = await verifyRefreshClaims(token);
  if (!claims) return null;

  const user = await liveUser(claims);
  if (!user) {
    if (claims.jti) revokeRefreshByJti(claims.jti);
    return null;
  }

  if (!claims.jti) {
    // Pre-store refresh cookies: accept once and migrate onto a tracked family.
    const nextRefresh = await createRefreshToken(user);
    await applyRefreshedCookies(jar, user, nextRefresh);
    return user;
  }

  const consumed = consumeRefreshJti(claims.jti, user.id);
  if (consumed.status === "invalid" || consumed.status === "replay") {
    return null;
  }
  if (consumed.status === "grace") {
    await applyRefreshedCookies(jar, user);
    return user;
  }

  const nextRefresh = await createRefreshToken(user, {
    familyId: consumed.familyId,
  });
  await applyRefreshedCookies(jar, user, nextRefresh);
  return user;
}

async function readCookieSession(): Promise<SessionUser | null> {
  const jar = await cookies();

  const access = jar.get(ACCESS_COOKIE)?.value;
  if (access) {
    const user = await verifyTyped(access, "access");
    if (user) return user;
  }

  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const user = await sessionFromRefreshCookie(jar, refresh);
    if (user) return user;
  }

  // Backward compatible: accept legacy 30d dth_session until it expires
  const legacy = jar.get(COOKIE)?.value;
  if (legacy) {
    const user = await verifyTyped(legacy, "legacy");
    if (user) {
      const live = await liveUser(user);
      if (live) {
        await setSessionCookies(live);
        jar.delete(COOKIE);
        return live;
      }
    }
  }

  return null;
}

/** Prefer email/password JWT cookies; fall back to Auth.js (OAuth) session. */
export async function readSession(): Promise<SessionUser | null> {
  const cookieSession = await readCookieSession();
  if (cookieSession) return cookieSession;

  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    const id = Number(session?.user?.id);
    if (!id || !session?.user?.email || !session.user.name) return null;
    return {
      id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookies(user: SessionUser) {
  const jar = await cookies();
  const [access, refresh] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user),
  ]);
  jar.set(ACCESS_COOKIE, access, cookieOpts(ACCESS_MAX_AGE));
  jar.set(REFRESH_COOKIE, refresh, cookieOpts(REFRESH_MAX_AGE));
}

/** @deprecated prefer setSessionCookies(user) */
export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, token, cookieOpts(ACCESS_MAX_AGE));
}

/** Revoke the current refresh family in SQLite (no-op if cookie missing/legacy). */
export async function revokeCurrentRefresh(): Promise<void> {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) return;
  const claims = await verifyRefreshClaims(refresh);
  if (claims?.jti) revokeRefreshByJti(claims.jti);
}

export async function clearSessionCookie() {
  await revokeCurrentRefresh();
  const jar = await cookies();
  // Next.js jar.delete() often fails to clear httpOnly cookies across hosts;
  // expire explicitly with the same path/sameSite attributes used when setting.
  const expired = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  for (const name of [COOKIE, ACCESS_COOKIE, REFRESH_COOKIE]) {
    jar.set(name, "", expired);
    jar.delete(name);
  }
}

export { ACCESS_TTL, REFRESH_TTL };
