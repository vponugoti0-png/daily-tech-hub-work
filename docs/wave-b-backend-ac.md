# Wave B Backend AC — B1 AI practice, B2 Practice Engine, B3 Git VM

**Audience:** Product, Backend, Security, QA  
**Date:** 2026-09-12  
**Status:** Product-stamped order and wording below. Security + QA stamp per section before the matching impl PR ships.  
**This PR:** docs only. No implementation.

Wave A (content / local labs) stays on a separate track. Wave B is three **held** surfaces. Each is its own future impl PR. Omit chrome until that flag is on — no “Coming soon”.

**Product stamp (locked):**

- **Ship order: B1 → B2 → B3.** Separate future impl PRs.
- **Still OMIT:** real Snowflake/Databricks cloud credential connect / live workspace login.
- Prefer client-side for B1/B2 so Backend may be thin (rate-limit/proxy only if needed); B3 is the heavy Backend surface.
- **Open decision:** sandbox host for B3 (Railway sidecar vs external).

Existing session / CSRF / guest progress (do not reinvent): [`docs/auth-and-progress.md`](./auth-and-progress.md). Training backlog: [`docs/improvements-and-training.md`](./improvements-and-training.md).

**Backend weight:** prefer **client-side for B1 and B2** so Backend may be thin (rate-limit / optional proxy only if needed). **B3 is the heavy Backend surface.**

---

## Shared rules (all three PRs)

Already agreed. Implementers copy these; do not weaken them in a later PR.

| Rule | What it means here |
|------|--------------------|
| Deny-by-default egress | Sandboxes and any server path have no outbound network unless a later Security stamp lists an exact host. Default is none. |
| Short TTL | VM sessions die on a timer. No long-lived learner VMs. |
| CPU / time / disk caps | Every execute path has a hard timeout and resource ceiling. |
| No secrets, no mounts | Do not inject `AUTH_*`, volume paths, `docker.sock`, or host home directories into learner runtimes. |
| Rate-limit create / grade / proxy | Session-create, any grade API, and any AI proxy are abuse surfaces. Limit **per IP** and **per user** when signed in. Reuse `src/lib/auth/rate-limit.ts` (single-node; same caveat as login/progress). |
| No “Coming soon” chrome | Flag off → route **404** (if a route exists), Frontend **omits** the control. Copy-to-practice stays as the honest fallback. |
| Cookies stay as they are | `dth_access` / `dth_refresh` remain httpOnly + `SameSite=lax`. `dth_csrf` stays JS-readable. Do not add new auth cookies. |
| CSRF on mutating routes | Same as progress: trusted Origin/Referer + `x-csrf-token` == `dth_csrf`. Clients use `authedFetch`. |
| Guest progress | Guests keep `dth-progress-v3` localStorage. Signed-in writes go through existing `POST /api/progress`. New tracks/slugs stay shape-checked free text. |

**Shared HTTP map** (if a server route exists; do not invent “501” or “coming soon” bodies):

| Status | When |
|--------|------|
| `400` | Bad JSON, missing fields, oversize body, invalid `track`/`slug` (same shape rules as progress) |
| `401` | Session required and `readSession()` is null |
| `403` | CSRF / origin fail |
| `404` | Feature flag off, or unknown exercise / session (same status — do not leak which) |
| `409` | Concurrent-session cap hit (B3) |
| `413` | Payload over the documented char/byte cap |
| `422` | Allowlist / dialect reject — safe message, no stack |
| `429` | Rate limit; send `Retry-After` |
| `503` | Sandbox / proxy provider down |
| `504` | Execute timed out |

Flag-off **404** is intentional so Frontend treats “not shipped” as absent.

**Shared observability:** log `route`, `status`, `user_id` (numeric, if signed in), `duration_ms`, `flag`, rate-limit key **type** (ip/user). **Never** log cookies, JWTs, CSRF tokens, emails, passwords, full submissions, prompts, API keys, or sandbox env. User id only — no PII.

**Shared rollout:** env gate on the Railway/Fly app service, default **off** in production. Enable **one** flag at a time in the B1 → B2 → B3 order. No new cookie. No CSP widen unless that section’s Security stamp says so.

---

## Open decisions

**Only D5 is open.** Everything else in the Product stamp is closed.

