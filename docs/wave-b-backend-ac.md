# Wave B Backend AC — Practice Engine, Git practice VM, AI runtime

**Audience:** Product, Backend, Security, QA  
**Date:** 2026-09-12  
**Status:** Proposed AC — stamp per section (each section = its own Backend PR)  
**This PR:** docs only. No implementation.

Wave A (content / local labs) stays on a separate track. Wave B covers three **held** surfaces. Ship none of them until that surface has its own Backend PR **and** Security + QA stamps. Omit the chrome until the flag is on — no “Coming soon”.

Existing session / CSRF / guest progress (do not reinvent): [`docs/auth-and-progress.md`](./auth-and-progress.md). Training backlog context: [`docs/improvements-and-training.md`](./improvements-and-training.md).

---

## Shared rules (all three PRs)

Already agreed. Implementers copy these; do not weaken them in a later PR.

| Rule | What it means here |
|------|--------------------|
| Deny-by-default egress | Sandboxes and graders have no outbound network unless a later Security stamp lists an exact host. Default is none. |
| Short TTL | Sessions / sandboxes die on a timer. No long-lived learner VMs. |
| CPU / time caps | Every execute path has a hard timeout and a CPU/memory ceiling. |
| No secrets, no mounts | Do not inject `AUTH_*`, volume paths, `docker.sock`, or host home directories into learner runtimes. |
| Rate-limit create / grade | Session-create and grade are abuse surfaces. Limit **per IP and per user**. Reuse `src/lib/auth/rate-limit.ts` (single-node; same caveat as login/progress). |
| No “Coming soon” chrome | Flag off → route **404**, Frontend omits the control. Do not render placeholder CTAs. |
| Cookies stay as they are | `dth_access` / `dth_refresh` remain httpOnly + `SameSite=lax`. `dth_csrf` stays JS-readable. Do not add new auth cookies. |
| CSRF on mutating routes | Same as progress: trusted Origin/Referer + `x-csrf-token` == `dth_csrf`. Clients use `authedFetch`. |
| Guest progress | Guests keep `dth-progress-v3` localStorage. Signed-in writes go through existing `POST /api/progress`. New tracks/slugs stay shape-checked free text. |

**Shared HTTP map** (use these; do not invent “501 Not Implemented” or “coming soon” bodies):

| Status | When |
|--------|------|
| `400` | Bad JSON, missing fields, oversize body, invalid `track`/`slug` (same shape rules as progress) |
| `401` | Session required and `readSession()` is null |
| `403` | CSRF / origin fail |
| `404` | Feature flag off, or unknown exercise / session (same status — do not leak which) |
| `409` | Concurrent-session cap hit |
| `413` | Payload over the documented char/byte cap |
| `422` | Allowlist / dialect reject (unsafe SQL, non-git argv, blocked import) — safe message, no stack |
| `429` | Rate limit; send `Retry-After` |
| `503` | Sandbox provider down / cannot create |
| `504` | Execute timed out |

Flag-off **404** is intentional so Frontend can treat “not shipped” as absent.

**Shared observability:** log `route`, `status`, `user_id` (numeric, if signed in), `duration_ms`, `flag`, rate-limit key **type** (ip/user — not the raw IP if we can avoid it; IP hashed is fine). **Never** log cookies, JWTs, CSRF tokens, emails, passwords, full submissions, prompts, API keys, or sandbox env. User id only — no PII.

**Shared rollout:** env gate on the Railway/Fly app service, default **off** in production. Preview/dev may enable one flag at a time. No new cookie, no CSP widen unless that section’s Security stamp says so.

---

## Open decisions (index)

Stamp these before or with the matching PR. Defaults below are the **proposed** lean choice if Product is silent.

