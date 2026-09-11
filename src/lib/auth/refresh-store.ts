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

function familyHasLiveToken(familyId: string, now = nowIso()): boolean {
  const row = getDb()
    .prepare(
      `SELECT 1 AS ok FROM refresh_tokens
       WHERE family_id = ? AND revoked_at IS NULL AND expires_at >= ?
       LIMIT 1`,
    )
    .get(familyId, now) as { ok: number } | undefined;
  return Boolean(row);
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

function decideRevokedRow(row: RefreshTokenRow): ConsumeRefreshResult {
  const revokedMs = Date.parse(row.revoked_at || "");
  const withinGrace =
    Number.isFinite(revokedMs) && Date.now() - revokedMs < REFRESH_ROTATE_GRACE_MS;
  // Grace is only for rotation (a live sibling exists). Logout revokes the
  // whole family, so a stolen refresh must fail immediately.
  if (withinGrace && familyHasLiveToken(row.family_id)) {
    return { status: "grace", familyId: row.family_id, userId: row.user_id };
  }
  if (familyHasLiveToken(row.family_id)) {
    revokeRefreshFamily(row.family_id);
    return { status: "replay" };
  }
  return { status: "invalid" };
}

/**
 * Validate a presented refresh jti and, when still active, persist the
 * replacement in the same family atomically so concurrent requests see a live
 * sibling (grace) instead of a replay.
 */
export function consumeRefreshJti(
  jti: string,
  expectedUserId: number,
  next?: { jti: string; expiresAt: string },
): ConsumeRefreshResult {
  pruneExpired();
  const db = getDb();

  return db.transaction((): ConsumeRefreshResult => {
    const row = getRefreshToken(jti);
    if (!row) return { status: "invalid" };
    if (row.user_id !== expectedUserId) return { status: "invalid" };
    if (row.expires_at < nowIso()) return { status: "invalid" };

    if (row.revoked_at) {
      return decideRevokedRow(row);
    }

    if (next) {
      persistRefreshToken({
        jti: next.jti,
        userId: row.user_id,
        familyId: row.family_id,
        expiresAt: next.expiresAt,
      });
    }

    db.prepare(
      `UPDATE refresh_tokens SET revoked_at = ? WHERE jti = ? AND revoked_at IS NULL`,
    ).run(nowIso(), jti);

    return { status: "active", familyId: row.family_id, userId: row.user_id };
  })();
}