| ID | Surface | Question | Status |
|----|---------|----------|--------|
| D5 | B3 Git VM | Sandbox host | **OPEN — blocks B3 impl.** Railway sidecar vs external provider. Not `spawn('git')` on the SQLite web service. |

B3 TTL / idle / concurrency numbers in §B3.2 are **proposed defaults** for the impl PR (tune after D5), not a Product-open question.

---

## B1 — AI in-browser practice (first impl PR)

**Product stamp (wording locked):**

- Guest-usable on Prompt Eng / AI-for-DE lessons
- Prefer fully client-side (no paid tutor, no third-party API keys in browser)
- If any server proxy: rate-limit, no PII storage, no secrets in logs
- Honest chrome: Local practice — not a live Claude/GPT account
- No Coming soon; Copy remains fallback if model unavailable

### B1.1 Goal / non-goals

**Goal**

- Learners practice small AI-for-DE / prompt-engineering tasks on those tracks without a cloud IDE or a live vendor account.
- **v1:** fully client-side. Align with the existing **Python Local lab** threat model (`src/lib/lab/pyodide-client.ts`, `python-guard.ts`): same-origin assets, no `micropip` / JS bridge, no network modules, 12 k chars / 10 s / 8 k output.
- Honest label: **Local practice** — not a live Claude/GPT account.
- If the in-browser model cannot load: **Copy** (existing copy-to-practice) is the fallback. Do not show “Coming soon”.
- Guest-usable. Progress via existing `stepIndex` / localStorage; signed-in sync unchanged.

**Non-goals**

- Paid tutor, Cursor / DataLab clone, agents with tools, browsing the open web.
- Third-party API keys in the browser. User-pasted vendor keys. Storing keys on the server.
- Training or fine-tuning on learner prompts.
- Shipping this in the B2 or B3 PR.
- Real Snowflake / Databricks cloud login (omitted for all of Wave B).

### B1.2 API sketch

#### v1 — client only (stamped preference)

**No new backend routes required.** Optional kill-switch so we can disable without a client rebuild:

| Method | Path | Auth | CSRF | Flag |
|--------|------|------|------|------|
| `GET` | `/api/ai/status` | Optional | No | `AI_LAB_ENABLED=1` (or Frontend `NEXT_PUBLIC_AI_LAB=1` alone) |

Flag off → `404` if the route exists; Frontend omits AI-runtime chrome and keeps **Copy**.

Runtime = Python Local lab:

- Assets from `/public/…` (same-origin). No new CDN in CSP unless Security stamps it (`next.config.ts` today: Pyodide is local; `connect-src` is `'self'` + OAuth).
- Guest OK.

#### v2 — server proxy (only if Product + Security later stamp it)

Not in the B1 v1 PR unless that stamp exists.

| Method | Path | Auth | CSRF | Flag |
|--------|------|------|------|------|
| `POST` | `/api/ai/complete` | Session **optional** if Product later allows guest proxy; **proposed: session required** if a paid vendor key is on the server | Yes | `AI_PROXY_ENABLED=1` |

```json
{
  "track": "ai-data-eng",
  "slug": "03-generate-sql-python-safely",
  "exerciseId": "critique-join-filter",
  "messages": [{ "role": "user", "content": "…" }]
}
```

| Cap | Value (proposed, v2 only) |
|-----|---------------------------|
| Messages | ≤ 8 turns |
| Content / turn | ≤ 4 000 chars |
| Completion | ≤ 1 024 tokens (server-enforced) |
| Rate | 10 / min / user, 20 / min / IP |
| Timeout | 20 s → `504` |

**200:** `{ "text": "…", "truncated": false }`. Do not return provider IDs that embed keys.

If a proxy exists: rate-limit, **no PII storage**, **no secrets in logs**. App-owned env key only — never a user key in the body, never `NEXT_PUBLIC_*` vendor keys.

### B1.3 Data model

**No SQLite table.** Do not create `user_api_keys`. Do not persist prompts or completions. Progress = existing `lesson_progress` / localStorage only if the lesson already writes `stepIndex`.

### B1.4 Security

**Client v1 (must match Python Local lab)**