| ID | Surface | Question | Proposed default |
|----|---------|----------|------------------|
| D1 | Practice Engine | Guest `POST /grade` (IP-only limit) vs signed-in only? | **Guest allowed.** Same as local labs. Persist pass/fail only when signed in, via existing progress. |
| D2 | Practice Engine | On pass, write `stepIndex` only, or also `completed`? | **`stepIndex` only** (same as DuckDB / Pyodide / Git Play Lab). Quizzes remain the complete path. |
| D3 | Practice Engine | Store full submissions? | **No.** Ephemeral request only. Product must ask to retain. |
| D4 | Git VM | Guest sessions? | **Signed-in only.** Cost + abuse. Guests keep in-browser Git Play Lab. |
| D5 | Git VM | Where does `git` run? | **Must decide before code.** Next.js process on the SQLite volume is **not** an option. See §2. |
| D6 | Git VM | TTL / idle / concurrency numbers | **20 min TTL, 5 min idle, 1 session/user, 2/IP.** |
| D7 | AI runtime | Ship client-only first? | **Yes.** Extend Pyodide / local pattern. Server LLM proxy is a **later, separate PR**. |
| D8 | AI proxy (if ever) | App-owned key vs user-pasted key? | **App-owned env key only.** Never persist a user key. |

---

## 1. Practice Engine (future PR)

Auto test-case grading for SQL (and later the same shape for short Python). Controlled datasets only. No shell.

### 1.1 Goal / non-goals

**Goal**

- Learner submits a short query/snippet for a **catalogued** exercise.
- Server runs it against a **same-origin fixture** (the published seed, not learner-uploaded data).
- Compare result rows (or a stable checksum) to expected. Return pass/fail + which check failed.
- Optional: signed-in pass writes `stepIndex` through the existing progress API (client or server — see D2).

**Non-goals**

- Arbitrary SQL engine / warehouse connection.
- Learner-provided datasets, URLs, or file uploads.
- Shell, OS, or notebook kernels.
- A second editor product.
- Permanent submission archive (D3).
- Replacing in-browser DuckDB / Pyodide **Run** (those stay for exploration). Grade is a separate **Check** action.

### 1.2 API sketch

Prefix: `/api/practice`. All mutating routes: CSRF + trusted origin.

| Method | Path | Auth | CSRF | Flag |
|--------|------|------|------|------|
| `GET` | `/api/practice/exercises?track=&slug=` | Session **optional** | No | `PRACTICE_ENGINE_ENABLED=1` |
| `POST` | `/api/practice/grade` | Session **optional** (D1) | Yes | same |

Flag off → `404` on both.

**`GET` exercises** — metadata only. Never return expected rows, checksums, or hidden fixtures.

```json
{
  "exercises": [
    {
      "id": "sql-paid-orders-count",
      "dialect": "sql",
      "title": "Count paid orders",
      "checks": ["row_count", "checksum"]
    }
  ]
}
```

`track` / `slug` use the same shape rules as progress (`[A-Za-z0-9][A-Za-z0-9._-]*`, 64 / 128). Unknown pair → empty `exercises` or `404` (pick one in the impl PR and test it; do not 500).

**`POST /grade`**

```json
{
  "track": "sql",
  "slug": "sql-select-filter-nulls",
  "exerciseId": "sql-paid-orders-count",
  "dialect": "sql",
  "source": "SELECT count(*) AS n FROM silver.ok_orders"
}
```

| Field | Cap |
|-------|-----|
| `source` | 12 000 chars (same as `assertSafeLabPython`) |
| `dialect` | `sql` in v1; `python` only if a later stamp adds a **non-shell** grader |
| Body | ~16 KiB JSON |

**200 body (no expected rows leaked):**

```json
{
  "pass": false,
  "exerciseId": "sql-paid-orders-count",
  "checks": [
    { "id": "row_count", "pass": true },
    { "id": "checksum", "pass": false }
  ]
}
```

Do not echo the full result set. Optional `hint` only if content authors attached one (not the expected SQL).

**Progress write:** prefer the **client** calling existing `POST /api/progress` with `{ track, slug, stepIndex: 1 }` after `pass: true` (guest → localStorage). Grade handler should not grow a second progress writer unless Backend wants one transaction — still no new columns.

**Rate limits** (start here; tune after abuse data):

| Key | Limit |
|-----|--------|
| IP | 30 / minute |
| Signed-in user | 20 / minute |

Over → `429` + `Retry-After`. Guests: IP bucket only.

### 1.3 Data model

**No new SQLite table in v1.**

