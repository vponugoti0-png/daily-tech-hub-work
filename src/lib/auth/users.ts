import crypto from "crypto";
import { getDb, type ProgressRow, type UserRow } from "@/lib/db";
import {
  BCRYPT_COST,
  checkPassword,
  hashPassword,
} from "@/lib/auth/password";
import { assertProgressIds, splitProgressMergeKey } from "@/lib/auth/progress-validate";
import bcrypt from "bcryptjs";

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
    .get(email.trim()) as UserRow | undefined;
}

export function findUserById(id: number): UserRow | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}

export function findUserByOAuth(
  provider: string,
  subject: string,
): UserRow | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM users WHERE oauth_provider = ? AND oauth_subject = ?",
    )
    .get(provider, subject) as UserRow | undefined;
}

export function createUser(email: string, name: string, password: string) {
  const hash = hashPassword(password);
  const info = getDb()
    .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
    .run(email.trim().toLowerCase(), name.trim(), hash);
  return findUserById(Number(info.lastInsertRowid))!;
}

/** Random bcrypt hash that no password can match — for OAuth-only accounts. */
export function unusablePasswordHash() {
  return bcrypt.hashSync(
    `oauth-unusable:${crypto.randomBytes(32).toString("hex")}`,
    BCRYPT_COST,
  );
}

/**
 * Upsert an OAuth identity into SQLite users.
 * Link order: (1) provider+subject, (2) email when present, (3) create new.
 */
export function upsertOAuthUser(input: {
  provider: string;
  subject: string;
  email?: string | null;
  name?: string | null;
}): UserRow {
  const provider = input.provider.trim();
  const subject = input.subject.trim();
  const emailRaw = (input.email || "").trim().toLowerCase();
  const name =
    (input.name || "").trim() ||
    emailRaw.split("@")[0] ||
    `${provider} user`;

  const byOAuth = findUserByOAuth(provider, subject);
  if (byOAuth) {
    if (name && name !== byOAuth.name) {
      getDb().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, byOAuth.id);
      return findUserById(byOAuth.id)!;
    }
    return byOAuth;
  }

  if (emailRaw && emailRaw.includes("@")) {
    const byEmail = findUserByEmail(emailRaw);
    if (byEmail) {
      getDb()
        .prepare(
          "UPDATE users SET oauth_provider = ?, oauth_subject = ?, name = COALESCE(NULLIF(?, ''), name) WHERE id = ?",
        )
        .run(provider, subject, name, byEmail.id);
      return findUserById(byEmail.id)!;
    }

    const info = getDb()
      .prepare(
        `INSERT INTO users (email, name, password_hash, oauth_provider, oauth_subject)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(emailRaw, name, unusablePasswordHash(), provider, subject);
    return findUserById(Number(info.lastInsertRowid))!;
  }

  // No email from provider (common for X/Twitter without elevated email scope).
  const synthetic = `${provider}_${subject.replace(/[^a-zA-Z0-9_-]/g, "")}@oauth.local`;
  const info = getDb()
    .prepare(
      `INSERT INTO users (email, name, password_hash, oauth_provider, oauth_subject)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(synthetic, name, unusablePasswordHash(), provider, subject);
  return findUserById(Number(info.lastInsertRowid))!;
}

export function verifyPassword(user: UserRow, password: string) {
  return checkPassword(password, user.password_hash);
}

export function getProgressForUser(userId: number): ProgressRow[] {
  return getDb()
    .prepare(
      "SELECT track, slug, completed, quiz_score, quiz_total, step_index, updated_at FROM lesson_progress WHERE user_id = ?",
    )
    .all(userId) as ProgressRow[];
}

/** Parse client ISO or SQLite `datetime('now')` (`YYYY-MM-DD HH:MM:SS`, UTC). */
function parseProgressTimestamp(value: string): number | null {
  const s = value.trim();
  if (!s) return null;
  const sqlite = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(s);
  const normalized = sqlite ? `${sqlite[1]}T${sqlite[2]}Z` : s;
  const t = Date.parse(normalized);
  return Number.isNaN(t) ? null : t;
}

export function upsertProgress(
  userId: number,
  patch: {
    track: string;
    slug: string;
    completed?: boolean;
    quizScore?: number;
    quizTotal?: number;
    stepIndex?: number;
    updatedAt?: string;
  },
) {
  const { track, slug } = assertProgressIds(patch.track, patch.slug);
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT * FROM lesson_progress WHERE user_id = ? AND track = ? AND slug = ?",
    )
    .get(userId, track, slug) as
    | (ProgressRow & { id: number; user_id: number })
    | undefined;

  // Skip only when both timestamps exist and incoming is strictly older
  // (server keeps the newer row). Missing incoming updatedAt → apply patch.
  if (existing?.updated_at && patch.updatedAt) {
    const incomingTs = parseProgressTimestamp(patch.updatedAt);
    const storedTs = parseProgressTimestamp(existing.updated_at);
    if (incomingTs !== null && storedTs !== null && incomingTs < storedTs) {
      return;
    }
  }

  const completed =
    patch.completed !== undefined
      ? patch.completed
        ? 1
        : 0
      : (existing?.completed ?? 0);
  const quizScore =
    patch.quizScore !== undefined ? patch.quizScore : (existing?.quiz_score ?? null);
  const quizTotal =
    patch.quizTotal !== undefined ? patch.quizTotal : (existing?.quiz_total ?? null);
  const stepIndex =
    patch.stepIndex !== undefined ? patch.stepIndex : (existing?.step_index ?? null);

  db.prepare(
    `INSERT INTO lesson_progress (user_id, track, slug, completed, quiz_score, quiz_total, step_index, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, track, slug) DO UPDATE SET
       completed = excluded.completed,
       quiz_score = excluded.quiz_score,
       quiz_total = excluded.quiz_total,
       step_index = excluded.step_index,
       updated_at = datetime('now')`,
  ).run(userId, track, slug, completed, quizScore, quizTotal, stepIndex);
}

export const MERGE_PAYLOAD_MAX_KEYS = 500;

export function mergeLocalProgress(
  userId: number,
  lessons: Record<
    string,
    {
      completed?: boolean;
      quizScore?: number;
      quizTotal?: number;
      stepIndex?: number;
      updatedAt?: string;
    }
  >,
) {
  const entries = Object.entries(lessons);
  if (entries.length > MERGE_PAYLOAD_MAX_KEYS) {
    throw new Error(`merge payload exceeds ${MERGE_PAYLOAD_MAX_KEYS} keys`);
  }
  const tx = getDb().transaction(() => {
    for (const [key, val] of entries) {
      const parsed = splitProgressMergeKey(key);
      if (!parsed) {
        throw new Error("Invalid progress key");
      }
      upsertProgress(userId, {
        track: parsed.track,
        slug: parsed.slug,
        completed: val.completed,
        quizScore: val.quizScore,
        quizTotal: val.quizTotal,
        stepIndex: val.stepIndex,
        updatedAt: val.updatedAt,
      });
    }
  });
  tx();
}