| Do | Do not |
|----|--------|
| Same-origin engine | Third-party API keys in the browser |
| Import/call denylist | `subprocess`, `urllib`, `js`, `pyodide.http` |
| Time / output caps | Unbounded generation loops |
| Honest **Local practice** copy | “Cloud copilot” / live Claude/GPT chrome |
| Copy fallback if model missing | “Coming soon” |

**Proxy v2 (additional, only if stamped)**

| Control | Requirement |
|---------|-------------|
| Key | Server env only. Never accept a user key. Never write a key to SQLite or logs. |
| Egress | App server may call **one** allowlisted provider origin. The **model** gets **no tools**, no HTTP client, no webhook. |
| Prompt injection | Lesson text + learner text are **untrusted**. System prompt is short and ours. No secrets or other users’ data in the prompt. |
| Isolation | Not the Git VM. No shared container with `git`. |
| PII | Do not store prompts. Do not send emails or cookies to the vendor. |

**Never allow:** tool-calling to arbitrary URLs; user keys in localStorage; logging full prompts or API keys.

### B1.5 Failure modes

| Case | Status / UI |
|------|-------------|
| Flag off | `404` if a route exists; **omit chrome**; Copy still works |
| In-browser model fail | In-page error (Pyodide tone); **Copy** remains usable |
| Guest hits a session-required v2 proxy | `401` |
| CSRF on v2 | `403` |
| Oversize / too many turns (v2) | `400` / `413` |
| Rate (v2) | `429` |
| Vendor down / timeout (v2) | `503` / `504` |

### B1.6 Observability

v1: no server log required (optional `GET /status` hit count).

v2: log `user_id`, `exerciseId`, `duration_ms`, `status`, token counts if returned. **Never** log message content or the API key.

### B1.7 Rollout

```
NEXT_PUBLIC_AI_LAB=0
AI_LAB_ENABLED=0
# v2 only after a dedicated Security stamp — not in B1 v1:
AI_PROXY_ENABLED=0
# AI_PROXY_API_KEY=   # server only, never NEXT_PUBLIC_*
```

Enable B1 client chrome without B2/B3. Enabling a proxy without a stamp is a fail.

### B1.8 QA stamp criteria

**Pass (v1)**

- [ ] Flag off: no AI-runtime chrome on Prompt Eng / AI-for-DE; **Copy** still present; no “Coming soon”; copy-only lessons unchanged.
- [ ] Flag on, guest: Local practice runs in-browser on those tracks; no third-party API key in the page or network panel.
- [ ] Honest chrome: “Local practice” (or equivalent) — not a live Claude/GPT account.
- [ ] Model unavailable → Copy still works; no “Coming soon”.
- [ ] No new `connect-src` host unless stamped.
- [ ] Blocked imports still throw the local-lab message (if Pyodide-backed).
- [ ] Guest `stepIndex` / localStorage works; signed-in sync unchanged.
- [ ] Cookies unchanged.

**Pass (v2, only if that later PR exists)**

- [ ] `AI_PROXY_ENABLED=0` → `404`.
- [ ] Rate-limit fires (`429` + `Retry-After`).
- [ ] Body with `apiKey` is ignored (not stored, not forwarded as the credential).
- [ ] Production logs for a sample request show no prompt text, no PII, no key.
- [ ] No tool/URL fetch in the vendor payload.

**Fail**

- Paid-tutor chrome, keys in the browser, “Coming soon”, CSP sneak-widen, or shipping B1 inside the B3 Git VM PR.

### B1.9 Out of scope

- Paid tutor, chat sidebar on every lesson, RAG over private docs.
- Multi-user workspace, image/voice generation, fine-tuning.
- Snowflake / Databricks live workspace login.
- Any Git or SQL VM inside the model.

---

## B2 — Practice Engine (auto-check) (second impl PR)

**Product stamp (wording locked):**

- Auto-check expected output for SQL (DuckDB) and Python (Pyodide) lab exercises
- Assert row count / columns / key values — not free-form LLM grading in v1
- Client-side preferred; if API: CSRF + rate-limit + auth optional (guest OK)
- No remote DB, no arbitrary code exec beyond existing lab sandboxes
- Show pass/fail + hint; guest progress via existing stepIndex/quiz model

### B2.1 Goal / non-goals

**Goal**