- Exercise definitions + expected checksums live in **repo fixtures** (same-origin, versioned with the app), not learner-writable DB rows.
- Pass/fail for signed-in users: existing `lesson_progress.step_index` (D2).
- Do not add `practice_submissions`. If Product later asks to keep submissions, that is a **new** Privacy + Security stamp (retention, access, deletion).

Expected values are server-only. Do not ship them in the client bundle as “hidden” answers.

### 1.4 Security

| Control | Requirement |
|---------|-------------|
| Dataset | Only fixtures we publish (DuckDB seed / in-module tables). Same-origin. No `httpfs`, no `ATTACH` of learner paths, no remote catalogs. |
| SQL gate | Reuse / tighten `assertSafeLabSql`: single `SELECT`/`WITH`, no multi-statement, same blocked keywords. |
| Runtime | In-process DuckDB **or** a throwaway child with **no** network, **no** filesystem except the fixture. Not a shell. `PRAGMA` / extensions off. |
| Time / CPU | ≤ 5 s wall clock; abort and `504`. Row compare cap 50 (same as `LAB_RESULT_ROW_LIMIT`) or checksum over that cap. |
| Memory | Soft cap; reject pathological projections. |
| Python (if added later) | Same denylist as `python-guard.ts`. **No** `subprocess`, **no** JS bridge. Separate stamp. |
| Egress | None from the grader. |
| Secrets | Grader env is empty of `AUTH_*` / `DATA_DIR`. |
| Answers | Expected checksums never leave the server. |

**Never allow:** `os.system`, pipes to a shell, `COPY`/`EXPORT`/`INSTALL`, learner `ATTACH`, fetching URLs, grading against production SQLite (`data/dth.sqlite`).

### 1.5 Failure modes

| Case | Status | Client sees |
|------|--------|-------------|
| Flag off / unknown exercise | `404` | generic not found |
| Bad JSON / ids | `400` | existing progress-style errors |
| Oversize source | `413` | “Submission too large” |
| Unsafe SQL / dialect | `422` | same class of message as the local lab (“read-only SQL samples”) |
| CSRF | `403` | `Forbidden` / `Invalid CSRF token` |
| Rate limit | `429` | + `Retry-After` |
| Execute timeout | `504` | “Check timed out” |
| Fixture missing (our bug) | `503` | “Check unavailable” — log internally |

Wrong answer is **200** + `pass: false`, not 4xx.

### 1.6 Observability

Log: `exerciseId`, `dialect`, `pass` (boolean), `duration_ms`, `user_id` if any, `checks_failed` (ids only).

Do **not** log `source`, result rows, or emails.

### 1.7 Rollout

```
PRACTICE_ENGINE_ENABLED=0
```

`1` on a preview first. Production stays `0` until Security + QA stamp this section. Frontend: **Check** button only when `GET` returns 200 with exercises. Otherwise omit.

### 1.8 QA stamp criteria

**Pass**

- [ ] Flag `0`: both routes `404`; no grade UI; no “Coming soon”.
- [ ] Flag `1`: published exercise, correct SQL → `200` `{ pass: true }`; wrong SQL → `200` `{ pass: false }` without expected rows.
- [ ] `ATTACH` / multi-statement / `COPY` → `422`.
- [ ] Guest grade works (if D1 holds); signed-in pass updates `stepIndex` via existing progress (or documented server write); guest pass stays in localStorage.
- [ ] Missing CSRF → `403`; no session still grades if D1 holds.
- [ ] 31st grade in a minute from one IP → `429`.
- [ ] `source` > 12k → `413`.
- [ ] Response and logs contain no expected checksum, no full SQL, no email.
- [ ] Cookies unchanged (`httpOnly` access/refresh, `SameSite=lax`).

**Fail**

- Any shell spawned, any egress, any write to `dth.sqlite` other than `lesson_progress`, submissions persisted, CSP widened, or “Coming soon” copy.

### 1.9 Out of scope

- Databricks / Snowflake **cloud** warehouses or personal access tokens.
- Hidden test files uploaded by authors at runtime (fixtures ship in the release).
- Leaderboards, XP, or plagiarism detection.
- Storing every attempt.
- Replacing DuckDB-WASM **Run**.

---

