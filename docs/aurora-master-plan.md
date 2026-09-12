# Aurora master plan — IA, career paths, unified practice

**Audience:** Product, UX, Frontend, Backend, Security, Content, QA  
**Date:** 2026-09-12  
**Status:** Product + user review. **Not stamped.**  
**Scope of this PR:** this document (and a pointer from [`docs/improvements-and-training.md`](./improvements-and-training.md)). No app code.

---

## Halt rule (read first)

The site feels messy because we shipped tracks, labs, overlays, and “no new nav” workarounds faster than we designed the product. **Stop merging feature / content / lab PRs** until Product and the user **accept this document** (stamp §14).

Phase 0 is this freeze. Exceptions: production incidents, security, and doc-only revisions of this plan. Wave B (`docs/wave-b-backend-ac.md`): **B1 (AI Local practice) already on `main` is OK** (#42). **B2 / B3 stay held** — this plan does not unlock them.

Tactical inventories in [`docs/training-paths.md`](./training-paths.md) and [`docs/improvements-and-training.md`](./improvements-and-training.md) remain useful as *what exists*. This file is the *what we become*. When they conflict, **this file wins** after stamp.

---

## Table of contents

1. [Halt rule](#halt-rule-read-first)
2. [Diagnosis — why it feels messy](#2-diagnosis--why-it-feels-messy)
3. [Product vision](#3-product-vision)
4. [Information architecture](#4-information-architecture)
5. [Career paths](#5-career-paths)
6. [Course model](#6-course-model)
7. [Unified Practice Editor](#7-unified-practice-editor)
8. [Backend — auth, progress, sandboxes](#8-backend--auth-progress-sandboxes)
9. [UI cleanup backlog](#9-ui-cleanup-backlog)
10. [Phased rollout](#10-phased-rollout)
11. [Competitive review](#11-competitive-review)
12. [Risks](#12-risks)
13. [Open questions for Product / UX](#13-open-questions-for-product--ux)
14. [Acceptance of this doc](#14-acceptance-of-this-doc)

---

## 2. Diagnosis — why it feels messy

Grounded in `main` as of 2026-09-12 (`src/components/Header.tsx`, `src/lib/tracks.ts`, `src/lib/types.ts`, `content/training/**`, `src/app/training/**`).

### 2.1 Six header jobs, one confused Training hub

Primary nav is **Today / Training / Shortcuts / News / Releases / Progress** — six peers of equal weight, plus Search, theme, Plain English, and Sign up. Training is a **flat hub**: eight track cards of uneven maturity, a META overlay that says “no new nav,” a practice-labs strip, a “Start here · Practice with agents” card, a shared capstone card, a Build ETL card, then a filterable lesson list. The Zero-to-Hero DE story exists as **copy overlays** (`META_DE_OVERLAY`, `orderNote`, `CERT_PATH`) rather than a first-class path. Learners cannot tell *the* next step from *a* next step.

### 2.2 Tracks of uneven maturity

| Track | Lessons (approx.) | Practice reality | Maturity |
|-------|-------------------|------------------|----------|
| Prompt Engineering | 7 | Copy-to-AI-tool + quiz. No runtime. | Thin, beginner |
| AI for Data Engineers | 8 | Copy + agent checklists. No runtime. | Thin, bolted on |
| Python | 17 | Pyodide lab on exercise-path only (`order: -7…-1`). Depth lessons are copy-to-repo. | Split personality |
| SQL | 21 | DuckDB lab on exercise path + joins + catalog. Advanced DE lessons are copy. | Split personality |
| Databricks | 21 | DuckDB lab on many slugs; still not a workspace. | Most complete tool track |
| Snowflake | 21 | DuckDB lab on many slugs; still not a warehouse. | Most complete tool track |
| Forward Deployed | 10 | Copy-to-ticket checklists. Explicitly not a lab dialect. | Intermediate overlay |
| Git | 5 | Git Play Lab (graph + CLI). Not a VM. | Bonus, different chrome |

`CERT_PATH` order is PE → AI → Python → SQL → Snowflake → Databricks → FDE → Git. That is a **cert-style overlay**, not a hireable DE sequence. A new learner who starts at “Ask better questions” never meets SELECT until they wander.

### 2.3 Lesson numbering is two catalogs glued together

Exercise-path lessons were bolted on as filename `13–20` with **negative `order`** so they sort first (`sql-select-filter-nulls` is `order: -7` in `13-select-filter-nulls.md`). Original DE lessons keep `order: 0–12` (advanced lakehouse / windows / SCD). Catalog lesson is `order: 20`. Track pages then print “Recommended order” paragraphs that contradict the numbers on the cards.

Result: the learner sees Lesson 13 as “SELECT, filters, NULLs” and Lesson 01 as “Window functions” (SQL) or “Lakehouse fundamentals” (DBX). Authors maintain three truths: **filename prefix**, **frontmatter `order`**, and **`orderNote` prose**. URLs are slug-based (`/training/sql/sql-select-filter-nulls`) and `getLesson()` already accepts legacy filename stems — the chaos is *display and authoring*, not routing.

### 2.4 Practice is four products wearing one brand

| Surface | Component | Runtime | Chrome |
|---------|-----------|---------|--------|
| Try it | `TryItBox` | None, or “Run” dispatches into `#lab` | Sparkles bar, Copy to practice vs Local lab below |
| Local Practice Lab | `LocalPracticeLab` | DuckDB-WASM (SQL/DBX/SF) or Pyodide (Python) | Schema sidebar, Restore, hint-after-fail |
| Git Play Lab | `GitPlayLab` | In-memory git engine + graph | Levels, CLI, goal tree |
| PE / AI / FDE | TryItBox + StepCards | Clipboard | “Paste into Claude / ticket” |

A lesson can show **cheat-sheet cards**, then **up to four TryItBoxes**, then a **lab**, then the **markdown body**, then a **quiz**. The Learn → Practice loop is inverted: chrome first, teaching text last. Different tracks advertise different honesty labels (“Local practice lab”, “Play Lab”, “Copy to practice”) which is correct — and still feels like four apps.

### 2.5 Shortcuts sit beside Training with no contract

`/shortcuts` is a first-class header item (17 packs: Snowflake, Databricks, Python, SQL/PySpark, Git, dbt, AWS/Azure CLI, Claude, Copilot, Grok). Lessons have their own `cheatSheet[]`. Related-training links exist from News/Releases, but Shortcuts never answer: *is this the reference for the lesson I am in, or a second curriculum?* StartHere on `/` offers “Explore shortcuts” as one of three equal doors next to “Learn SQL” and “Learn with AI prompts.”

### 2.6 Daily digest vs school, unresolved

`/` (Today) is a featured digest: news, lessons, releases, shortcuts, StartHere, track chips. That is a **hub** job. Training is a **school** job. Progress is a **transcript** job. We rendered all three as the same weight of nav, then bolted school features onto the hub. The Zero-to-Hero DE vision from chat history never became a path object — only overlays that apologize for not being nav.

**One-line diagnosis:** Aurora is a strong Play Lab shell around a pile of tracks, not a school with a path and one practice desk.

---

## 3. Product vision

### 3.1 Keep the Aurora shell

Do **not** restyle into cyan-glass SaaS. Keep **Aurora Play Lab** tokens: coral = go, mint = done, sky = info, sun = reward, violet = secondary. Guest-first, 100% free, honest “not a live warehouse / not a live Claude account.” That is the brand we already won. Cleanup is IA and lesson chrome, not a new visual identity.

### 3.2 Daily Tech Hub vs Aurora (opinionated)

| Name | Job | Where it should live |
|------|-----|----------------------|
| **Aurora** | The product learners open. School + practice desk + progress. | Header wordmark, lesson chrome, Practice Editor, Paths |
| **Daily Tech Hub** | The *daily* job: what changed in the DE/AI world today. | Home (`/`) digest, News, Releases. Subtitle, not a second product |

**Recommendation:** wordmark stays `Aurora` with a quieter `Daily Tech Hub` subtitle (already true in `Header.tsx`). Footer and README may keep “Daily Tech Hub” as the repo/site name. **Do not** run two brands in the header. Do not rename routes in Phase 1.

### 3.3 Learner jobs-to-be-done

In priority order (stamp or reorder in §13):

1. **Become hireable as a data engineer** without buying DataCamp / Academy compute — Zero→Hero path, projects, interview later.
2. **Practice the thing I just read** in the browser in under 60 seconds — one editor, one Run, one result.
3. **Skip what I already know** — experienced analysts/engineers jump to ETL / warehouse / Spark without repeating SELECT.
4. **Look up a command I will use today** — Shortcuts as reference, not a peer course.
5. **Stay current** — News + Releases as a daily digest, not a second school.
6. **Prove progress to myself (and later, a hiring manager)** — guest local progress now; signed-in sync; Phase 3 path certificates (Aurora-issued, honest, not vendor SnowPro/DBX certs).

Non-jobs (explicit): we are not a cloud warehouse, not a paid tutor, not Databricks Academy, not a general CS university, not a newsroom.

### 3.4 Product promise (one sentence)

**Aurora is a free, in-browser data-engineering school: one path from zero to hireable, one practice desk, and a daily DE digest on the side.**

---

## 4. Information architecture

### 4.1 Proposed primary nav (four items)

| Nav | Route (proposed) | Job | Phase |
|-----|------------------|-----|-------|
| **Learn** | `/training` (keep) | Tracks and lessons. The school. | 1 |
| **Practice** | `/practice` **or** Learn-first with a persistent Practice CTA | One Unified Practice Editor. Dialect picker. Deep-link `#lab` stays. | 1 |
| **Paths** | `/paths` | Zero→Hero DE + skip-ahead + (later) cert overlay. Replaces META card as the spine. | 1 chrome, 3 content-complete |
| **Progress** | `/dashboard` (keep) | Transcript of path + tracks. | 1 labels, 3 path % |

Search stays an **icon**. Sign in / Sign up stay account chrome, not nav.

### 4.2 What happens to Today / Shortcuts / News / Releases

| Current | Recommendation | Rationale |
|---------|----------------|-----------|
| **Today** (`/`) | **Not a primary nav item.** Logo click = home digest. Optional footer “Today.” | Six-item nav is the density problem. Home still exists. |
| **Shortcuts** | **Demote from primary nav.** Keep `/shortcuts`. Surface as **Reference** on Learn/lesson (pack filtered by track) and a Paths “cheatsheets” rail. | Shortcuts are a tool, not a course. Equal header weight is why the site feels like a junk drawer. |
| **News** | **Fold into Today.** Keep `/news` and `/news/[slug]` for permalinks and search. Header: gone. Home: featured headlines. | Daily Tech Hub job. |
| **Releases** | **Same as News.** Keep `/releases`. Home: “What changed.” | Same. |
| **Updates** (optional overflow) | If Product wants one bookmarkable list, a single `/updates` index that tabs News \| Releases. **Not** Phase 1 required. | Only if losing header News/Releases confuses existing users. |

**Opinion:** do not invent a fifth primary item called Updates. Logo + home sections are enough. If analytics later show News/Releases are the #1 landing job, promote **Today** back and drop Practice from the header (Practice lives on every lesson anyway). See Q1–Q3.

### 4.3 Learn hub (replace the current Training pile)

`/training` should become a **quiet catalog**, not a newsletter of overlays:

1. **Your next step** (from path position, else “Start Zero→Hero” / “Skip ahead”).
2. **Path card** — one, linking to `/paths/zero-to-hero`.
3. **Track grid** — same eight tracks, but each card shows **path level** (e.g. “L1 SQL · 21 lessons”) not a 80-word blurb plus three CTAs.
4. **Practice desk** — one button: “Open Practice” (SQL default). Not a row of five lab links.
5. Lesson search/filter **below the fold**, not competing with the path.

Kill or archive on the hub (Phase 1): META_DE_OVERLAY essay, “Start here · Practice with agents” as a hero-equivalent, Build ETL as a sibling section. Those become **nodes on the path**, not homepage modules. Deep links stay.

### 4.4 Lesson page IA (course model preview)

Canonical scroll order after Phase 2:

1. Title, level, duration, path crumb (`Zero→Hero · L1 SQL · 3/12`)
2. **Learn** — markdown teaching (move *above* the widgets)
3. **Example** — one worked snippet (today’s first TryIt / cheat-sheet entry)
4. **Practice** — Unified Practice Editor (`#lab`)
5. **Hint / Tests** — hint ladder; Check when B2 exists (omit until then — no “Coming soon”)
6. **Project** — only if the lesson is a builder/capstone; else next-lesson CTA
7. **Quiz + Complete**
8. **Reference** — remaining cheat-sheet + “Open Shortcuts pack for this tool”

Until Phase 2, Phase 1 may only restyle chrome and add crumbs; do not rewrite every lesson in the IA PR.

### 4.5 URL stability

Keep:

- `/training/[track]/[slug]`
- `/training/[track]`
- `/shortcuts`, `/news`, `/releases`, `/dashboard`, `/search`

Add (Phase 1, only after stamp):

- `/paths` and `/paths/zero-to-hero` (and later `/paths/experienced`)
- `/practice` (thin shell that loads a dialect + optional `?track=&slug=` to the same editor)

Redirects: existing `lesson-redirects.json` + `next.config.ts` + filename-stem fallback in `getLesson()`. **Slugs never change** in Phase 1–2 unless a slug is wrong; if it must, add a 301 in `lesson-redirects.json` and keep progress-key aliases in `src/lib/progress.ts`. See §6.3.

---

## 5. Career paths

### 5.1 Two doors, one school

| Path | Who | Entry |
|------|-----|-------|
| **Zero→Hero DE** | New to data work, or SQL-curious career changers | `/paths/zero-to-hero` — default StartHere |
| **Experienced skip-ahead** | Analysts / software engineers / warehouse folks | `/paths/experienced` — 6-question self-placement (not a scored exam). Jumps to the first level they mark “not yet.” |

Prompt Engineering and AI-for-DE **are not the front door** of the DE path. They are **L0 electives** (and a later “AI copilot” module after the learner can read a query). Today `FIRST_LESSON_HREF` is `pe-ask-better-questions`. That was a growth experiment; it fights JTBD #1. **Recommendation:** StartHere primary = Zero→Hero lesson 1 (docs/CLI/SQL door). PE remains a track and an elective node.

`CERT_PATH` as PE → AI → Python → SQL → SF → DBX → FDE → Git is **retired as the default spine**. It can remain a Phase 3 “Meta overlay” for people collecting every track, not the hire path.

### 5.2 Zero→Hero DE — levels

Map **existing tracks into levels**. Do not create eight new tracks. Gaps are called out; they are **not** Phase 1 build items.

| Level | Name | Learner outcome | Existing content to map | Gap |
|-------|------|-----------------|-------------------------|-----|
| **L0** | Fundamentals | Files vs tables, grain, CLI comfort, read a README, first git commit *concept* | Thin: jargon chips, Git lesson 1 concepts, PE “ask better questions” as optional. **No dedicated track.** | **Docs fundamentals** (README, design-doc, ticket writing). **Linux/CLI** (pipes, cwd, env). **How a warehouse differs from Excel.** |
| **L1** | SQL | Write SELECT → joins → aggregates → a staging filter without fear | SQL exercise path (`order: -7…-1`) + `sql-joins-set-logic-recap` | None for v1. Windows/CTEs wait for L3. |
| **L2** | Python | Dicts/rows → functions → pathlib → exceptions → logging a job | Python exercise path | None for v1. Typing/testing wait for L3. |
| **L3** | ETL / ELT | Incremental load, DQ gate, MERGE/idempotent write, one builder | SQL incrementals / DQ / `sql-staging-mart-etl`; Python contracts / writers / `python-etl-pipeline-builder` | **dbt** is only a Shortcuts pack — decide Q8. Orchestration is one Python “hooks” lesson. |
| **L4** | Cloud warehouse | Objects, COPY/stages, cost, RBAC mental model, one warehouse ETL | Snowflake day-0 → COPY → Streams/Tasks or DT → `sf-warehouse-etl-builder` | **AWS** (S3 + IAM for stages) is Shortcuts-only (`aws-azure-cli-de`). No Azure/GCP track. |
| **L5** | Spark / DBX | Spark SQL, Delta, medallion, Autoloader, one Job-shaped builder | DBX exercise path + lakehouse + Autoloader + `dbx-medallion-etl-builder` | Streaming / DLT as **electives**, not required for Hero. |
| **L6** | Projects | One shared mart + one tool capstone + (optional) FDE Northwind | `sql-shared-capstone-checklist`, SF/DBX/Python capstones, FDE `fde-capstone-engagement` | Portfolio write-up template (docs gap). |
| **L7** | Interview | Talk a pipeline, SQL take-home, “debug this late data” | **Nothing.** Quizzes are concept checks. | **Entire level.** Do not fake it with “Coming soon.” |

Git Play Lab sits as **L0–L3 skill**, not a terminal path node. FDE is an **L6 elective** (customer-facing) after the learner can ship a mart — not a required Hero gate.

### 5.3 Skip-ahead (experienced)

Self-placement statements (yes / not yet). First “not yet” is the landing level.

1. I can write a JOIN and explain NULL. → else L1  
2. I can write a 50-line Python transform with pathlib and logging. → else L2  
3. I have shipped an incremental MERGE or dbt incremental. → else L3  
4. I have loaded a warehouse stage / COPY or equivalent. → else L4  
5. I have written Spark SQL or a Delta MERGE. → else L5  
6. I can describe a mart I shipped and the DQ that guards it. → else L6  

No score, no gate. Progress still records completed slugs; the path just highlights the resume point.

### 5.4 How tracks appear inside levels

A level is an **ordered list of slugs** (plus optional “read the Shortcuts pack”). Example L1 (illustrative, not a content rewrite):

1. `sql-select-filter-nulls`  
2. `sql-dml-write-path`  
3. `sql-aggregates-group-having`  
4. `sql-patterns-aliases-case`  
5. `sql-exists-any-all`  
6. `sql-ddl-constraints`  
7. `sql-dates-injection`  
8. `sql-joins-set-logic-recap`  

L1 does **not** include windows, SCD, or the ETL builder. Those stay on the SQL *track* for people browsing by tool, and they appear on L3+.

**Dual navigation is allowed:** Path (pedagogy) and Track (tool catalog). Cards on `/training/sql` should show a **path badge** (“L1 · required” / “L3 · later”) so the catalog is not a junk drawer.

### 5.5 Explicit gaps (do not silently fill)

| Gap | Why it matters for DE hireability | Plan |
|-----|-----------------------------------|------|
| **AWS (S3, IAM, Glue mental model)** | Stages, Autoloader, “where does the file live?” | Shortcuts pack exists. **No track until this plan is stamped and L0–L5 existing slugs are reordered.** If added: L4 elective, not a ninth header track. |
| **Docs fundamentals** | FDE and staff DEs write more docs than Spark | L0 short lesson series (3). Original writing. |
| **Linux / CLI** | Every ETL job is a process | L0. Can share chrome with Git Play Lab later — still not B3. |
| **dbt** | Default ELT in many shops | Decide Q8. Prefer L3 elective track over another overlay. |
| **Interview** | JTBD #1 is incomplete without L7 | Phase 3. Original prompts, not scraped LeetCode. |
| **Vendor certs** | SnowPro / Databricks Certified | We **link out**. We do not impersonate. Aurora path cert ≠ vendor cert. |

---

## 6. Course model

### 6.1 The loop (every practice-able lesson)

```
Learn → Example → Practice → Hint → Tests → Project
```

| Step | What the learner does | What we ship | Honest fallback |
|------|----------------------|--------------|-----------------|
| **Learn** | Read 5–12 minutes. Objectives first. | Markdown body **before** widgets (Phase 2) | — |
| **Example** | See one worked query/script | Single Example card (today’s best cheat-sheet row) | — |
| **Practice** | Edit + Run in Unified Editor | Dialect adapter + seed | Copy to own tool if no runtime |
| **Hint** | After failed Run (existing `FAILED_HINT_AFTER`) | Author hint, not the solution dump | Hide until fail / click |
| **Tests** | Check (row count / columns / key values) | Wave B **B2** — omit chrome until flag on | Quiz remains the complete-path |
| **Project** | Capstone / builder only | Existing ETL builders + shared checklist | Copy-to-repo; no fake cloud deploy |

PE / FDE / some depth lessons are **Learn → Example → Copy → Quiz**. That is a valid subset. Do not put an empty editor on those pages.

### 6.2 Lesson schema (current → proposed)

Current (`TrainingLesson` in `src/lib/types.ts`): `slug`, `track`, `title`, `description`, `level`, `order`, `durationMinutes`, `topics`, `objectives`, `content`, `exercises[]`, `cheatSheet[]`, `quiz[]`, `steps[]`, `updatedAt`.

**Add (Phase 2 content work; schema may land in Phase 1 types-only):**

| Field | Purpose |
|-------|---------|
| `pathLevel` | `L0`…`L7` or `elective` |
| `pathOrder` | Integer **inside the level** (1, 2, 3…). Replaces negative `order` hacks for pedagogy. |
| `catalogOrder` | Display order on the tool track (may differ from path). Migrate today’s `order` here. |
| `practice` | `{ dialect, entry?: boolean }` — which Unified Editor adapter; omit if copy-only |
| `example` | One `{ title, code, note }` — the Example step. May alias `cheatSheet[0]`. |
| `project` | Optional `{ title, brief, deliverable }` for builders |
| `asserts` | B2 only; shape already sketched in Wave B. Do not populate until B2. |
| `shortcutPack` | Optional `/shortcuts/[slug]` for the Reference rail |

**Deprecate for authors:** filename prefixes as meaning (`13-` vs `01-`). New files: `slug.md` **or** keep numeric prefixes as *pathOrder* after a one-time rename — but **URLs stay slugs**.

`steps[]` already derives Learn / Practice lab / Exercises / Quiz / Complete. Align IDs with the loop: `learn`, `example`, `lab`, `hint`, `quiz`, `project`, `complete`.

### 6.3 Renumber / reorder without breaking URLs

**Invariant:** the public ID is `track + slug`. Progress keys are `track:slug`. Do not rename slugs to make numbers pretty.

| Lever | Use it for | Do not use it for |
|-------|------------|-------------------|
| `pathOrder` / `pathLevel` | Pedagogy | URLs |
| `catalogOrder` | Track index sorting | URLs |
| Filename prefix | Author convenience only | Routing (already true) |
| `lesson-redirects.json` | Old slug or old filename-URL → canonical slug | Cosmetic number changes |
| `getLesson()` stem fallback | `/training/sql/13-select-filter-nulls` still resolves | New public links (always emit slugs) |
| `progress.ts` aliases | If a slug *must* change | Routine reorder |

**Phase 2 migration recipe (when stamped):**

1. Freeze slugs.  
2. Write a path manifest (`content/paths/zero-to-hero.json` or equivalent) listing slugs per level.  
3. Backfill `pathLevel` / `pathOrder` / `catalogOrder` on frontmatter.  
4. Stop using negative `order`. Keep `order` as an alias of `catalogOrder` until one cleanup PR.  
5. Optional: rename files to `01-sql-select-filter-nulls.md` **matching pathOrder** so repo listing matches the path. Add redirects for any filename-stem URL that would 404 (stems already work if the new stem still contains the slug).  
6. Display numbers on cards come from `pathOrder` (“L1 · 3”) not from filename.

**Never** 404 a slug that is in `lesson-redirects.json` or in guest localStorage.

---

## 7. Unified Practice Editor

### 7.1 One shell

```
┌─────────────────────────────────────────────────────────────┐
│  Problem (prompt + dialect badge + Restore)                 │
├────────────────────────────┬────────────────────────────────┤
│  Editor                    │  Results (table / stdout /     │
│  (textarea v1; Monaco later│   graph / checklist)           │
│   is P2, not a Phase 1 req)│  Hints (collapsed)             │
└────────────────────────────┴────────────────────────────────┘
```

Mobile: stack **Problem → Editor → Run → Results → Hints**. 44px Run. Same tokens as Aurora Play Lab. Honest subtitle per dialect (see below).

This replaces the *visual* split between TryItBox “Run into lab” and LocalPracticeLab / GitPlayLab / checklist. Internally, adapters still call DuckDB, Pyodide, the git engine, or a checklist reducer. **One layout component.** Lesson pages mount it at `#lab`. `/practice` mounts the same component with a dialect picker.

### 7.2 Dialects (v1 adapters)

| Dialect | Label (honest) | Runtime | Source of problems |
|---------|----------------|---------|-------------------|
| `sql` | Local SQL lab · DuckDB (not your warehouse) | DuckDB-WASM | SQL exercise + catalog samples |
| `sql-dbx` | DBX-flavored SQL · local DuckDB (not a cluster) | DuckDB-WASM | Existing DBX samples; Spark-ish keywords mapped or rejected honestly |
| `sql-sf` | Snowflake-flavored SQL · local DuckDB (not a warehouse) | DuckDB-WASM | Existing SF samples; Cortex/Snowpark stay copy-only |
| `python` | Local Python lab · Pyodide (not a cloud kernel) | Pyodide | Exercise-path samples |
| `git` | Git Play Lab · in-browser graph (not GitHub) | Existing engine | `levels.ts` |
| `checklist` | Checklist practice · copy/check (not a live model) | Client state | PE / AI / FDE items |

TryItBox becomes the **Example** (or a “Load into Practice” button). It should not remain a second editor.

### 7.3 In-browser vs future VM / cloud (held)

| Stay in-browser (this plan) | Held — Wave B / later | Never (unless a new stamped doc) |
|-----------------------------|------------------------|----------------------------------|
| DuckDB-WASM SQL | B2 Check / asserts | Live Databricks / Snowflake login |
| Pyodide Python (stdlib, existing guards) | B3 Git VM (Railway sidecar) | Paid tutor, user-pasted API keys |
| Git graph + CLI sim | — | Arbitrary cloud IDE |
| Checklist / copy | — | Collaboration notebooks |
| B1 AI Local rubric (shipped #42; kill-switch `NEXT_PUBLIC_AI_LAB=0`) | — | Server-side LLM proxy |

Phase 1 Unified Editor **must not** widen CSP, add CDNs, or spawn a VM. Same-origin seeds (`src/lib/lab/seed.ts`) stay.

### 7.4 Shared behaviors

- **Restore sample DB / reset repo / reset checklist** — one control, adapter-specific.
- **Schema / file / graph sidebar** — SQL: tables/columns (already P1-shaped). Python: available names. Git: goal tree. Checklist: items.
- **Hint after N failed runs** — keep.  
- **Progress:** successful Run writes `stepIndex` only (current contract). Complete = quiz / Complete button.  
- **No “Coming soon”** for Tests or VM. Omit until flagged.

---

## 8. Backend — auth, progress, sandboxes

Backend does **not** become a new product in this plan. Phase 1 Unified Editor and the school IA reuse what is already on `main`. New APIs, cookies, or sandboxes wait for a stamp — Wave B AC for B2/B3, this file for Product non-goals. Detail for sessions and progress: [`docs/auth-and-progress.md`](./auth-and-progress.md). Wave B AC: [`docs/wave-b-backend-ac.md`](./wave-b-backend-ac.md).

### 8.1 Keep (already shipped)

| Surface | What stays |
|---------|------------|
| **Sessions** | Email/password JWT (`dth_access` / `dth_refresh`, httpOnly) + Auth.js OAuth. All signed-in routes go through `readSession`. |
| **CSRF** | Double-submit (`dth_csrf` + `x-csrf-token`) + trusted Origin/Referer. Clients use `authedFetch`. |
| **Guest progress** | `localStorage` key `dth-progress-v3`. |
| **Signed-in progress** | SQLite `lesson_progress` via `GET` / `POST /api/progress`. Keys stay `track:slug`. |
| **Merge** | Strictly-older `updatedAt` is skipped. Payload shape validation + rate-limit on progress POST (#17). |
| **Auth hardening** | Auth routes rate-limited. Passwords bcrypt cost 12. |
| **HTML cache** | Short shared cache (`s-maxage=0, stale-while-revalidate=60`) after #39/#44. Docker runner must **not** import `src/` from `next.config`. |

### 8.2 Unified Practice Editor — Backend constraints

v1 practice stays **client-side**. DuckDB-WASM, Pyodide, the Git Play Lab engine, and the AI Local rubric do not need a new execute API.

| Constraint | Rule |
|------------|------|
| **Progress** | Reuse `track` / `slug` + `stepIndex` / quiz fields. **No new progress tables** for v1 Tryit. |
| **Seeds** | Same-origin fixtures. Restore = client seed reset. **No remote DB.** |
| **Run → results** | W3-style loop does **not** need new APIs in Phase 1. |

Phase 1 Editor work is Frontend + Content. Backend’s job is: do not invent a grade / proxy / sandbox to “support” the shell.

### 8.3 Wave B (held — see [`docs/wave-b-backend-ac.md`](./wave-b-backend-ac.md))

| Item | Status |
|------|--------|
| **B1 AI Local practice** | **Shipped** (#42). Client rubric. Kill-switch `NEXT_PUBLIC_AI_LAB=0`. Already on `main` is OK; this plan does not ask to revert it. |
| **B2 Practice Engine auto-check** | **Held.** Client preferred. If an API exists later: CSRF + rate-limit; fixed fixtures only; no LLM grading in v1. |
| **B3 Git Practice VM** | **Held.** D5 locked to **Railway sidecar** (separate service, deny-egress, short TTL). Never `spawn('git')` on the web/SQLite service. |
| **Cloud warehouses** | Still omit real Snowflake / Databricks credential connect. |

This plan does **not** unlock B2 or B3.

### 8.4 Explicit non-goals until plan stamp

Do not start these from an IA-cleanup or Editor PR:

- Forgot-password / email verify (Product later)
- Server-side LLM proxy
- Unconstrained grading APIs
- New cookie / session redesign

### 8.5 Backend open questions for Product

Not in the UX list (§13). Defaults until stamp:

1. **Guest vs signed-in caps if B3 ever unlocks?** **Default: decide in the B3 impl stamp**, not here. Guests stay local-only until then.  
2. **Path certificates — server-issued records (Phase 3) vs client-only badges?** **Default: wait for Phase 3.** If server-issued, reuse `readSession` + existing progress keys; do not invent a second transcript store in Phase 1.

---

## 9. UI cleanup backlog

**Plan only. No implementation in this PR.** Priority is “feels messy,” not new features.

### P0 — stop the junk-drawer feeling

| ID | Item | Notes |
|----|------|-------|
| P0-1 | **Nav density** | Cut primary nav to Learn / Practice / Paths / Progress. Logo = Today. Shortcuts/News/Releases leave the header. |
| P0-2 | **Training hub** | One next-step + one path card + quiet track grid. Remove overlay essay and stacked promo cards from above-the-fold. |
| P0-3 | **Lesson chrome order** | Teaching text before a pile of TryIt + lab + cheat-sheet (or hide extra TryIts behind Example). |
| P0-4 | **One Practice CTA language** | “Practice” everywhere. Subtitle carries DuckDB / Pyodide / graph honesty. Retire parallel “Play Lab” / “Local practice lab” / “Copy to practice” as *header* names (keep honesty in the editor chrome). |
| P0-5 | **Track cards** | Path level + lesson count + hours. Blurbs ≤ 2 lines. Badges: drop stale “New · Free” on every AI card. |

### P1 — make the school usable

| ID | Item | Notes |
|----|------|-------|
| P1-1 | **Unified Editor shell** | §7. Same layout on lesson and `/practice`. |
| P1-2 | **Path crumbs** | `Zero→Hero · L1 · 3/8` on lesson + track. |
| P1-3 | **Display numbers** | Show path/catalog numbers from schema, not filename `13`. |
| P1-4 | **Shortcuts as Reference** | Lesson rail + track “Reference” link. `/shortcuts` remains. |
| P1-5 | **Search** | Grouping already exists (lessons / news / shortcuts / releases). Add path + practice weighting; keep 44px submit. Optional ⌘K later (P2). |
| P1-6 | **StartHere** | Two doors: Zero→Hero and Skip-ahead. Shortcuts is not a door. |
| P1-7 | **Dashboard** | Path % first; track % second. META essay goes away. |

### P2 — polish (after IA feels calm)

| ID | Item | Notes |
|----|------|-------|
| P2-1 | **Dark mode nits** | Theme toggle stays. Audit coral-on-canvas contrast, code blocks, lab tables. Do not add a third theme. |
| P2-2 | **a11y** | Focus order through Editor (problem → textarea → Run → results). `aria-live` on results/errors (lab already has some). Skip-link to `#lab`. Reduce motion on TrackScene. |
| P2-3 | **Mobile lab** | Editor above results; sticky Run. |
| P2-4 | **Monaco / syntax highlight** | Optional. Textarea is enough for Phase 1. |
| P2-5 | **Chart cell** | Explicitly later. DataLab-shaped, not a differentiator. |
| P2-6 | **Command palette search** | Only if `/search` stays the no-JS source of truth. |

Out of this backlog: new tracks, B2/B3 (B1 already on main), XP/leaderboards, marketing site redesign.

---

## 10. Phased rollout

```
Phase 0  Docs / IA freeze          ← you are here
    ↓  Product + user stamp §14
Phase 1  IA + nav + Unified Editor shell
Phase 2  Content reorder (pathOrder, lesson loop)
Phase 3  Paths complete + Aurora cert overlay
```

### Phase 0 — docs / IA freeze (this PR)

- Ship this plan.  
- **No feature merge** (no new tracks, labs, overlays, Wave A content, Wave B **B2/B3** impl) until §14 is stamped.  
- Allowed: incident/security fixes; revisions to this doc.

### Phase 1 — IA + nav + unified editor shell

- Implement §4 nav and Learn hub.  
- Mount one Practice layout; wire existing DuckDB / Pyodide / Git / checklist adapters underneath.  
- Add `/paths` stub with Zero→Hero outline + skip-ahead questions (can point at **existing slugs**).  
- Redirects: none required if we keep `/training` as Learn. Add `/practice` and `/paths` as new.  
- **No** filename renames. **No** new lessons. **No** B2/B3. B1 already on `main` is OK.

### Phase 2 — content reorder

- Path manifest + frontmatter backfill.  
- Lesson page loop: Learn → Example → Practice → …  
- Optional file renames with stem/slug redirects.  
- Retire negative `order`.  
- Still no AWS/interview/dbt tracks unless Q8–Q10 say so **and** a separate content PR is scoped.

### Phase 3 — paths / certs

- Path completion % on Progress.  
- Aurora-issued path certificate (honest: “completed Aurora Zero→Hero DE,” not SnowPro).  
- L7 Interview **if** content is written.  
- Revisit `CERT_PATH` as an optional “collect all tracks” overlay.  
- Wave B **B2/B3** may start **only** if Wave B AC is still stamped and this plan’s editor shell is the only chrome. B1 already on `main` is OK.

### Merge gate

```
if (PR adds features or training content) and (this doc is not stamped):
    do not merge
```

---

## 11. Competitive review

Public sources, high-level. **No scraped curriculum.** We copy *interaction patterns*, not lesson text.

### 11.1 What each product is (cited)

| Product | What we looked at | Sources |
|---------|-------------------|---------|
| **W3Schools Tryit / SQL Tryit** | Split page: SQL statement → Run SQL → result table; sample DB; Restore Database; schema list. Historically in-browser WebSQL; Chrome removed WebSQL, so many browsers now get a **read-only** “light” editor (server Access DB). The *mental model* remains the industry default for “try SQL in the page.” | [SQL Tryit Editor](https://www.w3schools.com/sql/trysql.asp?filename=trysql_editor), [SQL Editor](https://www.w3schools.com/SQL/sql_editor.asp), [WebSQL removal reports](https://stackoverflow.com/questions/77461398/w3schools-com-features-dont-work-in-latest-chrome-version) |
| **DataCamp / DataLab** | Career tracks + in-browser notebook (Python / SQL / R). Exercise loop: instruction → cell → Run → check / hint / XP. Schema browser, curated datasets, AI assist. Free DataLab: 3 workbooks + 15 AI prompts; Premium ~$7–13/user/mo billed annually (unlimited workbooks/AI, more RAM/CPU). Courses themselves are heavily gated. | [DataLab](https://www.datacamp.com/datalab), [DataLab pricing](https://www.datacamp.com/datalab/pricing), [DataCamp pricing](https://www.datacamp.com/pricing?period=yearly&tab=workspace) |
| **Mode SQL Tutorial** (ThoughtSpot-hosted) | Browser tutorial aimed at **analysts** (Excel → SQL), not DE. Lessons include an in-page SQL editor; practice problems with “see the answer.” Schema-as-username mental model (`tutorial.table`). Separate Mode product has a serious schema browser (search, pin, sample 100 rows). | [SQL Tutorial intro](https://sqlschool.modeanalytics.com/), [TOC](https://sqlschool.modeanalytics.com/toc/), [Mode querying / schema browser](https://mode.com/help/articles/querying-data/) |
| **Codecademy** | Short interactive steps, immediate feedback, projects + quizzes, AI Learning Assistant. Learn SQL: 4 lessons / 5 projects / 4 quizzes, ~5h, completion cert on Plus/Pro. Guided “change this line” before open notebooks. Generalist CS + careers, not lakehouse DE. | [Learn SQL](https://www.codecademy.com/learn/learn-sql), [Learn Python 3](https://www.codecademy.com/learn/learn-python-3) |
| **LearnGitBranching** | 100% client-side git **visualizer** + levels. CLI + live commit graph. Sandbox + `show goal` / `show solution`. No backend, no real `git`, no GitHub. | [pcottle/learnGitBranching](https://github.com/pcottle/learngitbranching) |
| **Databricks Academy** | Role paths (Data Engineer, Analyst, ML, GenAI). Demo + Lab pairing in paid/ILT-style courses; labs need workspace / Free Edition / Vocareum-class compute. Some Fundamentals / badge quizzes are cheap or free; role pathways are free for customers and **paid for the public**. Cert exams are vendor credentials. | [Training home](https://www.databricks.com/learn/training/home), [Academy FAQ (PDF)](https://www.databricks.com/sites/default/files/2023-11/databricks-academy-faq.pdf), [Lakehouse Fundamentals / Business Leader notes](https://www.databricks.com/learn/certification/lakehouse-platform-fundamentals) |
| **Snowflake University** | On-demand Uni + **Hands-On Essentials** badge track (Warehousing → Marketplace/cost → Apps → Data Lake → Data Engineering → Data Science). Free workshops; **DORA** grades work in a real trial account. Separate SnowPro cert track (exam + ILT). | [Hands-On Essentials](https://learn.snowflake.com/en/pages/hands-on-essentials-track/), [SnowPro track](https://learn.snowflake.com/en/pages/snowpro-track) |

### 11.2 Copy / avoid / Aurora difference

| Product | Copy | Avoid | How Aurora differs |
|---------|------|-------|--------------------|
| **W3Schools Tryit** | Edit → Run → table. Restore DB. Schema list. Empty result before first run. One obvious Run control. | Generic `Customers` 101. WebSQL dead-end (we already chose DuckDB-WASM — keep it). Light/read-only surprise. Ad / upsell chrome. | DE grain, paid/pending orders, bronze/silver/gold seeds — not Northwind-for-tourists. **Free local labs that still write.** |
| **DataCamp** | Instruction → run → hint → check. Career **paths** (not a flat course grid). Curated datasets. Schema browser. | Paywalls, XP gamification as the product, cloud IDE cost, AI tutor as default. Notebook-everything. | **Free forever**, guest progress, lakehouse/warehouse vocabulary, honest local runtime. No DataLab clone. |
| **Mode SQL Tutorial** | Lesson and editor on **one page**. Analyst-plain language. “See the answer” after trying. | Analyst-only scope (no MERGE/DQ/ETL). Username-schema confusion for DE. Product-led BI funnel. | We teach **loads and contracts**, not only SELECT for charts. Same-page editor is the Mode lesson. |
| **Codecademy** | Tiny steps. Immediate feedback. Projects as first-class, not an appendix. Two doors (new vs experienced) on career paths. | Generic CS catalog gravity. Completion-cert paywall. AI assistant as a crutch before the learner runs code. | DE-focused path. Projects = marts and ETL builders we already have. AI track is elective, not the spine. |
| **LearnGitBranching** | Graph + CLI, levels, goal tree, client-only. Honesty that it is a sim. | Becoming *only* a git game. Shipping a real VM to “catch up” without a stamp (B3 is held). | Git is a **bonus skill** on a DE path (dbt/SQL branching, data diffs), not the product. |
| **Databricks Academy** | Demo + Lab pairing. Role path (Data Engineer). Capstone-shaped jobs. | Account/compute requirement. Public paywall on the real path. Vendor cert cosplay. Workspace screenshots as the only lab. | **No login to practice Spark-flavored SQL.** We say “not a cluster.” Link out for official certs. |
| **Snowflake University** | Badge sequence with proof-of-work. Warehouse → engineering ladder. Short workshops. | Requiring a trial account + DORA to learn SELECT. Marketplace/native-apps distraction for L1. Impersonating SnowPro. | Local DuckDB for L1–L4 mechanics; copy-to-trial for Streams/Tasks/DT that DuckDB cannot honor. Badges, if any, are Aurora path certs. |

### 11.3 Positioning line

**Aurora is the free, DE-first school with local labs.** Peers are either generalist and paid (DataCamp, Codecademy), vendor and account-gated (Academy, Uni), analyst-SQL (Mode), or single-mechanic toys (W3Schools, LearnGitBranching). We steal the Tryit loop and the path, and we refuse the paywall and the fake cloud.

---

## 12. Risks

| Risk | How it shows up | Mitigation |
|------|-----------------|------------|
| **Content sprawl** | Another track or wave lands before IA. Negative `order` + META cards multiply. | Halt rule. New slugs only in Phase 2+ with `pathLevel`. Track cap: do not add a ninth track without a gap stamp (AWS/dbt). |
| **Dual runtimes** | DuckDB vs Pyodide vs git engine vs future VM vs future AI model — five editors leak into the UI. | One shell (§7). Adapters behind it. B3 does not replace Play Lab; it is a flagged extra. |
| **CSP** | “Just add a CDN for Monaco / Pyodide / wasm” sneaks into Phase 1. | Same-origin only until Security stamps a host. Phase 1 Editor = textarea + existing clients. |
| **“Coming soon” relapse** | Tests, VM, AI lab, Interview, AWS track appear as disabled buttons. | Omit. Flag off = no chrome. Copy-to-practice is the fallback. Already law in Wave B; this plan extends it to IA. |
| **Overlay addiction** | Phase 1 ships `/paths` *and* leaves META_DE_OVERLAY + orderNote essays + CERT_PATH blurb. | Phase 1 deletes the hub essay. Track `orderNote` becomes a one-line “This track spans L1–L5.” |
| **URL / progress breakage** | Cosmetic renumber 404s guest progress. | Slug invariant. Redirect file + progress aliases. |
| **Brand split** | “Daily Tech Hub” and “Aurora” compete in every headline. | §3.2. Wordmark Aurora; Hub = digest. |
| **Vendor cert confusion** | Marketing says “cert path” next to Snowflake/DBX logos. | Aurora path cert ≠ SnowPro / Databricks Certified. Link out. |
| **Skip-ahead shame** | Placement feels like an exam. | Six yes/not-yet lines. No score. |
| **Wave B temptation** | Unified Editor PR “just adds Check + AI.” | Editor shell first. B1 is already on `main` (#42). B2/B3 stay separate stamped PRs. |

---

## 13. Open questions for Product / UX

Stamp answers in §14 or a short follow-up comment. Until then, the **bold** line is the plan’s default.

1. **Today in the header?** **Default: no** — logo goes home. Reopen if digest traffic is the primary job.  
2. **Practice as its own nav item?** **Default: yes** (JTBD #2). Alternative: Learn-only header + persistent “Practice” button.  
3. **Paths as nav vs a card inside Learn?** **Default: nav.** Paths are the product; burying them recreates today’s overlay.  
4. **StartHere front door:** Zero→Hero SQL/L0 vs Prompt Engineering (current `FIRST_LESSON_HREF`)? **Default: Zero→Hero.** PE remains elective.  
5. **`/practice` empty state:** last dialect vs always SQL? **Default: SQL lab** (`sql-select-filter-nulls` sample) with dialect tabs.  
6. **News/Releases permalinks** after header removal — any SEO concern that requires `/updates`? **Default: keep URLs, drop nav.**  
7. **Shortcuts favorites/recents** — stay on `/shortcuts` only, or also in the lesson Reference rail? **Default: pack link only in v1.**  
8. **dbt:** L3 elective track vs Shortcuts-only vs never? **Default: Shortcuts-only until Phase 2 is done.**  
9. **AWS:** L4 elective after reorder, or never-a-track? **Default: never in Phase 1–2.**  
10. **Interview (L7):** Phase 3 content or out of product? **Default: Phase 3, original prompts, or omit.**  
11. **Aurora path certificate visual** — badge on Progress, or wait? **Default: wait for Phase 3.**  
12. **Dark mode:** keep toggle, or lock Play Lab dark? **Default: keep toggle; P2 contrast pass.**  
13. **Three.js TrackScene** on track pages — keep, reduce, or kill for a11y/perf? **Default: keep, `prefers-reduced-motion` off.**  
14. **Guest vs signup:** any change to “optional account”? **Default: no. Progress guest-first stays.**  
15. **Wave B vs Phase 1:** may B2 start in parallel after this stamp? **Default: no. Editor shell ships first.** B1 already on `main` is OK.  
16. **Display numbers on track cards** during Phase 1 (before `pathOrder` exists)? **Default: hide numbers; show “Beginner path” / “Depth.”**  
17. **FDE required for Hero?** **Default: no — L6 elective.**  
18. **Rename Training → Learn in the UI only, keep `/training`?** **Default: yes.**

---

## 14. Acceptance of this doc

Product + user stamp required before Phase 1 work is scheduled.

| Role | Asks | Stamp (name / date) |
|------|------|---------------------|
| **User** | Halt features; this plan matches the “messy” feeling; Zero→Hero is the north star | |
| **Product** | JTBD order; nav defaults Q1–Q4; merge gate | |
| **UX** | Four-item nav; lesson loop; Editor wireframe (can be a later sketch) | |
| **Frontend** | Feasible without CSP/runtime change in Phase 1 | |
| **Content** | Willing to backfill path fields in Phase 2; no new tracks until then | |

**Stamped means:** Phase 0 ends; Phase 1 may be ticketed. **Unstamped means:** this file is the argument, not a license to build.

---

## Appendix A — current vs proposed (cheat sheet)

| | Current (`main`) | Proposed |
|--|------------------|----------|
| Header | Today Training Shortcuts News Releases Progress | Learn Practice Paths Progress |
| Spine | `CERT_PATH` + META overlay + `orderNote` | Zero→Hero levels L0–L7 + skip-ahead |
| First lesson | PE “Ask better questions” | Path L0/L1 (stamp Q4) |
| Lesson numbers | Filename 13–20 + `order: -7` vs 01–12 | `pathOrder` / `catalogOrder`; slugs stable |
| Practice | TryIt + DuckDB lab + Pyodide + Git Play + copy | One Editor, six dialects |
| Backend | Auth/progress as today; Wave B held as a block | Keep sessions / CSRF / progress; B1 on `main` OK; B2/B3 held; no new Tryit APIs (§8) |
| Shortcuts | Header peer | Reference rail + `/shortcuts` |
| News / Releases | Header peers | Today digest + permalinks |
| Feature policy | Ship waves | **No merge until stamp** |

## Appendix B — related docs

| Doc | Role after stamp |
|-----|------------------|
| This file | Product north star |
| [`training-paths.md`](./training-paths.md) | Inventory of W0–W7 / labs / FDE / Git (tactical) |
| [`improvements-and-training.md`](./improvements-and-training.md) | Older peer notes; P0/P1 lab items fold into §7–§9 |
| [`wave-b-backend-ac.md`](./wave-b-backend-ac.md) | B1 shipped (#42); B2/B3 held. See §8.3. |
| [`auth-and-progress.md`](./auth-and-progress.md) | Session + CSRF + progress keys (`track:slug`). See §8.1. |

---

*Original product writing for Aurora / Daily Tech Hub. Not a substitute for vendor curricula. Not AC until §14 is stamped.*