- After **Run** in the existing DuckDB / Pyodide labs, a **Check** action compares the learner result to author-defined asserts: row count, column names, and/or key cell values.
- v1 runs **in the existing lab sandboxes** (DuckDB-WASM, Pyodide). Same fixtures, same guards (`assertSafeLabSql`, `assertSafeLabPython`).
- UI: pass/fail + author hint. Not the expected SQL/Python dump.
- Guest OK. On pass, write `stepIndex` via existing progress (localStorage / `POST /api/progress`). Quizzes remain the lesson-complete path unless Product later says otherwise.
- Backend stays thin: no API required for v1 if asserts ship with the lesson module and run on the client.

**Non-goals**

- Free-form LLM grading in v1.
- Remote warehouse / learner-uploaded datasets / URLs.
- Arbitrary shell or a new exec runtime beyond DuckDB-WASM + Pyodide.
- Permanent submission archive.
- Replacing **Run** (Check is separate).
- Real Snowflake / Databricks cloud connect.

### B2.2 API sketch

#### v1 — client only (stamped preference)

**No new backend routes.** Asserts live in repo fixtures next to samples (not as “hidden” strings that are the full solution query if we can avoid it — prefer expected shape: `rowCount`, `columns[]`, `keyValues[{col, value}]` or a checksum of canonicalized rows).

Check runs in-page after a successful local Run (or re-executes the same guarded statement). Guest / signed-in progress unchanged.

#### Optional API (only if client asserts are not enough)

Prefix: `/api/practice`. Mutating routes: CSRF + trusted origin. Auth **optional** (guest OK).

| Method | Path | Auth | CSRF | Flag |
|--------|------|------|------|------|
| `GET` | `/api/practice/exercises?track=&slug=` | Optional | No | `PRACTICE_ENGINE_ENABLED=1` |
| `POST` | `/api/practice/grade` | Optional | Yes | same |

Flag off → `404`.

**`GET` exercises** — metadata only. Never return expected rows / key values / checksums.

```json
{
  "exercises": [
    {
      "id": "sql-paid-orders-count",
      "dialect": "sql",
      "title": "Count paid orders",
      "checks": ["row_count", "columns", "key_values"]
    }
  ]
}
```

`track` / `slug`: same shape rules as progress. Unknown pair → empty list or `404` (pick one in the impl PR; do not 500).

**`POST /grade`** (only if this API exists)

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
| `source` | 12 000 chars |
| `dialect` | `sql` \| `python` |
| Body | ~16 KiB JSON |

**200** — no expected rows leaked:

```json
{
  "pass": false,
  "exerciseId": "sql-paid-orders-count",
  "checks": [
    { "id": "row_count", "pass": true },
    { "id": "columns", "pass": true },
    { "id": "key_values", "pass": false }
  ],
  "hint": "Paid orders only — filter status before counting."
}
```

Wrong answer is **200** + `pass: false`, not 4xx.

**Progress:** client calls existing `POST /api/progress` with `{ track, slug, stepIndex: 1 }` after pass (guest → localStorage). Do not add a submissions table.

**If API exists, rate limits:**

| Key | Limit |
|-----|--------|
| IP | 30 / minute |
| Signed-in user | 20 / minute |

### B2.3 Data model

**No new SQLite table in v1.**

- Assert definitions ship in the release (in-module or same-origin JSON). Expected values used by a **server** grader (if any) stay server-only.
- Pass/fail for signed-in users: existing `lesson_progress.step_index`.
- Do not add `practice_submissions`.

### B2.4 Security

| Control | Requirement |
|---------|-------------|
| Dataset | Existing same-origin lab fixtures only. No remote DB. |
| Exec | Existing sandboxes only: DuckDB-WASM (SQL) and Pyodide (Python). Same blocked keywords / imports. |
| If server grader | In-process fixture DuckDB or equivalent — **no** shell, **no** filesystem except the fixture, **no** egress, empty of `AUTH_*` / `DATA_DIR`. ≤ 5 s. Row cap 50 or checksum over that. |
| Answers | Do not render expected SQL/Python as the hint. Hint is author copy. |
| Guest | Allowed. IP rate-limit if an API exists. |

**Never allow:** `os.system`, `ATTACH` / `COPY` / `INSTALL`, remote catalogs, grading against `data/dth.sqlite`, LLM-as-judge in v1, exec beyond the two lab sandboxes.

