import { getDb } from "@/lib/db";

/** Allow a just-rotated jti for this long so concurrent /api/auth/me + progress reads do not look like replay. */
export const REFRESH_ROTATE_GRACE_MS = 60_000;

export type RefreshTokenRow = {
  jti: string;
  user_id: number;
  family_id: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type ConsumeRefreshResult =
  | { status: "active"; familyId: string; userId: number }
  | { status: "grace"; familyId: string; userId: number }
  | { status: "replay" }
  | { status: "invalid" };

function nowIso() {
  return new Date().toISOString();
}

function pruneExpired(now = nowIso()) {
  const db = getDb();
  db.prepare(
    `DELETE FROM refresh_tokens
     WHERE expires_at < ?
        OR (revoked_at IS NOT NULL AND revoked_at < datetime('now', '-7 days'))`,
  ).run(now);
}

export function persistRefreshToken(input: {
  jti: string;
  userId: number;
  familyId: string;
  expiresAt: string;
}) {
  pruneExpired();
  getDb()
    .prepare(
      `INSERT INTO refresh_tokens (jti, user_id, family_id, expires_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(input.jti, input.userId, input.familyId, input.expiresAt);
}

export function getRefreshToken(jti: string): RefreshTokenRow | undefined {
  return getDb()
    .prepare("SELECT * FROM refresh_tokens WHERE jti = ?")
    .get(jti) as RefreshTokenRow | undefined;
}

export function revokeRefreshFamily(familyId: string) {
  getDb()
    .prepare(
      `UPDATE refresh_tokens
       SET revoked_at = COALESCE(revoked_at, ?)
       WHERE family_id = ?`,
    )
    .run(nowIso(), familyId);
}

export function revokeRefreshByJti(jti: string): boolean {
  const row = getRefreshToken(jti);
  if (!row) return false;
  revokeRefreshFamily(row.family_id);
  return true;
}

export function revokeRefreshForUser(userId: number) {
  getDb()
    .prepare(
      `UPDATE refresh_tokens
       SET revoked_at = COALESCE(revoked_at, ?)
       WHERE user_id = ?`,
    )
    .run(nowIso(), userId);
}

/**
 * Validate a presented refresh jti.
 * Active → mark revoked (caller mints a replacement in the same family).
 * Recently revoked → grace (concurrent silent-refresh).
 * Older revoked reuse → revoke the whole family (replay).
 */
export function consumeRefreshJti(
  jti: string,
  expectedUserId: number,
): ConsumeRefreshResult {
  pruneExpired();
  const row = getRefreshToken(jti);
  if (!row) return { status: "invalid" };
  if (row.user_id !== expectedUserId) return { status: "invalid" };
  if (row.expires_at < nowIso()) return { status: "invalid" };

  if (row.revoked_at) {
    const revokedMs = Date.parse(row.revoked_at);
    const withinGrace =
      Number.isFinite(revokedMs) &&
      Date.now() - revokedMs < REFRESH_ROTATE_GRACE_MS;
    if (withinGrace) {
      return { status: "grace", familyId: row.family_id, userId: row.user_id };
    }
    revokeRefreshFamily(row.family_id);
    return { status: "replay" };
  }

  getDb()
    .prepare(
      `UPDATE refresh_tokens SET revoked_at = ? WHERE jti = ? AND revoked_at IS NULL`,
    )
    .run(nowIso(), jti);
  return { status: "active", familyId: row.family_id, userId: row.user_id };
}
