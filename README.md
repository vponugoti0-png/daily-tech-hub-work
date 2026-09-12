# Daily Tech Hub v3

**100% free forever** personal daily tech hub for data engineers — curated **News**, interactive **Training** (including Prompt Engineering + AI for DE), **Release** briefs, and a first-class **Shortcuts** workspace (keyboard · CLI · SQL · AI) with **Claude · Copilot · Grok** packs.

Visual identity: **Aurora Play Lab** (coral = go, mint = done, sky = info, sun = reward). Not a cyan-glass SaaS clone.

Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **React Three Fiber**, and **SQLite** (`better-sqlite3`) for free email/password auth + progress sync.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Production URL

Live Railway app: [https://aurora-production-d146.up.railway.app/](https://aurora-production-d146.up.railway.app/)

If teammates cannot open that link, it is usually **Railway deployment protection**, a corporate filter on `*.up.railway.app`, or an in-app browser (Slack/Teams). Use a **custom domain** and the checklist in [`DEPLOY_RAILWAY.md`](./DEPLOY_RAILWAY.md).

## E2E

Playwright smoke tests run against a **locally started** Next app (`webServer` in `playwright.config.ts`). They do **not** hit the Fly production deploy.

The config uses `npm run dev` (not `build && start`) because a full production compile is heavy here, and `next start` sets `Secure` CSRF cookies that browsers drop on `http://127.0.0.1`. `AUTH_SECRET` is generated for the webServer process if unset.

```bash
npx playwright install chromium
npm run test:e2e
# optional headed inspector
npm run test:e2e:ui
```

Coverage: native search GET form, homepage relative-time hydration, quiz submit gating, login/signup labels + failed-login `role=alert`. OAuth is skipped.

Without JavaScript, `/search` stays on the App Router Suspense fallback (`Loading search…`). The no-JS smoke still asserts `method` / `action` / `name=q` and a native `form.submit()` to `/search?q=…`. Hydrated Enter covers the visible results UI.

## Demo users (free)

Auto-seeded into `data/dth.sqlite` on first auth/progress API hit:

| Email | Password |
|-------|----------|
| `demo@dailytechhub.dev` | `demo1234` |
| `alex@example.com` | `learnfree` |

No premium tiers. Signup is only for progress sync.

```bash
npm run seed:demo   # prints credentials
```

## What’s inside

| Area | Route | Content |
|------|-------|---------|
| Today’s digest | `/` | Dense playful homepage + clear next action |
| News | `/news` | Headline, source, summary, why it matters |
| Training | `/training`… | Python · SQL · Databricks · Snowflake · **Forward Deployed Engineer** · Git · **Prompt Engineering** · **AI for DE** |
| Progress | `/dashboard` | Cert-style track % (local + synced when logged in) |
| Auth | `/login`, `/signup` | Free email/password + Google / Microsoft / X (Auth.js) |
| Releases | `/releases` | What changed + why read now |
| Shortcuts | `/shortcuts` | Filterable packs + **favorites / recents** |
| Search | `/search?q=` | Cross-content search |

### Course tracks (v3)

| Track | Lessons | Focus |
|-------|---------|--------|
| Prompt Engineering | 6 | Ask, structure, iterate, verify, safety, learning prompts |
| AI for Data Engineers | 6 | Copilot mindset, debug, safe codegen, docs/tests, tools, review |
| Python | 17 | Exercise path (None/dicts→logging, copy-only) plus contracts, typing, testing, writers, config, orchestration, perf, packaging, ETL builder |
| SQL | 20 | Exercise path (SELECT→DDL/dates), windows, incrementals, perf, modeling, DQ, CTEs, semi-structured, ETL builder |
| Databricks | 20 | Exercise path (Spark SQL→dates) plus lakehouse, Delta, Unity Catalog, Jobs, Streaming, warehouses, medallion ETL |
| Snowflake | 20 | Exercise path (SELECT→dates) plus architecture, Time Travel, Streams/Tasks, Dynamic Tables, cost, RBAC, warehouse ETL |
| Forward Deployed Engineer | 10 | Customer-facing DE/AI delivery: discover, scope, integrate, deploy, secure, hand off |
| Git (bonus) | 3 | Rebase, hygiene, bisect |

Lessons include objectives, try-it shells, **Databricks + Snowflake + SQL local practice labs** (DuckDB-WASM in-browser SQL samples — not live workspaces), Python **copyable examples only** (no runtime lab), quizzes, outlines (mobile disclosure), and progress (localStorage + SQLite when signed in).

### Shortcuts

17+ packs including **Claude**, **GitHub Copilot**, **Grok**, plus Snowflake / Databricks / Python / SQL / Git / editor / dbt / cloud CLI. Tips grouped as **keyboard / cli / sql / ai / ui**, with copy buttons, sources, **last-updated** stamps, favorites & recents.

## Auth & progress

**100% free.** Email/password and OAuth (Google, Microsoft Entra ID, X/Twitter) all map into the same SQLite `users` + `lesson_progress` tables.

- SQLite DB: `data/dth.sqlite` (gitignored)
- Email/password APIs: `POST /api/auth/signup|login|logout`, `GET /api/auth/me`, `GET|POST /api/progress`
- OAuth: Auth.js / NextAuth v5 at `/api/auth/*` (App Router)
- Sessions: email/password uses short-lived httpOnly access JWT (`dth_access`, 15m) + longer refresh JWT (`dth_refresh`, 30d) with a server-side `jti` row in SQLite. Access is silently rotated from refresh on `readSession`; the refresh family rotates on use (short grace window for concurrent requests). Logout revokes the family, not only cookies. Legacy `dth_session` / refresh JWTs without `jti` are accepted once then migrated. OAuth uses Auth.js JWT. `GET /api/auth/me` accepts either and issues a CSRF cookie (`dth_csrf`) for mutating clients.
- Mutating email/password + progress routes require double-submit CSRF (`x-csrf-token`) plus a trusted Origin/Referer (`AUTH_TRUSTED_ORIGINS` + `AUTH_URL`). Login/signup are rate-limited in-memory by IP + email; `POST /api/progress` is rate-limited by IP + user id (single-node). Passwords use bcrypt cost 12 and min length 8 (`src/lib/auth/password.ts`).
- Guest progress stays in `localStorage` (`dth-progress-v3`); login merges/syncs. New tracks sync as free-text `track` + `slug` rows (shape-checked; no server allowlist). Frontend/QA: [`docs/auth-and-progress.md`](./docs/auth-and-progress.md).
- OAuth users are upserted into `users` (link by email when the provider returns one; otherwise a synthetic `@oauth.local` email). `password_hash` is nullable / unusable for OAuth-only accounts. Columns: `oauth_provider`, `oauth_subject`.

### OAuth env vars

Copy `.env.example` → `.env.local` (never commit secrets):

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Shared secret for Auth.js + email JWT (required in production) |
| `AUTH_URL` / `NEXTAUTH_URL` | App origin, e.g. `http://localhost:3000` |
| `AUTH_TRUSTED_ORIGINS` | Extra comma-separated origins allowed to POST login/signup/logout/progress (local + production hosts). `AUTH_URL` is always included. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |
| `AUTH_MICROSOFT_ENTRA_ID_ID` / `AUTH_MICROSOFT_ENTRA_ID_SECRET` / `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | Entra ID (Azure AD) app |
| `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` | X OAuth 2.0 client |

If a provider’s credentials are missing, the login/signup buttons still render with a **setup** badge and explain how to configure env — the app does **not** crash.

### Callback URLs (register in each provider console)

Local development:

- Google: `http://localhost:3000/api/auth/callback/google`
- Microsoft Entra ID: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- X (Twitter): `http://localhost:3000/api/auth/callback/twitter`

Production: same paths on your public origin (`https://YOUR_DOMAIN/api/auth/callback/...`).

### Create provider apps (follow-up for you)

1. **Google** — [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client (Web) → add the Google callback URL → copy Client ID/Secret into `AUTH_GOOGLE_*`.
2. **Microsoft** — [Entra admin center](https://entra.microsoft.com/) → App registrations → New → Web redirect URI = Microsoft callback → Certificates & secrets → set `AUTH_MICROSOFT_ENTRA_ID_*` and issuer `https://login.microsoftonline.com/<tenant-id>/v2.0` (or `/common/v2.0`).
3. **X** — [X Developer Portal](https://developer.x.com/) → Project/App → OAuth 2.0 client ID & secret → User authentication settings → callback = Twitter callback above → set `AUTH_TWITTER_*`. Email may require elevated X API access; without email we still create a unique user row.

## Content layout

```
content/
  digest.json
  news/items.json
  releases/items.json
  shortcuts/items.json
  training/{python,sql,databricks,snowflake,forward-deployed,git,prompt-engineering,ai-data-eng}/*.md
```

```bash
npm run generate:courses
npm run generate:shortcuts
npm run generate:v3          # AI tracks + Claude/Copilot/Grok packs
npm run refresh:daily        # timestamps only (preserves curated featured)
npm run refresh:daily -- --rotate
```

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 · Framer Motion · lucide-react
- `@react-three/fiber` + `@react-three/drei` + `three`
- `better-sqlite3` · `bcryptjs` · `jose` · `next-auth` (Auth.js v5)
- `gray-matter` + `remark` for Markdown lessons

## Remote

`https://github.com/vponugoti0-png/daily-tech-hub`

Do **not** push secrets; `data/*.sqlite` is local only.

## License

Personal project — use and adapt freely. **Always free.**