### B2.5 Failure modes

| Case | Status / UI |
|------|-------------|
| Flag off | Omit **Check**; Run + Copy unchanged; no “Coming soon” |
| Wrong answer | In-page fail + hint; or `200` `{ pass: false }` if API |
| Unsafe SQL / Python | Same local-lab error / `422` if API |
| Oversize source (API) | `413` |
| CSRF (API) | `403` |
| Rate (API) | `429` |
| Timeout (API) | `504` |

### B2.6 Observability

Client v1: no new server logs.

If API: log `exerciseId`, `dialect`, `pass` (boolean), `duration_ms`, `user_id` if any, failed check **ids**. Do **not** log `source`, result rows, or emails.

### B2.7 Rollout

```
PRACTICE_ENGINE_ENABLED=0
# optional public kill-switch for client Check chrome:
NEXT_PUBLIC_PRACTICE_ENGINE=0
```

Ship **after B1**. Production stays off until Security + QA stamp this section. Frontend: **Check** only when the flag is on and the lesson has asserts. Otherwise omit.

### B2.8 QA stamp criteria

**Pass**

- [ ] Flag off: no Check chrome; no “Coming soon”; DuckDB / Pyodide **Run** unchanged.
- [ ] Flag on, SQL lesson: correct query → pass; wrong row count / columns / key value → fail + hint; expected query not shown.
- [ ] Flag on, Python lesson: same for a Pyodide exercise (not LLM grading).
- [ ] Guest Check works; pass writes `stepIndex` locally; signed-in sync uses existing progress API.
- [ ] `ATTACH` / multi-statement / blocked Python import still rejected by the existing sandbox.
- [ ] No remote DB traffic; no new process beyond the lab WASM runtimes (v1).
- [ ] If API exists: missing CSRF → `403`; 31st grade / minute / IP → `429`; logs have no SQL and no email.
- [ ] Cookies unchanged.

**Fail**

- LLM grading in v1, remote warehouse, submissions persisted, shell spawned, “Coming soon”, or Check shipped inside the B3 PR.

### B2.9 Out of scope

- Databricks / Snowflake **cloud** warehouses or PATs.
- Leaderboards, XP, plagiarism.
- Storing every attempt.
- Replacing DuckDB-WASM / Pyodide **Run**.

---

## B3 — Git Practice VM (third impl PR)

**Product stamp (wording locked):**

- Ephemeral real-git sandbox for Git track (beyond Play Lab A viz)
- Deny-by-default egress; short TTL; CPU/time/disk caps; rate-limit session create
- No secrets/mounts; no docker-in-docker; kill on idle/timeout
- Guest sessions OK with IP rate-limit; signed-in can have slightly higher caps
- UI: open → run git cmds → graph/state → TTL countdown → destroy

**This is the heavy Backend surface.** Separate PR from B1 and B2. **D5 (sandbox host) must be stamped before code.**

### B3.1 Goal / non-goals

**Goal**

- Learner (guest or signed-in) creates an ephemeral workspace with a **real** `git` binary — beyond the in-browser Git Play Lab graph/CLI.
- Flow: **open → run git commands → see graph/state → TTL countdown → destroy**.
- `create` → `exec` (git-only allowlist, argv not shell) → idle/TTL kill or explicit destroy.
- Deny-by-default network egress.

**Non-goals**

- Replacing Git Play Lab (it stays for viz / no-VM lessons).
- GitHub / GitLab push, SSH keys, or `git credential`.
- General-purpose Linux shell or cloud IDE.
- Docker-in-Docker, sibling abuse via `docker.sock`, host mounts.
- Persistent home directories across days.
- Snowflake / Databricks cloud login.

### B3.2 API sketch

Prefix: `/api/git-vm`. CSRF on `POST`/`DELETE`. Auth **optional** (guest OK). Ownership = session user when signed in; guests use an unguessable `id` + IP bind + existing CSRF. **Proposed: do not add a cookie.** Prefer no new cookie if that bind is enough.

| Method | Path | Auth | CSRF | Purpose |
|--------|------|------|------|---------|
| `POST` | `/api/git-vm/sessions` | Optional | Yes | Create; **rate-limited** |
| `GET` | `/api/git-vm/sessions/:id` | Owner | No | State + **TTL remaining** (for countdown) |
| `POST` | `/api/git-vm/sessions/:id/exec` | Owner | Yes | One allowlisted `git` argv |
| `DELETE` | `/api/git-vm/sessions/:id` | Owner | Yes | Destroy now |

