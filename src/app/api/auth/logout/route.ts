import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie } from "@/lib/auth/session";
import { assertCsrf } from "@/lib/auth/csrf";
import { signOut } from "@/auth";

export const runtime = "nodejs";

const AUTHJS_COOKIES = [
  "authjs.session-token",
  "authjs.callback-url",
  "authjs.csrf-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.csrf-token",
  "next-auth.session-token",
  "next-auth.callback-url",
  "next-auth.csrf-token",
  "__Secure-next-auth.session-token",
];

export async function POST(req: Request) {
  const csrf = await assertCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.error }, { status: csrf.status });
  }

  // clearSessionCookie revokes the refresh family in SQLite, then expires cookies.
  await clearSessionCookie();
  try {
    await signOut({ redirect: false });
  } catch {
    /* already signed out / no OAuth session */
  }

  const jar = await cookies();
  const expired = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  for (const name of AUTHJS_COOKIES) {
    jar.set(name, "", expired);
    jar.delete(name);
  }

  return NextResponse.json({ ok: true });
}
