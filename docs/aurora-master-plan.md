# Aurora master plan — IA, career paths, unified practice

**Audience:** Product, UX, Frontend, Backend, Security, Content, QA  
**Date:** 2026-09-12  
**Status:** Product + user review. **Not stamped.**  
**Scope of this PR:** this document (and a pointer from [`docs/improvements-and-training.md`](./improvements-and-training.md)). No app code.  
**Addendum:** §7 and §11 specify a **W3Schools Tryit-shaped** practice desk — in-line with seeded databases, not a second chrome. §8 is Backend (keep sessions / progress; no new Tryit APIs).

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
7. [Unified Practice Editor](#7-unified-practice-editor) — [Tryit shell](#71-one-shell-tryit-shaped) · [in line with the DB](#73-practice-in-line-with-the-database-mandate)
8. [Backend — auth, progress, sandboxes](#8-backend--auth-progress-sandboxes)
9. [UI cleanup backlog](#9-ui-cleanup-backlog)
10. [Phased rollout](#10-phased-rollout)
11. [Competitive review](#11-competitive-review) — [Tryit teardown](#113-w3schools-tryit-ux-teardown-what-feel-similar-means) · [copy vs not](#114-what-to-copy-vs-what-not-to-copy-explicit)
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

A lesson can show **cheat-sheet cards**, then **up to four TryItBoxes**, then a **lab**, then the **markdown body**, then a **quiz**. The Learn → Practice loop is inverted: chrome first, teaching text last. Different tracks advertise different honesty labels (“Local practice lab”, “Play Lab”, “Copy to practice”) which is correct — and still feels like four apps. Worse: many SQL / Databricks / Snowflake **depth** lessons have no lab at all (copy-to-warehouse only). Practice is not *in line with the database* — it is a bolted-on widget on a subset of slugs. The target is the W3Schools Tryit feeling: **one editor, one Run, one result table, schema beside you, reset when you break it** — on **every** DB lesson, against seeded tables. See §7.3 and §11.3.

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
4. **Practice** — Unified Practice Editor (`#lab`) — Tryit-shaped, **in line with the seeded DB** on every SQL / DBX / SF lesson (§7.3)
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

**North-star feel:** W3Schools SQL Tryit — *edit the statement, hit Run, see a table, peek the sample DB, restore when you wreck it* — but on the **same lesson page**, against **Aurora’s seeded DE databases**, with Aurora Play Lab chrome. Not a new-tab Tryit. Not a second “Local practice lab” card under a pile of TryItBoxes.

### 7.1 One shell (Tryit-shaped)

Desktop (SQL / DBX / SF — this is the default mental model):

```
+------------------------------------------------------------------+
| Problem (2-4 lines)  dialect badge   [Restore DB]  [Hint]        |
+---------------------------+--------------------------------------+
| Your database (schema)    | SQL Statement (editable)    [ Run ]  |
|  tables / views           |                                      |
|  columns + types          | Result                               |
|  (click to peek columns)  |  table / row count / error / empty   |
+---------------------------+--------------------------------------+
  Prev lesson                              Next lesson (#lab)
```

That is the W3Schools SQL Tryit map, folded **into** the lesson instead of `trysql.asp` in a new window:

| W3Schools SQL Tryit | Aurora Unified Editor |
|---------------------|------------------------|
| “SQL Statement” textarea | Same — one editor, one statement (or a short script) |
| **Run SQL »** | **Run** — the only primary action. 44px. Coral. |
| Result table (or “Click Run SQL…”) | Result pane. Honest empty state **before** first run. |
| “Your Database” table list | Schema sidebar from `schemaForTrack` / seeds |
| **Restore Database** | **Restore sample DB** (already exists on DuckDB labs) |
| Tutorial ❮ Previous / Next ❯ | Lesson prev/next, landing on `#lab` when the neighbor has a lab |
| Filename-preloaded statement | Lesson sample pack (one default + optional extras) |

HTML Tryit (two-pane code | iframe, orientation toggle, Spaces upsell) is the **sibling** pattern for Python: editor | stdout. Do not clone the Spaces CTA, ad rail, or “Get your own SQL server.”

Mobile: stack **Problem → Schema (collapsed) → Editor → Run → Results**. Same tokens. Textarea v1; Monaco is P2, not a Phase 1 requirement.

This **replaces** TryItBox-as-second-editor + LocalPracticeLab + (for git) a different frame. One layout component. Lesson mounts it at `#lab`. `/practice` mounts the same component with a dialect picker. **Load into Practice** on an Example card may fill the editor; it must not open a second textarea.

### 7.2 The W3Schools loop we are stealing

Public Tryit / SQL Tryit behavior we treat as the contract ([SQL Tryit](https://www.w3schools.com/sql/trysql.asp?filename=trysql_editor), [SQL Editor page](https://www.w3schools.com/SQL/sql_editor.asp), [HTML Tryit](https://www.w3schools.com/tryit/tryit.asp?filename=tryhtml_default), [SQL SELECT chapter](https://www.w3schools.com/sql/sql_select.asp), [SQL Exercises index](https://www.w3schools.com/sql/sql_exercises.asp)):

1. **Problem / text is short and above the fold of the editor.** W3Schools puts the *why* on the tutorial page (“SELECT picks columns… Demo Database: here are five Customer rows”) and the *do* in Tryit. Aurora keeps both on one page, but the editor must still look like the *do*: a preloaded statement that already runs, plus a one-line task (“Return paid `aurora_orders` newest first”).
2. **Editable code is the center.** Not a read-only snippet with Copy as the hero. The learner changes a WHERE and hits Run.
3. **One Run control.** Instant. Result replaces the empty pane. Errors are in the result pane, not a toast across the header.
4. **Results are a table** (SQL) or a result window (HTML/Python). Row count visible. “No rows” is a valid result, not a failure of the product.
5. **The database is visible.** W3Schools: Customers, Orders, Products… on the right. Aurora: `aurora_orders`, `bronze.orders`, `analytics.paid_orders` — **the same names the lesson text uses**.
6. **Reset is first-class.** After an UPDATE/DELETE (or a confused session), Restore Database returns the seed. Aurora already has this on DuckDB; it must sit next to Run, not in a footnote.
7. **Next / prev exercises.** W3Schools tutorial pages wear ❮ Previous / Next ❯ at top and bottom; each chapter’s “Try it Yourself” opens a *preloaded* Tryit for that topic. Aurora: prev/next **lessons** (already on the page) plus, inside a lesson, next/prev **samples** (today’s `<select>` of lab samples). Dense: finish Run, hit Next sample, then Next lesson. Do not invent a parallel “exercise site” like W3Schools’ fill-in-the-blank [SQL Exercises](https://www.w3schools.com/sql/sql_exercises.asp) — that is a quiz product. Our quiz stays the quiz.
8. **Empty state before first run.** W3Schools: “Click Run SQL to execute the SQL statement above.” Copy that honesty. Do not auto-run on load (surprise CPU + WASM boot). Optional: a faint “Press Run to query the sample DB” in the result pane.

Pass/fail: W3Schools Tryit does **not** grade you — it shows the table. Their *Exercises* product grades fill-in-the-blanks. Aurora v1 matches **Tryit** (run → see). Clear pass/fail is **B2 Check** when stamped — omit until then. Until B2, “clear” means: the result table either matches the problem’s implied shape or it doesn’t, and the hint names the grain/filter — not a green XP badge.

### 7.3 Practice in line with the database (mandate)

**Definition:** every SQL, Databricks, and Snowflake **lesson** ships the Unified Editor on the same page, pointed at the **seeded sample DB for that dialect**, using the same table/view names the markdown teaches. Practice is not a hub CTA, not a different layout, not “open the lab on lesson 13.”

| Today (`main`) | Target |
|----------------|--------|
| Lab allowlists: SQL ~9/21 slugs, DBX ~14/21, SF ~13/21 (`src/lib/lab/samples.ts`) | **Every** slug on those three tracks mounts `#lab` |
| TryItBox (copy or dispatch) **plus** LocalPracticeLab | **One** Tryit-shaped editor |
| Depth lessons (windows, SCD, Autoloader, COPY, Streams, Cortex…) = copy-to-warehouse | Prefer a **seeded stand-in query** that teaches the shape; copy-only only when DuckDB cannot represent the idea at all (see §7.5) |
| Catalogs/views/metrics live on `*-catalog-views-metrics` plus some day-0 labs | Those objects are **always in the sidebar** for that dialect, so any lesson can `SELECT` them |

**In line with the DB** also means the lesson text shows a **demo slice** (W3Schools “Demo Database” table of five Customer rows). Phase 2 content: one small markdown table of seed rows next to the problem, then Run against the real seed. Do not invent a second fake dataset in prose.

Python **where it fits:** exercise-path lessons already have Pyodide. Keep the same shell (problem | editor | Run | stdout). “Schema” = names in the sample (`orders`, `row`, `path`). Depth Python (contracts, packaging, Spark-testing) stays copy-to-repo unless we later seed a tiny in-memory table the script can print — not a Phase 1 build. Git / PE / FDE are not “in line with the DB”; they keep their adapters and must not grow a fake SQL pane.

### 7.4 Dialects (v1 adapters)

| Dialect | Label (honest) | Runtime | Seeded world | Tryit mapping |
|---------|----------------|---------|--------------|---------------|
| `sql` | Local SQL lab · DuckDB (not your warehouse) | DuckDB-WASM | `aurora_*` + `aurora.*` views + `metrics.*` | Classic Tryit: SELECT/DML against one sample shop |
| `sql-dbx` | DBX-flavored SQL · local DuckDB (not a cluster) | DuckDB-WASM | `bronze` / `silver` / `gold` + `workspace_objects` + `metrics.orders_daily` | Same loop; Spark-ish names (`bronze.orders`, LIMIT). Reject or no-op cluster verbs honestly |
| `sql-sf` | Snowflake-flavored SQL · local DuckDB (not a warehouse) | DuckDB-WASM | `sf_*` + `analytics.*` + `sf_account_objects` / `sf_warehouses` + `metrics.sf_daily_revenue` | Same loop; warehouse object names. Cortex / Snowpark / COPY stay stand-in or copy (§7.5) |
| `python` | Local Python lab · Pyodide (not a cloud kernel) | Pyodide | In-memory rows / stdlib files | HTML-Tryit sibling: editor \| stdout |
| `git` | Git Play Lab · in-browser graph (not GitHub) | Existing engine | Goal tree | Not a SQL Tryit |
| `checklist` | Checklist practice · copy/check (not a live model) | Client state | PE / AI / FDE items | Not a SQL Tryit |

TryItBox becomes the **Example** (“Load into Practice”) or disappears when the editor already has that statement.

**Flavor, not a second engine.** DBX and SF are **vocab + seed overlays** on DuckDB. We do not emulate Spark or a warehouse. If the learner types `COPY INTO` or `STREAM`, the result pane says that in plain English and offers the closest SELECT stand-in — never a fake success.

### 7.5 Seeded databases we already have (use them)

The schema sidebar already mirrors `src/lib/lab/seed.ts` via `src/lib/lab/schema.ts`. Phase 1–2 must **surface this as “Your database”** (W3Schools words, Aurora names) and stop treating catalogs/views/metrics as a bonus lesson only.

| Dialect | Tables / views already seeded (non-exhaustive) | Use in Tryit |
|---------|-----------------------------------------------|--------------|
| SQL | `aurora_orders`, `aurora_customers`, `aurora_order_items`, `aurora_products`; schema `aurora.orders`, view `aurora.paid_orders`; `metrics.aurora_region_revenue`; `lab_catalog_objects` | L1 SELECT → joins → catalog lesson. Every SQL depth lesson (windows, DQ, incrementals) runs **here**, not against a blank editor. |
| Databricks | `bronze_orders` / `silver_orders` / `gold_daily_orders`; `bronze.orders`, `silver.orders`, view `silver.ok_orders`, `gold.orders_daily`; `workspace_objects`; `metrics.orders_daily` | Exercise path + lakehouse + Unity-shaped names. Autoloader / Jobs / DLT lessons get a **SELECT-shaped stand-in** on bronze/silver (e.g. “this is the grain Autoloader would land”) — not a live Autoloader. |
| Snowflake | `sf_orders`, `sf_customers`, `sf_orders_history` (version column as Time Travel stand-in); `sf_account_objects`, `sf_warehouses`; `analytics.orders`, view `analytics.paid_orders`; `metrics.sf_daily_revenue` | Day-0 objects + SELECT path. COPY / Streams / Dynamic Tables / Cortex: stand-in SELECT or copy-to-trial — **no** pretend `SNOWFLAKE.CORTEX` result. |

`lab_catalog_objects` is shared. The catalog/views/metrics lessons stay as *teaching* those objects; they are not the only place the objects exist.

**Copy-only exceptions (narrow):** Snowpark Python, live Cortex, real COPY into a stage, real Autoloader file-arrival, DLT pipeline deploy, liquid clustering maintenance. Those keep Copy + an optional **read-only** demo query on the seed (“this would be the gold table after the job”). Do not show an empty editor that cannot run. Do not show “Coming soon lab.”

### 7.6 Next / prev / reset

| Control | Behavior |
|---------|----------|
| **Run** | Execute current editor text. SQL → table. Python → stdout. Git → graph. |
| **Restore sample DB** | Re-seed DuckDB. Clear result. Keep editor text (W3Schools restores data, not the statement). Python: “Reset sample” reloads the starter script. Git: existing reset. |
| **Reset statement** | Secondary. Reload the active sample’s starter SQL/Python (W3Schools has no exact twin; we add it so “I deleted the SELECT” is recoverable). |
| **Next / prev sample** | Cycle `samplesForLesson` (replace the `<select>`-only UI with explicit Next exercise / Prev). |
| **Next / prev lesson** | Existing lesson nav. If the neighbor has a lab, href includes `#lab` so the Tryit stays in the eyeline. |

Do not add W3Schools-style **Show Answer** on the Tryit itself in Phase 1 (that is their Exercises product). Hint ladder stays. B2 Check later.

### 7.7 In-browser vs future VM / cloud (held)

| Stay in-browser (this plan) | Held — Wave B / later | Never (unless a new stamped doc) |
|-----------------------------|------------------------|----------------------------------|
| DuckDB-WASM SQL (the Tryit engine) | B2 Check / asserts (pass/fail on top of Tryit) | Live Databricks / Snowflake login |
| Pyodide Python (stdlib, existing guards) | B3 Git VM (Railway sidecar) | Paid tutor, user-pasted API keys |
| Git graph + CLI sim | — | Arbitrary cloud IDE |
| Checklist / copy | — | Collaboration notebooks |
| B1 AI Local rubric (shipped #42; kill-switch `NEXT_PUBLIC_AI_LAB=0`) | — | Server-side LLM proxy |

Phase 1 Unified Editor **must not** widen CSP, add CDNs, or spawn a VM. Same-origin seeds stay. DuckDB-WASM is our answer to W3Schools’ dead WebSQL path — **writable** in every modern browser, no “light read-only Access DB” surprise.

### 7.8 Shared behaviors

- **Restore / reset** — §7.6. One Restore next to Run.
- **Schema sidebar** — always on for `sql` / `sql-dbx` / `sql-sf`. Click table → columns + types. Optional later: “sample 5 rows” (Mode/W3Schools demo table). Phase 1: names + types are enough.
- **Hint after N failed runs** — keep.
- **Progress:** successful Run writes `stepIndex` only (current contract). Complete = quiz / Complete button.
- **No “Coming soon”** for Tests, VM, or “real warehouse.” Omit until flagged.
- **One chrome.** If a lesson has a lab, it does not also grow a second TryItBox editor. Example card may **Load** into `#lab`.

### 7.9 Gap vs `main` (so Phase 2 can ticket it)

Current `LocalPracticeLab` already has Run, Restore, schema sidebar, result table, hint, honest engine labels — the **pieces** of SQL Tryit. It fails the W3Schools feeling because:

1. It sits **under** cheat-sheets + multiple TryItBoxes + then the article.  
2. Many DB lessons never mount it.  
3. Sample switching is a dense `<select>`, not next/prev exercises.  
4. Empty-state / “this is your database” copy is quieter than W3Schools’ blunt chrome.  
5. TryItBox is still a second editor.

Phase 1 = one shell that *looks* like Tryit on lessons that already have labs. Phase 2 = every remaining SQL/DBX/SF slug gets a sample against the existing seed (stand-in where needed). No new runtime.

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
| P1-1 | **Unified Editor shell** | §7. W3Schools SQL Tryit layout on lesson and `/practice`. One Run, schema, Restore, empty state. |
| P1-2 | **Path crumbs** | `Zero→Hero · L1 · 3/8` on lesson + track. |
| P1-3 | **Display numbers** | Show path/catalog numbers from schema, not filename `13`. |
| P1-4 | **Shortcuts as Reference** | Lesson rail + track “Reference” link. `/shortcuts` remains. |
| P1-5 | **Search** | Grouping already exists (lessons / news / shortcuts / releases). Add path + practice weighting; keep 44px submit. Optional ⌘K later (P2). |
| P1-6 | **StartHere** | Two doors: Zero→Hero and Skip-ahead. Shortcuts is not a door. |
| P1-7 | **Dashboard** | Path % first; track % second. META essay goes away. |
| P1-8 | **In-line DB (existing labs)** | Lessons that already have DuckDB/Pyodide: drop the second TryItBox editor; Example = Load into `#lab`. |

### P2 — polish (after IA feels calm)

| ID | Item | Notes |
|----|------|-------|
| P2-1 | **Dark mode nits** | Theme toggle stays. Audit coral-on-canvas contrast, code blocks, lab tables. Do not add a third theme. |
| P2-2 | **a11y** | Focus order through Editor (problem → textarea → Run → results). `aria-live` on results/errors (lab already has some). Skip-link to `#lab`. Reduce motion on TrackScene. |
| P2-3 | **Mobile lab** | Editor above results; sticky Run. W3Schools “change orientation” as stack vs split. |
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
Phase 2  Content reorder + in-line Tryit on every DB lesson
Phase 3  Paths complete + Aurora cert overlay
```

### Phase 0 — docs / IA freeze (this PR)

- Ship this plan.  
- **No feature merge** (no new tracks, labs, overlays, Wave A content, Wave B **B2/B3** impl) until §14 is stamped.  
- Allowed: incident/security fixes; revisions to this doc.

### Phase 1 — IA + nav + unified editor shell

- Implement §4 nav and Learn hub.  
- Mount one **Tryit-shaped** Practice layout (problem \| editor \| Run \| results \| schema \| Restore); wire existing DuckDB / Pyodide / Git / checklist adapters underneath. No new labs on depth slugs yet.  
- Add `/paths` stub with Zero→Hero outline + skip-ahead questions (can point at **existing slugs**).  
- Redirects: none required if we keep `/training` as Learn. Add `/practice` and `/paths` as new.  
- **No** filename renames. **No** new lessons. **No** B2/B3. B1 already on `main` is OK.

### Phase 2 — content reorder

- Path manifest + frontmatter backfill.  
- Lesson page loop: Learn → Example → Practice → …  
- **Every remaining SQL / Databricks / Snowflake slug** mounts the Tryit editor against the existing seed (stand-in SELECT where COPY/Autoloader/Cortex cannot run). This is the “in line with the DB” close-out.  
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

Public sources, high-level. **No scraped curriculum.** We copy *interaction patterns*, not lesson text. W3Schools Tryit is the **practice-desk** reference; the others stay path / pedagogy / vendor context.

### 11.1 What each product is (cited)

| Product | What we looked at | Sources |
|---------|-------------------|---------|
| **W3Schools Tryit / SQL Tryit** | Two related UIs. **HTML Tryit:** full-bleed workspace, toolbar **Run**, left = code, right = result iframe, draggable gutter, orientation/theme, keyboard Run (`Ctrl+Alt+R`). **SQL Tryit:** “SQL Statement” → **Run SQL »** → result table; **Your Database** list; **Restore Database**; empty state before first run; each tutorial topic preloads a statement (`trysql_select`, `trysql_delete`, …). Tutorial chapters add a **Demo Database** sample-row table + ❮ Previous / Next ❯ + “Try it Yourself.” Separate **SQL Exercises** product = MCQ / fill-in-the-blank + Show Answer (not Tryit). Historically in-browser WebSQL; Chrome removed WebSQL, so many browsers now get a **read-only** “light” editor (server Access DB). | [SQL Tryit Editor](https://www.w3schools.com/sql/trysql.asp?filename=trysql_editor), [SQL Editor](https://www.w3schools.com/SQL/sql_editor.asp), [HTML Tryit](https://www.w3schools.com/tryit/tryit.asp?filename=tryhtml_default), [Tryit overview](https://www.w3schools.com/tryit/?previewmode=true), [SQL SELECT + Demo Database](https://www.w3schools.com/sql/sql_select.asp), [SQL Exercises](https://www.w3schools.com/sql/sql_exercises.asp), [WebSQL removal reports](https://stackoverflow.com/questions/77461398/w3schools-com-features-dont-work-in-latest-chrome-version) |
| **DataCamp / DataLab** | Career tracks + in-browser notebook (Python / SQL / R). Exercise loop: instruction → cell → Run → check / hint / XP. Schema browser, curated datasets, AI assist. Free DataLab: 3 workbooks + 15 AI prompts; Premium ~$7–13/user/mo billed annually (unlimited workbooks/AI, more RAM/CPU). Courses themselves are heavily gated. | [DataLab](https://www.datacamp.com/datalab), [DataLab pricing](https://www.datacamp.com/datalab/pricing), [DataCamp pricing](https://www.datacamp.com/pricing?period=yearly&tab=workspace) |
| **Mode SQL Tutorial** (ThoughtSpot-hosted) | Browser tutorial aimed at **analysts** (Excel → SQL), not DE. Lessons include an in-page SQL editor; practice problems with “see the answer.” Schema-as-username mental model (`tutorial.table`). Separate Mode product has a serious schema browser (search, pin, sample 100 rows). | [SQL Tutorial intro](https://sqlschool.modeanalytics.com/), [TOC](https://sqlschool.modeanalytics.com/toc/), [Mode querying / schema browser](https://mode.com/help/articles/querying-data/) |
| **Codecademy** | Short interactive steps, immediate feedback, projects + quizzes, AI Learning Assistant. Learn SQL: 4 lessons / 5 projects / 4 quizzes, ~5h, completion cert on Plus/Pro. Guided “change this line” before open notebooks. Generalist CS + careers, not lakehouse DE. | [Learn SQL](https://www.codecademy.com/learn/learn-sql), [Learn Python 3](https://www.codecademy.com/learn/learn-python-3) |
| **LearnGitBranching** | 100% client-side git **visualizer** + levels. CLI + live commit graph. Sandbox + `show goal` / `show solution`. No backend, no real `git`, no GitHub. | [pcottle/learnGitBranching](https://github.com/pcottle/learngitbranching) |
| **Databricks Academy** | Role paths (Data Engineer, Analyst, ML, GenAI). Demo + Lab pairing in paid/ILT-style courses; labs need workspace / Free Edition / Vocareum-class compute. Some Fundamentals / badge quizzes are cheap or free; role pathways are free for customers and **paid for the public**. Cert exams are vendor credentials. | [Training home](https://www.databricks.com/learn/training/home), [Academy FAQ (PDF)](https://www.databricks.com/sites/default/files/2023-11/databricks-academy-faq.pdf), [Lakehouse Fundamentals / Business Leader notes](https://www.databricks.com/learn/certification/lakehouse-platform-fundamentals) |
| **Snowflake University** | On-demand Uni + **Hands-On Essentials** badge track (Warehousing → Marketplace/cost → Apps → Data Lake → Data Engineering → Data Science). Free workshops; **DORA** grades work in a real trial account. Separate SnowPro cert track (exam + ILT). | [Hands-On Essentials](https://learn.snowflake.com/en/pages/hands-on-essentials-track/), [SnowPro track](https://learn.snowflake.com/en/pages/snowpro-track) |

### 11.2 Copy / avoid / Aurora difference

| Product | Copy | Avoid | How Aurora differs |
|---------|------|-------|--------------------|
| **W3Schools Tryit** | Instant **Run**. Problem text + editable code + results pane. Visible sample DB. Restore/reset. Prev/next. Dense, preloaded exercises. Empty state before first run. One primary button. | Ads, Spaces / “Get your own SQL server” upsell. Shallow `Customers` / Alfreds Futterkiste 101 as the *curriculum*. WebSQL → silent read-only downgrade. Fill-in-the-blank Exercises as a second product. New-tab Tryit that leaves the lesson. Auto-run. XP. | **DE seeds** (`aurora_orders`, bronze/silver/gold, `analytics.*`, metric tables) — not tourist Northwind. **In-line** on the lesson (Mode’s page union Tryit’s loop). DuckDB-WASM stays **writable**. See §11.3–§11.4 and §7. |
| **DataCamp** | Instruction → run → hint → check. Career **paths**. Curated datasets. Schema browser. | Paywalls, XP as the product, cloud IDE cost, AI tutor as default. Notebook-everything. | **Free forever**, guest progress, lakehouse/warehouse vocabulary, honest local runtime. No DataLab clone. |
| **Mode SQL Tutorial** | Lesson and editor on **one page**. Analyst-plain language. “See the answer” after trying. | Analyst-only scope (no MERGE/DQ/ETL). Username-schema confusion for DE. Product-led BI funnel. | We teach **loads and contracts**, not only SELECT for charts. Same-page editor is the Mode lesson; Tryit density is the W3Schools lesson. |
| **Codecademy** | Tiny steps. Immediate feedback. Projects as first-class, not an appendix. Two doors (new vs experienced) on career paths. | Generic CS catalog gravity. Completion-cert paywall. AI assistant as a crutch before the learner runs code. | DE-focused path. Projects = marts and ETL builders we already have. AI track is elective, not the spine. |
| **LearnGitBranching** | Graph + CLI, levels, goal tree, client-only. Honesty that it is a sim. | Becoming *only* a git game. Shipping a real VM to “catch up” without a stamp (B3 is held). | Git is a **bonus skill** on a DE path (dbt/SQL branching, data diffs), not the product. |
| **Databricks Academy** | Demo + Lab pairing. Role path (Data Engineer). Capstone-shaped jobs. | Account/compute requirement. Public paywall on the real path. Vendor cert cosplay. Workspace screenshots as the only lab. | **No login to practice Spark-flavored SQL.** Tryit against `bronze.orders`, not a cluster. Link out for official certs. |
| **Snowflake University** | Badge sequence with proof-of-work. Warehouse → engineering ladder. Short workshops. | Requiring a trial account + DORA to learn SELECT. Marketplace/native-apps distraction for L1. Impersonating SnowPro. | Local DuckDB Tryit for L1–L4 mechanics; copy-to-trial for Streams/Tasks/DT that DuckDB cannot honor. Badges, if any, are Aurora path certs. |

### 11.3 W3Schools Tryit UX teardown (what “feel similar” means)

W3Schools split **teaching** and **doing** across two URLs. The SELECT chapter ([sql_select.asp](https://www.w3schools.com/sql/sql_select.asp)) is short: syntax, a **Demo Database** HTML table of `Customers` rows, then “Try it Yourself.” The Tryit ([trysql.asp](https://www.w3schools.com/sql/trysql.asp?filename=trysql_editor)) is almost *only* doing: statement, Run, result, database list, Restore.

Aurora will **not** split URLs (that is how we grew TryItBox + Lab). We steal the *doing* chrome and keep Mode’s one-page habit.

**Layout contract (SQL / DB tracks):**

```
problem / short text
    |  editable SQL
    |  Run
    |  results pane (table)
schema / sample tables  (Your database)
reset (Restore sample DB)
next / prev  (samples, then lessons)
```

That is the whole product feeling. If a learner cannot do those six things without scrolling past four other widgets, we failed.

**HTML Tryit extras we may borrow later (P2):** orientation (stack vs side-by-side), keyboard Run, gutter resize. **Not** Phase 1.

**SQL Exercises extras we do not borrow:** a second site of blanks and “Show Answer,” login-to-track-points, certificate upsell. Our quiz already covers check-understanding. B2 covers programmatic pass/fail.

**Density:** W3Schools wins because every topic has a preloaded statement that *already works*, and the next topic is one click. Aurora should feel the same on `sql-select-filter-nulls` → `sql-dml-write-path` → … and on DBX/SF twins — not “go back to Training and find the lab card.”

### 11.4 What to copy vs what not to copy (explicit)

**Copy (do these):**

| Pattern | Why it works | Aurora adaptation |
|---------|--------------|-------------------|
| Instant Run | The loop is muscle memory | One coral **Run**; result pane updates in place |
| Problem \| code \| results | Learner never wonders where to look | §7.1 shell on the lesson, not a new tab |
| Visible sample DB | You cannot query what you cannot see | Sidebar = seeded tables/views for that dialect, including catalogs/views/metrics |
| Restore / reset | Fearless DML | Restore sample DB next to Run; optional Reset statement |
| Prev / next | Density, “one more” | Next sample + next lesson `#lab` |
| Preloaded working SQL | First Run succeeds | Default sample per lesson is valid against the seed |
| Empty state | No mystery data | “Press Run to query the sample DB” |
| Demo rows in the text | W3Schools Demo Database | Phase 2: a 5-row markdown slice of `aurora_orders` / `bronze.orders` / `sf_orders` |
| Clear result (table or error) | Pass/fail-shaped without XP | Table + row count; B2 Check later for asserts |
| Writable local DB | Play, don’t spectate | DuckDB-WASM — never the WebSQL light-mode trap |

**Do not copy:**

| Anti-pattern | Why it fails us |
|--------------|-----------------|
| Ads, Spaces, “Get your own SQL server,” Spaces icon in the Tryit toolbar | We are not an upsell funnel |
| Shallow `Customers` / `Alfreds Futterkiste` as the *curriculum* | Fine as a joke seed; our grain is orders, promos, bronze/silver/gold, DQ |
| Tutorial 101 that never reaches MERGE, incrementals, or marts | That is why DE learners bounce from W3Schools |
| Silent read-only fallback | If WASM fails, say so + Copy. Do not pretend a server Access DB. |
| New-tab Tryit | That *is* our current split chrome. Kill it. |
| Fill-in-the-blank Exercises site + Show Answer as the practice desk | Quiz ≠ Tryit |
| Auto-run on page load | WASM cost + surprise |
| XP / points / “W3Schooler” progress theater | Guest `stepIndex` + quiz is enough |
| Claiming Spark/Snowflake fidelity we do not have | Honest dialect badges |

### 11.5 Positioning line

**Aurora is the free, DE-first school with a W3Schools-simple Tryit against a real-feeling DE database.** Peers are either generalist and paid (DataCamp, Codecademy), vendor and account-gated (Academy, Uni), analyst-SQL (Mode), or single-mechanic toys (W3Schools’ shallow catalog, LearnGitBranching). We steal the Tryit loop and the path, we keep practice **in line with the seeded DB**, and we refuse the paywall, the ads, and the fake cloud.

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
| **Tryit without the DB** | Pretty editor on a page with no seed / copy-only depth lessons | §7.3 mandate. Phase 1 restyles existing labs; Phase 2 wires every SQL/DBX/SF slug. |
| **W3Schools clone relapse** | Generic Customers 101, ads-adjacent density, new-tab Tryit | §11.4 do-not-copy list. DE seeds only. In-line only. |

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
19. **Every SQL / DBX / SF lesson gets a Tryit lab (Phase 2)?** Including stand-ins for COPY / Autoloader / Cortex? **Default: yes** — copy-only only for the narrow list in §7.5.  
20. **Auto-run the default sample on lab mount?** **Default: no** (W3Schools empty state; WASM cost).  
21. **W3Schools “Your database” wording vs “Sample schema”?** **Default: “Your database”** + honest subtitle (“local DuckDB seed, not a warehouse”).

---

## 14. Acceptance of this doc

Product + user stamp required before Phase 1 work is scheduled.

| Role | Asks | Stamp (name / date) |
|------|------|---------------------|
| **User** | Halt features; this plan matches the “messy” feeling; Zero→Hero is the north star | |
| **Product** | JTBD order; nav defaults Q1–Q4; merge gate | |
| **UX** | Four-item nav; lesson loop; **Tryit-shaped** Editor (problem \| code \| Run \| results \| schema \| restore) | |
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
| Practice | TryIt + DuckDB lab + Pyodide + Git Play + copy | One **Tryit-shaped** Editor; every DB lesson in line with the seed |
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