`GET` should return enough for UI: graph/state summary **or** raw stdout from last safe `git log`/`status` — plus `expiresAt`, `idleSec`. Do not return provider internals.

Flag `GIT_VM_ENABLED=1`. Off → `404` on all four.

**`POST /sessions`** — empty body or `{ "levelId": "bisect-demo" }` from a **server** allowlist of seed repos (our fixtures, never a learner URL).

```json
{ "id": "vm_…", "expiresAt": "2026-09-12T14:20:00.000Z", "idleSec": 300 }
```

**`POST /sessions/:id/exec`**

```json
{ "argv": ["git", "status", "--short"] }
```

Structured **argv only**. No `cmd` string. No `shell: true`.

```json
{ "ok": true, "exitCode": 0, "stdout": "…", "stderr": "", "truncated": false }
```

Stdout/stderr cap: **8 000** chars combined. Over → `truncated: true`.

**`DELETE`** — `200` `{ "ok": true }` even if already dead. Foreign `:id` → `404`.

**Rate / concurrency** (proposed defaults; guests use IP buckets only):

| Control | Guest (IP) | Signed-in |
|---------|------------|-----------|
| Create | 4 / hour / IP | 8 / hour / user (and 8 / hour / IP) |
| Exec / session | 40 / minute | 40 / minute |
| Concurrent | 1 / IP | 1 / user, 2 / IP |
| Absolute TTL | 20 minutes | 20 minutes |
| Idle kill | 5 minutes | 5 minutes |
| Exec wall clock | 8 seconds | 8 seconds |

Create over cap → `429`. Concurrent → `409`.

argv: ≤ 16 entries, each ≤ 256 chars; argv[0] = `git` only.

### B3.3 Data model

Minimal bookkeeping. **Not** a command log.

```sql
CREATE TABLE IF NOT EXISTS git_vm_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  provider_handle TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  last_exec_at TEXT,
  killed_at TEXT
);
CREATE INDEX IF NOT EXISTS git_vm_sessions_user_idx ON git_vm_sessions(user_id);
CREATE INDEX IF NOT EXISTS git_vm_sessions_ip_idx ON git_vm_sessions(ip_hash);
```

- `user_id` nullable for guests.
- Sweep on create and on a cheap interval. Do **not** store argv, stdout, or repo contents.
- `provider_handle` is opaque. Not a URL with secrets.

### B3.4 Security

| Control | Requirement |
|---------|-------------|
| Egress | **Deny all** (no DNS, no HTTP, no git protocol). `fetch`/`push`/`pull`/`clone <url>` fail closed. Seed repos **pre-baked** or copied from our fixtures at create. |
| Isolation | Separate from the Next.js / SQLite process. No host mounts. No `docker.sock`. No docker-in-docker. No `--privileged`. |
| Env | Empty of app secrets (`AUTH_*`, OAuth, `RAILWAY_*`, `FLY_*`, cloud keys). |
| User | Nobody / drop privileges. Read-write only inside the session workdir. |
| Resources | CPU ~0.25 share, RAM ≤ 256 MiB, disk ≤ 128 MiB. pids capped. |
| Allowlist | `status`, `log`, `show`, `diff`, `add`, `commit`, `branch`, `switch`, `checkout`, `merge`, `rebase`, `cherry-pick`, `reset`, `stash`, `tag`, `rev-parse`, `rev-list`, `blame`, `bisect`, `restore`. **Deny:** `push`, `pull`, `fetch`, `clone`, `ls-remote`, `submodule`, `daemon`, `credential*`, `config` (except our pre-seed), `!` aliases. |
| argv | Array only. Reject `-c`, `--exec-path`, `--git-dir` outside the workdir, `core.sshCommand`, `url.*.insteadof`. |
| Never | `bash`, `sh`, `python`, `curl`, `wget`, `nc`, `ssh`, `docker`, `sudo`. |

**Never allow:** mounting `/data` or the app repo; passing cookies into the VM; learner-supplied image names; outbound webhooks.

### B3.5 Failure modes