## 2. Git practice VM (future PR)

Real `git` in a disposable sandbox. **Not** the in-browser Git Play Lab (that stays; it has no VM and no GitHub). Separate PR from Practice Engine and from AI runtime.

### 2.1 Goal / non-goals

**Goal**

- Signed-in learner (D4) creates an ephemeral workspace with a real git binary.
- `create` → `exec` (git-only allowlist, argv not shell) → idle/TTL kill or explicit `kill`.
- Useful for lessons that the graph CLI cannot teach (index, stash conflict, bisect on real objects).

**Non-goals**

- GitHub / GitLab push, SSH keys, or `git credential`.
- General-purpose Linux shell or “cloud IDE”.
- Docker-in-Docker, sibling containers, or host docker.sock.
- Replacing Git Play Lab for guests (D4).
- Persistent home directories across days.

### 2.2 API sketch

Prefix: `/api/git-vm`. Session **required** on all routes (D4). CSRF on `POST`/`DELETE`.

| Method | Path | Auth | CSRF | Purpose |
|--------|------|------|------|---------|
| `POST` | `/api/git-vm/sessions` | Session | Yes | Create; rate-limited |
| `GET` | `/api/git-vm/sessions/:id` | Session (owner) | No | TTL remaining, state |
| `POST` | `/api/git-vm/sessions/:id/exec` | Session (owner) | Yes | One allowlisted `git` argv |
| `DELETE` | `/api/git-vm/sessions/:id` | Session (owner) | Yes | Kill now |

Flag `GIT_VM_ENABLED=1`. Off → `404` on all four.

**`POST /sessions`** — empty body or `{ "levelId": "bisect-demo" }` from a **server** allowlist of seed repos (our fixtures, never a learner URL).

```json
{ "id": "vm_…", "expiresAt": "2026-09-12T14:20:00.000Z", "idleSec": 300 }
```

**`POST /sessions/:id/exec`**

```json
{ "argv": ["git", "status", "--short"] }
```

or `{ "argv": ["status", "--short"] }` — impl picks one and documents it. **No** `cmd` string. **No** `shell: true`.

```json
{ "ok": true, "exitCode": 0, "stdout": "…", "stderr": "", "truncated": false }
```

Stdout/stderr cap: **8 000** chars combined (same order as Pyodide). Over → `truncated: true`, rest dropped.

**`DELETE`** — `200` `{ "ok": true }` even if already dead (idempotent). Foreign `:id` → `404` (do not 403 “not yours”).

**Rate / concurrency** (D6 — proposed):

| Control | Cap |
|---------|-----|
| Create / IP | 6 / hour |
| Create / user | 4 / hour |
| Exec / session | 40 / minute |
| Concurrent sessions | 1 / user, 2 / IP |
| Absolute TTL | 20 minutes from create |
| Idle kill | 5 minutes since last exec or create |
| Exec wall clock | 8 seconds |
| argv[0] | `git` only |
| argv length | ≤ 16 entries, each ≤ 256 chars |

Create over cap → `429`. Concurrent → `409`.

### 2.3 Data model

Minimal bookkeeping only. **Not** a command log.

```sql
CREATE TABLE IF NOT EXISTS git_vm_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  provider_handle TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  last_exec_at TEXT,
  killed_at TEXT
);
CREATE INDEX IF NOT EXISTS git_vm_sessions_user_idx ON git_vm_sessions(user_id);
```

- Delete or mark `killed_at` on TTL / idle / `DELETE`. Sweep on create and on a cheap interval.
- Do **not** store argv, stdout, or repo contents in SQLite.
- `provider_handle` is an opaque id for the sidecar/provider. Not a URL with secrets.

### 2.4 Security

