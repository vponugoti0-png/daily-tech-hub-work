# Training paths — overnight spine

**Audience:** Learners, Product, content authors  
**Date:** 2026-09-12  
**Status:** In-app overlay + track `orderNote`s (no new top-level nav). FDE (#18), ETL builders (#19), and SQL exercise path (#22) are on `main`. Sibling exercise spines (Python + Databricks + Snowflake) follow SQL #22.

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
Practice labs   Databricks + Snowflake + SQL local labs (DuckDB-WASM)
                Honest: not a live workspace / warehouse. Python = copyable examples only (no runtime lab).
      ↓
Exercise paths  Clustered beginner lessons on SQL (#22) + DBX / SF / Python siblings.
                DBX/SF TryIt → #lab on the existing DuckDB labs. Python stays copy-only.
      ↓
Build ETL       One builder lesson per major tool track (W5)
      ↓
FDE track       `/training/forward-deployed` (10 lessons) after ETL builders.
                Customer-facing DE/AI delivery — not a new header nav item.
```

Header nav is unchanged: News · Training · Releases · Shortcuts · Dashboard.

## Build ETL lessons (W5)

| Track | Slug | What you build |
|-------|------|----------------|
| Python | `python-etl-pipeline-builder` | extract → transform → load job (chunked extract, contracts, staging publish, CLI) |
| SQL | `sql-staging-mart-etl` | Incremental staging → DQ gates → MERGE current → `orders_daily` |
| Databricks | `dbx-medallion-etl-builder` | Autoloader bronze → silver MERGE → DQ → gold (Job-shaped) |
| Snowflake | `sf-warehouse-etl-builder` | COPY/stages → Stream/Task MERGE → Dynamic Table gold |

Each lesson: objectives, DE body, cheat-sheet TryIt cards, 3 quiz questions, ~30 min. Copy cards are honest (`Copy to practice` where no lab is wired). DBX/SF builders point at the existing Practice labs on day-0 / lakehouse / architecture lessons. SQL / Databricks / Snowflake exercise-path lessons host the same **Local practice lab** shell; Python exercise-path and all ETL builders stay copy-to-repo / copy-to-warehouse.

## Exercise paths (W6 SQL · W7 siblings)

Clustered beginner lessons (catalog `13`–`19`, negative `order` so they list first). Original DE copy — not a W3Schools / external clone.

| Track | Hosts DuckDB lab? | First lesson |
|-------|-------------------|--------------|
| SQL (W6) | Yes — Practice CTA → `sql-select-filter-nulls#lab` | SELECT / filters / NULLs |
| Databricks (W7) | Yes — TryIt → `#lab` on new + existing day-0 / lakehouse labs | Spark SQL SELECT / NULLs |
| Snowflake (W7) | Yes — TryIt → `#lab` on new + existing day-0 / architecture labs | SELECT on SAMPLE |
| Python (W7) | **No** — copyable examples only (team hold) | None / dicts / rows |

DBX/SF add more sample packs on the existing DuckDB seed (bronze/silver/gold + `sf_*`). No new top-level nav, no server grading, no CSP widen.

## Where the path shows up in the app

- **Training index** — META overlay (SQL / Python / DBX / SF orders + ETL spine) and a **Build ETL · four tool tracks** card (not a nav item)
- **Track pages** — `orderNote` “Recommended order” callout on Python, SQL, Databricks, Snowflake
- **Dashboard** — same META blurb (optional overlay)
- **Related wave lessons** — Autoloader, COPY, capstones, and the shared checklist link to the builders

## FDE

A **Forward Deployed Engineer** track (`/training/forward-deployed`, 10 lessons) now sits after the ETL builders on the cert path. Same Training grid / guest progress — not a new header nav item and not a Practice Lab dialect.

## Authoring notes

- Register new wave files in `scripts/wave-lessons.mjs` so `generate:courses` does not wipe them.
- Keep slugs/orders unique (`order: 12` for this wave).
- Guest progress + Aurora tokens unchanged. No Railway deploy required for content.