| Case | Status |
|------|--------|
| Flag off / unknown or foreign session | `404` |
| CSRF | `403` |
| Concurrent cap | `409` |
| Create / exec rate | `429` |
| argv rejected | `422` |
| Provider cannot start | `503` |
| Exec timeout | `504` |
| Expired / destroyed | `404` |

### B3.6 Observability

Log: `session_id`, `user_id` (or `guest`), `action` (`create`/`exec`/`kill`/`expire`/`idle_kill`), `duration_ms`, `exitCode`, provider error **class**.

Do **not** log full argv (subcommand name only, e.g. `status`), stdout, emails, or IP in cleartext (hash if needed).

Metric: active sessions, create failures, 429s — needed for the D5 cost conversation.

### B3.7 Rollout

```
GIT_VM_ENABLED=0
# Set only after D5 is stamped — names TBD in the impl PR:
# GIT_VM_PROVIDER=sidecar|external
# GIT_VM_TTL_SEC=1200
# GIT_VM_IDLE_SEC=300
```

Frontend: VM chrome only on flag + create not 404. Flag-off keeps **Git Play Lab** only. UI must show **TTL countdown** and a destroy action. Never “Coming soon VM”.

### B3.8 QA stamp criteria

**Pass**

- [ ] Flag `0`: all `/api/git-vm/*` → `404`; no VM chrome; Git Play Lab unchanged; no “Coming soon”.
- [ ] Flag `1`, **guest**: create → exec `git status` → state/graph → countdown visible → destroy → later exec `404`.
- [ ] Flag `1`, signed-in: same; slightly higher create cap than guest (document the numbers).
- [ ] Second create while one is live → `409`.
- [ ] `argv: ["bash", "-c", "id"]` or `["git", "push"]` → `422`; no process other than git.
- [ ] No route to metadata IP, app `DATA_DIR`, or `docker.sock`.
- [ ] Env has no `AUTH_*` / cloud tokens.
- [ ] TTL / idle kill works (test-injected clocks OK).
- [ ] CSRF missing on create/exec/destroy → `403`.
- [ ] Logs have no command line, no email, no secrets.
- [ ] Cookies: existing auth cookies unchanged; no secret leakage.

**Fail**

- Git runs in the Next.js container with the SQLite volume visible.
- Default egress, host mount, docker-in-docker, or docker.sock.
- Unlimited guest creates.
- Shell allowlisted “for debugging”.
- Missing TTL countdown or destroy in the stamped UI flow.

### B3.9 Out of scope

- GitHub login, deploy keys, “push to my fork”.
- Persistent workspaces / resume after TTL.
- Root / package install.
- Pairing / share-session URLs.
- Using this sandbox for B1 or B2.

### B3.10 Cost / hosting — **decision required (D5)**

Real `git` + isolation **will not** fit “one more Route Handler that `spawn('git')`” on the current Railway/Fly web service:

- That process can see `DATA_DIR`, env secrets, and the app filesystem.
- CPU burn from one learner hits the site for everyone.
- No deny-egress story without a separate network namespace.

**Pick one before writing B3 code:**

| Option | Sketch | Tradeoff |
|--------|--------|----------|
| **A. Railway / Fly sidecar** (or Fly Machine) | App talks to an internal sandbox API on a private network. Sandbox image: git + fixtures, **no** public ingress, egress off. | We own ops. Need network policy + kill loop. Fine for short sessions if concurrency stays low. |
| **B. External sandbox provider** | Create/exec/kill via their API. We store only `provider_handle`. | Faster isolation; **new vendor, new secrets, new DPA**. Rate-limit still on our edge. |

**Not options:** Docker socket from the web container; privileged DinD; `child_process` on the SQLite app.

Product + Security stamp **A or B** on the B3 PR. Backend does not start impl on a guess.

---

## Stamp order

1. **This doc** — Product (order B1 → B2 → B3 and the wording above — **stamped**). Security (shared never-allow + B3 D5). QA (criteria testable).
2. **B1 impl PR** — AI in-browser practice (client-first; proxy only if separately stamped).
3. **B2 impl PR** — Practice Engine auto-check (client-first on DuckDB / Pyodide).
4. **B3 impl PR** — Git Practice VM, only after **D5** (A or B).

Wave A content/labs can ship with all Wave B flags off.