| Control | Requirement |
|---------|-------------|
| Egress | **Deny all** (no DNS, no HTTP, no git protocol). `fetch`/`push`/`pull`/`clone <url>` fail closed. Seed repos are **pre-baked** in the image or copied from our fixture store at create. |
| Isolation | Separate from the Next.js / SQLite process. No host mounts. No `docker.sock`. No `--privileged`. |
| Env | Empty of app secrets. No `AUTH_SECRET`, OAuth client secrets, `RAILWAY_*`, `FLY_*`, cloud keys. |
| User | Nobody / drop privileges. Read-write only inside the session workdir. |
| Resources | CPU ~0.25 share, RAM ≤ 256 MiB, disk ≤ 128 MiB. pids / processes capped. |
| Allowlist | `git` subcommands needed for lessons: `status`, `log`, `show`, `diff`, `add`, `commit`, `branch`, `switch`, `checkout`, `merge`, `rebase`, `cherry-pick`, `reset`, `stash`, `tag`, `rev-parse`, `rev-list`, `blame`, `bisect`, `restore`. **Deny:** `push`, `pull`, `fetch`, `clone`, `ls-remote`, `submodule`, `daemon`, `credential*`, `config` (except pre-seeded local config we own), `alias` `!` commands. |
| argv | Structured array only. Reject `-c`, `--exec-path`, `--git-dir` outside the workdir, `core.sshCommand`, `url.*.insteadof`. |
| Never | `bash`, `sh`, `python`, `curl`, `wget`, `nc`, `ssh`, `docker`, `sudo`, package managers. |

**Never allow:** mounting `/data` or the app repo; passing cookies into the VM; learner-supplied image names; outbound webhooks.

### 2.5 Failure modes

| Case | Status |
|------|--------|
| Flag off / unknown or foreign session | `404` |
| Not signed in | `401` |
| CSRF | `403` |
| Concurrent cap | `409` |
| Create / exec rate | `429` |
| argv rejected | `422` |
| Provider cannot start | `503` |
| Exec timeout | `504` |
| Session expired / killed | `404` (treat as gone) |

### 2.6 Observability

Log: `session_id`, `user_id`, `action` (`create`/`exec`/`kill`/`expire`/`idle_kill`), `duration_ms`, `exitCode` (exec), `provider_error` **class** (not raw provider payload if it might include tokens).

Do **not** log argv beyond the subcommand name (`git status` → `status`), stdout, or IP in cleartext (hash if needed for abuse).

Metric (cheap): active sessions, create failures, 429s. Needed for the D5 cost conversation.

### 2.7 Rollout

```
GIT_VM_ENABLED=0
# Set only after D5 is stamped — names TBD in the impl PR:
# GIT_VM_PROVIDER=sidecar|external
# GIT_VM_TTL_SEC=1200
# GIT_VM_IDLE_SEC=300
```

Frontend: Git VM chrome only on flag + `POST /sessions` not 404. Guests and flag-off keep **Git Play Lab** only. Never show both as “Coming soon VM”.

### 2.8 QA stamp criteria

**Pass**

- [ ] Flag `0`: all `/api/git-vm/*` → `404`; no VM chrome; Git Play Lab unchanged; no “Coming soon”.
- [ ] Flag `1`, signed-in: create → exec `git status` → stdout; `DELETE` → later exec `404`.
- [ ] Guest create → `401`.
- [ ] Second create while one is live → `409`.
- [ ] `argv: ["bash", "-c", "id"]` or `["git", "push"]` → `422`; no process other than git.
- [ ] From inside a crafted exec, no route to `169.254.169.254`, app `DATA_DIR`, or `docker.sock` (provider test).
- [ ] Env dump (if a test image prints env) has no `AUTH_*` / cloud tokens.
- [ ] After 20 min (or test-injected TTL) session is gone; idle 5 min kills.
- [ ] CSRF missing on create/exec/kill → `403`.
- [ ] Logs have no command line, no email, no secrets.
- [ ] Cookies unchanged.

**Fail**

- Git runs in the Next.js container with the SQLite volume visible.
- Any default egress.
- Host mount or docker.sock.
- Guest unlimited creates.
- Shell allowlisted “for debugging”.

### 2.9 Out of scope

- GitHub login, deploy keys, or “push to my fork”.
- Persistent workspaces / resume after TTL.
- Root / package install / compiling compilers.
- Pairing / share-session URLs.
- Using this sandbox for Practice Engine or AI (keep PRs separate).

### 2.10 Cost / hosting — **decision required (D5)**

Real `git` + isolation **will not** fit “one more Route Handler that `spawn('git')`” on the current Railway/Fly web service:

