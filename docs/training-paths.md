# Training paths — overnight spine

**Audience:** Learners, Product, content authors  
**Date:** 2026-09-12  
**Status:** In-app overlay + track `orderNote`s (no new top-level nav)

This page describes the **overnight path** shipped with the ETL-builder wave. Catalog `order` numbers stay as-is; recommended reading is overlay copy.

## Path (do this in order)

```
W0  Recommended-order overlay (track blurbs / META card)
      ↓
W1  Day-0 objects (SQL joins recap · DBX workspace · SF databases/warehouses)
W2  Ingestion (SQL late-data · Autoloader · COPY/stages)
W3  Shared + tool capstones (orders → daily revenue mart)
W4  Depth (SCD, DLT, clones, Cortex vs Snowpark, …)
      ↓
Practice labs   Databricks + Snowflake + SQL foundations local labs (DuckDB-WASM)
                Honest: not a live workspace / warehouse. Python lab = team hold (do not build).
      ↓
Build ETL       One builder lesson per major tool track (W5)
      ↓
FDE track       Not on main / no open PR as of 2026-09-12.
                Slot reserved after ETL builders. Do not duplicate if a concurrent
                Forward-Deployed Engineer PR appears — stay on ETL.
```

Header nav is unchanged: News · Training · Releases · Shortcuts · Dashboard.

## Build ETL lessons (W5)

| Track | Slug | What you build |
|-------|------|----------------|
| Python | `python-etl-pipeline-builder` | extract → transform → load job (chunked extract, contracts, staging publish, CLI) |
| SQL | `sql-staging-mart-etl` | Incremental staging → DQ gates → MERGE current → `orders_daily` |
| Databricks | `dbx-medallion-etl-builder` | Autoloader bronze → silver MERGE → DQ → gold (Job-shaped) |
| Snowflake | `sf-warehouse-etl-builder` | COPY/stages → Stream/Task MERGE → Dynamic Table gold |

Each lesson: objectives, DE body, cheat-sheet TryIt cards, 3 quiz questions, ~30 min. Copy cards are honest (`Coming soon · live Run` where no lab is wired). DBX/SF builders point at the existing Practice labs on day-0 / lakehouse / architecture lessons. SQL foundations lessons that are SELECT-heavy host the same local lab on a Customers / Orders / Products seed.

## W6 — SQL foundations exercise spine

Mapped from **common SQL exercise categories** (the same topic list you see on public 101 sites such as W3Schools SQL Exercises). **Original Aurora content** — we do not copy third-party exercise wording or quiz items.

Clustered into 14 lessons on the existing `sql` track (orders 20–33, slugs `sql-ex-*`). No new header nav.

| # | Slug | W3-style categories covered |
|---|------|------------------------------|
| 1 | `sql-ex-select-syntax` | Syntax, Select, Select Distinct |
| 2 | `sql-ex-where-logic` | Where, And, Or, Not |
| 3 | `sql-ex-order-limit` | Order By, Select Top |
| 4 | `sql-ex-dml-mutations` | Insert Into, Update, Delete |
| 5 | `sql-ex-nulls` | Null Values, NULL Functions |
| 6 | `sql-ex-aggregates` | Min/Max, Count, Sum, Avg, Group By, Having |
| 7 | `sql-ex-filters-patterns` | Like, Wildcards, In, Between |
| 8 | `sql-ex-joins-union` | Aliases, Joins, Inner/Left/Right/Full/Self Join, Union |
| 9 | `sql-ex-exists-case` | Exists, Any/All, CASE |
| 10 | `sql-ex-warehouse-ctas` | Select Into, Insert Into Select, Stored Procedures |
| 11 | `sql-ex-ddl-constraints` | Create/Drop/Backup Database, Create/Drop/Alter Table, Constraints, Not Null, Unique, PK, FK, Check, Default, Create Index, Auto Increment |
| 12 | `sql-ex-dates-operators` | Dates, Operators, Comments |
| 13 | `sql-ex-safety-types` | Injection, Hosting, Data Types |
| 14 | `sql-ex-foundations-capstone` | Capstone quiz tying the clusters together |

Each lesson: objectives, original commerce examples (`lab_customers` / `lab_orders` / `lab_products`), cheat-sheet SQL, 3-question quiz (multiple choice + “pick the correct SQL”), Try again + explanation, ~15–25 min. Local Practice lab (SELECT/WITH guard) is wired on SELECT-heavy lessons; DML / DDL / CTAS / safety stay copy-only.

Register W6 files in `scripts/wave-lessons.mjs` so `generate:courses` does not wipe them.

## Where the path shows up in the app

- **Training index** — META overlay (SQL foundations + DE order / Python / DBX / SF orders + ETL spine) and a **Build ETL · four tool tracks** card (not a nav item)
- **SQL track** — Foundations exercise spine section + Analytics engineering section; **Practice · local lab** CTA
- **Track pages** — `orderNote` “Recommended order” callout on Python, SQL, Databricks, Snowflake
- **Dashboard** — same META blurb (optional overlay)
- **Related wave lessons** — Autoloader, COPY, capstones, and the shared checklist link to the builders

## FDE

A **Forward-Deployed Engineer** track is **not** on `main` and there was **no open FDE PR** when this path shipped. If one lands, do not clone it here. This wave only adds ETL builders + path docs.

## Authoring notes

- Register new wave files in `scripts/wave-lessons.mjs` so `generate:courses` does not wipe them.
- Keep slugs/orders unique (`order: 12` for this wave).
- Guest progress + Aurora tokens unchanged. No Railway deploy required for content.
