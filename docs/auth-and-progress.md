# Auth and progress sync

Practical notes for Frontend and QA. Implementation lives in `src/lib/auth/*` and `src/app/api/progress/route.ts`.

## Sessions (`readSession`)

All signed-in API routes use `readSession()` (`src/lib/auth/session.ts`). It tries email/password cookies first, then Auth.js (OAuth).

| Path | Cookies | Lifetime |
|------|---------|----------|
| Email / password | `dth_access` (httpOnly JWT) + `dth_refresh` (httpOnly JWT, SQLite `jti`) | Access 15m (silent renew from refresh); refresh 30d, rotated on use |
| OAuth (Google / Microsoft / X) | Auth.js session JWT | 8h (`src/auth.ts`) |

`GET /api/auth/me` accepts either session and returns `{ user, csrf, progress? }`. `user` is `null` when logged out (still returns a CSRF token).

Do not read `dth_access` / `dth_refresh` from JavaScript — they are httpOnly. Legacy `dth_session` is still cleared on logout.

## CSRF and trusted origins

Mutating email/password + progress routes (`POST /api/auth/login|signup|logout`, `POST /api/progress`) require:

1. **Trusted Origin or Referer** — `AUTH_TRUSTED_ORIGINS` (comma-separated) plus `AUTH_URL` / `NEXTAUTH_URL`. Dev fallback if those are empty: `http://localhost:3000` and `http://127.0.0.1:3000`.
2. **Double-submit header** — `x-csrf-token` must match the `dth_csrf` cookie (readable by JS).

Use `authedFetch` from `src/lib/auth/client.ts` for POSTs; it pulls the token from the cookie or `/api/auth/me`. Wrong origin or missing/mismatched header → `403`.

## Progress API

Rows are `(user_id, track, slug)` in SQLite `lesson_progress`. `track` and `slug` are free text — **unknown track IDs are accepted** so FDE / ETL / lab lessons sync without a server allowlist.

### GET `/api/progress`

Requires a session. `401` if logged out.

```json
{
  "lessons": {
    "databricks:dbx-workspace-cluster-basics": {
      "completed": false,
      "quizScore": 2,
      "quizTotal": 3,
      "stepIndex": 1,
      "updatedAt": "2026-09-12 03:00:00"
    }
  }
}
```

`quizScore`, `quizTotal`, and `stepIndex` are omitted when null. DBX/SF practice labs write `stepIndex` (currently `1`) after a successful local run; that does **not** mark the lesson complete.

### POST `/api/progress` — single row

Same CSRF + session rules as login. Body:

```json
{
  "track": "fde",
  "slug": "01-intro",
  "completed": true,
  "quizScore": 3,
  "quizTotal": 3,
  "stepIndex": 1
}
```

`updatedAt` is optional on single writes (server stamps `datetime('now')`). Response is the full `lessons` map (same shape as GET).

### POST `/api/progress` — merge (login / guest upload)

```json
{
  "merge": {
    "snowflake:sf-day0-objects": {
      "completed": true,
      "stepIndex": 1,
      "updatedAt": "2026-09-12T02:00:00.000Z"
    },
    "etl:01-extract": { "completed": false, "updatedAt": "2026-09-12T02:01:00.000Z" }
  }
}
```

- Max **500** keys (`MERGE_PAYLOAD_MAX_KEYS`). Over that → `400`.
- Merge must be a plain object (not an array).
- Keys must be `track:slug` (one colon). Invalid keys → `400` (`Invalid progress key`); the request is not partially applied.
- **Strictly older `updatedAt` is skipped** (server keeps the newer row). Missing or unparseable `updatedAt` applies the patch. Equal timestamps apply the incoming row.

### Track / slug validation (shape only)

| Rule | Limit |
|------|--------|
| Non-empty | required |
| `track` max | 64 chars |
| `slug` max | 128 chars |
| Allowed characters | `[A-Za-z0-9][A-Za-z0-9._-]*` (kebab / snake / dotted ids) |

Rejected (single → `Invalid track or slug`; merge key → `Invalid progress key`): empty, whitespace, slashes, spaces, control characters, path-like `../…`, oversized strings. **Do not** send slugs that contain `:`.

Existing catalog slugs (`dbx-workspace-cluster-basics`, `sf-day0-objects`, `00-joins-set-logic`) and new tracks such as `fde` / `etl` pass as long as they match the shape.

### Rate limit (POST only)

In-memory, single-node (same helper as login/signup: `src/lib/auth/rate-limit.ts`).

- **60** requests / minute / client IP (`X-Forwarded-For` / `X-Real-IP`)
- **40** requests / minute / user id

Over limit → `429` + `Retry-After`. Generous enough for lesson complete + quiz + lab step writes; not for merge-spam filling SQLite.

GET `/api/progress` is not rate-limited.

## Guest localStorage and merge on login

| Item | Value |
|------|--------|
| Current key | `dth-progress-v3` |
| Legacy key (auto-migrated) | `dth-progress-v2` |
| Lesson key | `{track}:{slug}` (aliases in `src/lib/progress.ts`) |

Guests write only to localStorage. After **login**, the client POSTs `{ merge: local.lessons }` then merges the server map back (newer `updatedAt` wins; `completed` is OR’d in the client merge helper). **Signup** clears local progress and does **not** upload guest leftovers (`uploadLocal: false` in `AuthProvider`). Logout clears localStorage.

Offline / 401 POSTs are ignored on the client (`authedFetch` + try/catch in `syncToServer`).

## How new training tracks sync

1. Frontend adds a track folder / lesson slugs (or lab UI writing `stepIndex`).
2. Client calls `upsertLessonProgress(track, slug, patch)` — no backend TrackId enum.
3. SQLite stores whatever valid `track` + `slug` pair arrives.
4. Dashboard / `trackCompletion(track, slugs)` read the same keys.

No server deploy is required for a new track ID. If a slug fails validation, check charset and length before assuming the API is down.

## Quick verify

```bash
# after signing in (cookie jar + x-csrf-token from GET /api/auth/me):
curl -sS -X POST "$ORIGIN/api/progress" \
  -H "content-type: application/json" \
  -H "origin: $ORIGIN" \
  -H "x-csrf-token: $CSRF" \
  --cookie "$COOKIES" \
  -d '{"track":"fde","slug":"01-intro","completed":true}'
# expect 200 and lessons["fde:01-intro"]

curl … -d '{"track":"../etc","slug":"passwd","completed":true}'
# expect 400 Invalid track or slug
```
