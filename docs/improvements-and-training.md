# Aurora / Daily Tech Hub — Training & Practice Improvements

**Audience:** Product, Frontend, Backend, QA, Security  
**Date:** 2026-09-12  
**Status:** Research draft (not AC until Product stamps)  
**Sources:** DataCamp DataLab, W3Schools Tryit / SQL Tryit, Databricks Academy, Codecademy DBX intro patterns; compared to current Aurora (W0–W4 content live, Databricks Practice Lab v1 in flight)

---

## 1. What peers do well

### DataCamp / DataLab
- **In-browser notebook** with SQL cells → results as tables (zero install)
- **Exercise loop:** instruction → code cell → Run → check / hint / XP
- **Curated datasets + templates** so learners never start from a blank schema
- **AI assist** (generate / fix / explain) — powerful but paid; we stay free + honest
- **Schema browser** for tables/columns while writing SQL
- Gap vs us: heavy cloud IDE; paywalls; not DE-lakehouse-first

### W3Schools Tryit / SQL Tryit
- **Split mental model:** edit SQL → **Run** → result panel
- Preloaded statement + **restore database**
- Honest empty state before first run
- Tiny local DB object (historically WebSQL; we use DuckDB-WASM)
- Gap vs us: generic SQL 101, not Spark/DBX lakehouse vocabulary

### Databricks Academy
- **Demo + Lab** pairing per topic (lecture notebook → hands-on)
- Labs mirror real workspace (Vocareum / Free Edition compute)
- Certification-shaped paths (analyst / engineer)
- Gap vs us: needs account/compute; not free forever guest-first

### Codecademy-style
- Short interactive steps, immediate feedback
- Guided “change this line” rather than open-ended notebooks first
- Gap vs us: less warehouse realism

---

## 2. Where Aurora already wins
- **100% free forever**, guest progress without signup
- **Aurora Play Lab** brand (coral/mint/sky/sun) — playful, not cyan SaaS
- **W0–W4 zero-to-hero content** across SQL / Databricks / Snowflake / Python / AI tracks (live)
- **Forward Deployed Engineer track** (`/training/forward-deployed`, 10 lessons) — customer-facing DE/AI delivery; quizzes + copy cards; no new WASM lab or header nav
- Honest chrome (“Coming soon · live Run” → Local practice lab) beats fake “cloud” claims
- Shortcuts packs (Claude / Copilot / Grok) adjacent to lessons

---

## 3. Improvement backlog (Frontend-weighted)

### P0 — in flight / stamped
| Item | Peer inspiration | Notes |
|------|------------------|-------|
| Databricks Practice Lab v1 | W3Schools SQL Tryit + DataLab SQL cell | DuckDB-WASM, Local practice lab, no real DBX creds (Product AC) |
| Entry from TryIt / track Practice CTA | Codecademy “Start exercise” | No new top-level nav |

### P1 — next after lab v1 ships
| Item | Peer inspiration | Owner hint |
|------|------------------|------------|
| **Schema sidebar** (tables/columns for seed DB) | DataLab schema browser | Frontend |
| **Restore sample DB** button | W3Schools Restore | Frontend |
| **Hint / solution reveal** after N failed runs | DataCamp hint ladder | Frontend + content |
| **Exercise checks** (assert row count / column present) | DataCamp XP checks | Frontend + light Backend |
| Phase 2 labs: Snowflake → SQL → Python | Same shell pattern | Product stamp |

### P2 — training experience
| Item | Peer inspiration | Owner hint |
|------|------------------|------------|
| Demo→Lab pairing callouts on long lessons | Databricks Academy | Product + content |
| “Practice this” deep links from News/Releases | Our #13 Continue learning | Frontend (done pattern) |
| Mobile-friendly lab (stack editor above results) | DataCamp mobile / W3 resize | Frontend |
| Optional chart cell on result set (simple) | DataLab chart cell | Frontend (later) |
| Search submit 44px hit-target + dark-mode nits | — | Frontend polish |

### Explicitly out (for now)
- Full Jupyter / Monaco IDE parity with DataLab
- Real Databricks / Snowflake cloud credentials in-browser
- Paid AI tutor clone
- Collaboration / multiplayer notebooks
- FDE v1 live cloud deploy / CRM / paid cert (lessons + quizzes only)
- FDE v1 DuckDB Practice Lab expansion (reuse DBX/SF labs; Python runtime still deferred)

---

## 4. Recommended training plan shape (product view)

Keep **one** zero-to-hero spine (already live W0–W4). Layer practice:

```
W0 foundations (SQL/Python mindset)
  └─ Practice: local SQL lab (DuckDB) on SQL + Databricks tracks
W1 cloud day-0 (DBX / SF workspace objects)
  └─ Practice: Databricks lab samples on lakehouse/SQL lessons
W2 storage & tables (Delta / SF objects)
  └─ Practice: seeded bronze→silver queries
W3 jobs / orchestration concepts
  └─ Practice: read-only SQL checks (no Jobs API in v1)
W4 capstone lesson
  └─ Practice: multi-query lab + progress checkpoint
```

**All tools later (phase 2+):** same Practice Lab shell, dialect packs:
1. Databricks (v1)  
2. Snowflake  
3. Core SQL  
4. Python (deferred — different runtime)

**FDE track (added):** Intermediate overlay after Databricks / Snowflake on the cert path. Discover → scope → integrate → deploy → secure → hand off, plus AI evals and a fictional Northwind capstone. Same guest progress model. Not a Practice Lab dialect.

---

## 5. Frontend acceptance sketch (for Product to refine)

Databricks Practice Lab v1 (already stamped) plus doc-driven P1:
1. Learner opens DBX lesson → sees **Local practice lab** (not “live workspace”)
2. Edit sample SQL → **Run** → table or clear error (W3Schools loop)
3. Optional: schema list + Restore DB
4. Guest progress marks lab step; auth sync unchanged
5. Aurora tokens + a11y labels on Run / results / restore

---

## 6. Ask for Product
- Stamp which **P1** items ride the first lab PR vs a fast follow
- Confirm phase-2 order: Snowflake → SQL → Python
- Confirm we **do not** clone DataLab AI / paid workspace — stay free + honest local lab

---

*Drafted by Frontend from competitive scan. Not a substitute for Product AC.*