- That process can see `DATA_DIR`, env secrets, and the app filesystem.
- CPU burn from one learner hits the site for everyone.
- No deny-egress story without a separate network namespace.

**Pick one before writing code:**

| Option | Sketch | Tradeoff |
|--------|--------|----------|
| **A. Sidecar / sibling service** (Railway service or Fly Machine) | App talks to an internal sandbox API over private network. Sandbox image: git + fixtures, **no** public ingress, egress off. | We own ops. Need network policy + kill loop. Fine ~hundreds of short sessions if concurrency stays at 1/user. |
| **B. External sandbox provider** | Create/exec/kill via their API. We store only `provider_handle`. | Faster isolation story; **new vendor, new secrets, new DPA**. Rate-limit still on our edge. |
| **C. Defer** | Keep Git Play Lab only until budget/isolation is stamped. | Honest. No chrome. |

**Not options:** Docker socket from the web container; privileged DinD; “just use `child_process` and hope”.

Product + Security stamp A, B, or C on the Git VM PR. Backend does not start impl on a guess.

---

## 3. AI runtime (future PR — **not** the Git VM PR)

In-browser or similarly sandboxed AI **practice**. Not a second IDE. Align with the **Python Local lab** threat model already shipped.

### 3.1 Goal / non-goals

**Goal**

- Learners practice small AI-for-DE tasks (prompt → inspect output → critique) without a cloud IDE.
- **v1 preference (D7):** stay on the client — Pyodide / same-origin WASM / static fixtures — same hardening as `src/lib/lab/pyodide-client.ts` + `python-guard.ts`.
- If a **server LLM proxy** is later required: one tightly gated route, app-owned key, no tools that hit arbitrary URLs.

**Non-goals**

- Cursor / DataLab clone, agents with tools, browsing the open web.
- Storing user API keys.
- Training or fine-tuning on learner prompts.
- Shipping this in the Git VM or Practice Engine PR.

### 3.2 API sketch

#### v1 — client only (proposed)

**No new backend routes.** Feature flag can be Frontend-only (`NEXT_PUBLIC_AI_LAB=1`) **or** a tiny `GET /api/ai/status` → `{ "enabled": true }` so we can kill it without a client rebuild. If that GET exists: no CSRF, session optional, flag off → `404`.

Runtime rules = Python Local lab:

- Assets from `/public/…` (same-origin). No new CDN in CSP unless Security stamps it (`next.config.ts` today: Pyodide is local; `connect-src` is `'self'` + OAuth).
- No `micropip`, no `js` bridge, no network modules.
- Size / time / output caps: 12 k chars, 10 s, 8 k output (already in `python-guard.ts`).
- Guest OK; progress via existing `stepIndex` / localStorage.

#### v2 — server proxy (only if Product + Security stamp D7/D8)

| Method | Path | Auth | CSRF | Flag |
|--------|------|------|------|------|
| `POST` | `/api/ai/complete` | Session **required** | Yes | `AI_PROXY_ENABLED=1` |

```json
{
  "track": "ai-data-eng",
  "slug": "03-generate-sql-python-safely",
  "exerciseId": "critique-join-filter",
  "messages": [{ "role": "user", "content": "…" }]
}
```

| Cap | Value (proposed) |
|-----|------------------|
| Messages | ≤ 8 turns |
| Content / turn | ≤ 4 000 chars |
| Completion | ≤ 1 024 tokens (server-enforced) |
| Rate | 10 / min / user, 20 / min / IP |
| Timeout | 20 s → `504` |

**200:** `{ "text": "…", "truncated": false }`. Do not return provider IDs that embed keys.

Flag off / v1-only → `404`.

### 3.3 Data model

**No table in v1 or v2.** Do not create `user_api_keys`. Do not persist prompts or completions (D3-equivalent). Progress = existing `lesson_progress` only if the lesson already writes `stepIndex`.

If Product later wants a usage counter, a numeric `ai_proxy_daily` on `users` is enough — still no prompt blob.

### 3.4 Security

**Client v1 (must match Python Local lab)**

| Do | Do not |
|----|--------|
| Same-origin engine | Widen `connect-src` / `script-src` for a model CDN without a stamp |
| Import/call denylist | `subprocess`, `urllib`, `js`, `pyodide.http` |
| Time / output caps | Unbounded generation loops |
| Honest “local / in-browser” copy | “Cloud copilot” chrome |

**Proxy v2 (additional)**

| Control | Requirement |
|---------|-------------|
| Key | Server env only (`AI_PROXY_API_KEY` or vendor-specific). Never accept a user key in the body. Never write a key to SQLite or logs. |
| Egress | App server may call **one** allowlisted provider origin. The **model** gets **no tools**, no HTTP client, no webhook. |
| Prompt injection | Lesson text + learner text are **untrusted**. System prompt is short and ours. Do not concatenate “ignore previous instructions” into elevated tool rights (there are no tools). Do not put secrets, other users’ data, or env dumps in the prompt. |
| Isolation | Proxy is not the Git VM. No shared container with `git`. |
| PII | Do not send emails or cookies to the vendor. `user_id` hashed if the vendor requires an id. |

**Never allow:** tool-calling to arbitrary URLs; browsing; code-exec tools; “bring your own OpenAI key” stored on our side; logging full prompts in production.

### 3.5 Failure modes

| Case | Status |
|------|--------|
| Flag off | `404` |
| Client-only v1, someone POSTs `/api/ai/complete` | `404` |
| Guest hits v2 proxy | `401` |
| CSRF | `403` |
| Oversize / too many turns | `400` / `413` |
| Rate | `429` |
| Vendor down | `503` |
| Vendor timeout | `504` |

Client v1 failures stay **in-page** (same tone as Pyodide: “The local Python engine could not load”) — not a fake cloud outage.

### 3.6 Observability

v1: no server log required (optional `GET /status` hit count).

v2: log `user_id`, `exerciseId`, `duration_ms`, `status`, token counts if the vendor returns them. **Never** log message content, system prompt (it may be tuned and is unnecessary), or the API key.

### 3.7 Rollout

```
# v1 chrome (optional; Frontend may use a public flag)
NEXT_PUBLIC_AI_LAB=0

# v2 only after a dedicated Security stamp
AI_PROXY_ENABLED=0
# AI_PROXY_API_KEY=   # server only, never NEXT_PUBLIC_*
```

Enable v1 without v2. Enabling v2 without a stamp is a fail.

### 3.8 QA stamp criteria

**Pass (v1)**

- [ ] Flag off: no AI-runtime chrome; no “Coming soon”; existing AI-for-DE **copy** lessons unchanged.
- [ ] Flag on: exercise runs in-browser; no new `connect-src` host (unless stamped).
- [ ] Blocked imports still throw the local-lab message.
- [ ] Guest `stepIndex` / localStorage works; signed-in sync unchanged.
- [ ] Kid-tester / lab e2e still assert zero “Coming soon”.

**Pass (v2, if that PR exists)**

- [ ] `AI_PROXY_ENABLED=0` → `404`.
- [ ] Signed-in + CSRF + flag → 200 text; guest → `401`.
- [ ] Body with `apiKey` / `OPENAI_API_KEY` is ignored (not stored, not forwarded as the credential).
- [ ] 11th request in a minute / user → `429`.
- [ ] Production logs for a sample request show no prompt text and no key.
- [ ] No tool/URL fetch in the vendor payload (inspect the request we send).

**Fail**

- Second IDE, Git VM reuse, user-key table, CSP sneak-widen, or proxy shipped inside the Git VM PR.

### 3.9 Out of scope

- Paid tutor, chat sidebar on every lesson, RAG over private docs.
- Multi-user “team workspace”.
- Image generation / voice.
- Fine-tuning on our SQLite.
- Any Git or SQL sandbox inside the model.

---

## Stamp order

1. **This doc** — Product (goals/D1–D8), Security (shared rules + never-allow), QA (criteria readable).
2. **Practice Engine PR** — smallest; no new vendor.
3. **AI runtime PR** — client v1 unless D7 flips; proxy only with its own stamp.
4. **Git VM PR** — only after **D5** (A / B / C). Highest ops risk.

Wave A content/labs can ship without any of these flags.
