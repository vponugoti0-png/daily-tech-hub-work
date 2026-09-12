/** Wave A1 extras for Databricks, Snowflake, FDE, Git. */

const q = (question, options, answer, explanation) => ({
  question,
  options,
  answer,
  explanation,
});

const cs = (label, code, note) => ({ label, code, note });

export const WAREHOUSE_EXTRAS = {
  // --- Databricks ---
  "dbx-workspace-cluster-basics": {
    cheatSheet: [
      cs(
        "Catalog objects vs notebook path",
        "SELECT catalog, schema, table_name, layer\nFROM workspace_objects\nORDER BY layer, table_name;",
        "A notebook path is not a table. Three-level names live in the catalog.",
      ),
    ],
    quiz: [
      q(
        "A cluster is…",
        [
          "A Unity Catalog schema",
          "Compute that runs notebooks/jobs — stop it when idle so you do not burn DBUs",
          "A gold table",
          "A personal access token",
        ],
        1,
        "Compute ≠ data. Tables live in the catalog; clusters execute.",
      ),
      q(
        "Why prefer a Job cluster over an all-purpose cluster for prod?",
        [
          "Jobs cannot run SQL",
          "Job clusters start for the run and die — less leftover compute, clearer owners",
          "All-purpose clusters cannot use Spark",
          "Jobs disable logging",
        ],
        1,
        "Exploration stays on all-purpose. Prod is a Job.",
      ),
    ],
  },
  "dbx-lakehouse-fundamentals": {
    quiz: [
      q(
        "Gold should be served from…",
        [
          "Ad-hoc notebooks that re-filter bronze",
          "A persisted mart Job / table the warehouse or DBSQL can read",
          "A screenshot",
          "The cluster log",
        ],
        1,
        "Warehouses serve gold. Keep ETL off the BI warehouse.",
      ),
      q(
        "Corrupt bronze in this lab never reaches silver. That teaches…",
        [
          "Silver is a copy of bronze always",
          "Quality contracts live on the write to silver — leftovers stay bronze",
          "Gold stores secrets",
          "Medallion is only a color scheme",
        ],
        1,
        "Run the leftovers sample. Bronze can be ugly; silver is the contract.",
      ),
      q(
        "Why not run production ETL as a click-through notebook?",
        [
          "Notebooks cannot use Spark SQL",
          "Jobs are versioned, scheduled, and have an owner — notebooks drift",
          "Jobs cannot MERGE",
          "Unity Catalog blocks Jobs",
        ],
        1,
        "Exploration vs production. Same SQL, different runtime.",
      ),
    ],
  },
  "dbx-delta-lake-basics": {
    quiz: [
      q(
        "Delta’s MERGE habit in this lab is shown as…",
        [
          "A live write to your workspace",
          "A FULL OUTER JOIN stand-in — Spark / Delta syntax differs",
          "VACUUM",
          "A %sh copy",
        ],
        1,
        "Read-only lab. Learn the match/not-match shape, then copy MERGE to a workspace.",
      ),
      q(
        "Time travel / versions exist so you can…",
        [
          "Skip DQ gates",
          "Read a previous table version after a bad write",
          "Store PATs in _delta_log",
          "Disable Unity Catalog",
        ],
        1,
        "Versions are a recovery tool, not a substitute for review.",
      ),
      q(
        "A corrupt bronze row with NULL amount should…",
        [
          "Become 0 in silver automatically",
          "Stay out of silver until a named rule says otherwise",
          "Delete the Delta log",
          "Be DISTINCT-ed in gold",
        ],
        1,
        "The seed drops status = 'corrupt'. That is the quality contract.",
      ),
    ],
  },
  "dbx-spark-sql-performance": {
    quiz: [
      q(
        "Filter order_date in WHERE (not after a huge SELECT *) because…",
        [
          "Spark ignores WHERE",
          "Partition / file pruning reads less data — same habit as a warehouse profile",
          "Dates cannot be in WHERE",
          "LIMIT is enough in Jobs",
        ],
        1,
        "The lab’s date-window sample is the habit. Jobs do not LIMIT gold.",
      ),
      q(
        "Broadcast a tiny dim, not the fact, because…",
        [
          "Facts are always smaller",
          "A huge broadcast blows executor memory",
          "Broadcast is deprecated",
          "Dims cannot join",
        ],
        1,
        "Size the hint. Default is not “broadcast everything.”",
      ),
      q(
        "Why project columns before a wide shuffle?",
        [
          "Spark cannot shuffle",
          "Less data on the wire — do not carry unused raw fields into gold",
          "SELECT * is required",
          "Shuffles ignore columns",
        ],
        1,
        "Contract columns only.",
      ),
    ],
  },
  "dbx-unity-catalog": {
    quiz: [
      q(
        "Three-level names are…",
        [
          "cluster.notebook.cell",
          "catalog.schema.table — a notebook path is not a table",
          "user.token.workspace",
          "job.run.task only",
        ],
        1,
        "The lab’s current_catalog() sample is the habit without a remote metastore.",
      ),
      q(
        "This local lab’s unity attach is…",
        [
          "Your company’s metastore",
          "Same-origin in-memory teaching labels — learner SQL still cannot ATTACH",
          "A live AWS catalog",
          "A secret store",
        ],
        1,
        "No remote catalogs. No CSP widen.",
      ),
      q(
        "A Metric View stand-in uses dim_* and measure_* so that…",
        [
          "Spark runs faster",
          "Reviewers see dimensions vs measures — not a live UC Metric View object",
          "You can skip gold tables",
          "%sh can SELECT them",
        ],
        1,
        "Teaching names. Persist gold on purpose; the stand-in is a table.",
      ),
    ],
  },
  "dbx-jobs-workflows": {
    cheatSheet: [
      cs(
        "Job-shaped run",
        "# Job task (educational copy)\n# - cluster: job cluster, not all-purpose\n# - entry: repo SQL/Python, not an unsaved notebook\n# - on-call: owner + alerts\n# Never: %sh with a PAT in the cell",
        "Secrets stay in a secret scope. %sh is not your secret manager.",
      ),
    ],
    quiz: [
      q(
        "A production workflow should be triggered by…",
        [
          "Whoever remembers to click Run All",
          "A scheduled Job with an owner, retries, and alerts",
          "A Slack emoji",
          "%sh cron on the driver",
        ],
        1,
        "Jobs have owners. Notebooks have memories.",
      ),
      q(
        "Putting a PAT in a %sh cell is…",
        [
          "Required for Spark SQL",
          "Educational-only as a “never do this” — use a secret scope",
          "Safer than env inject",
          "How Unity Catalog authenticates tables",
        ],
        1,
        "If you touch DBX secrets, keep %sh as a warning, not a recipe.",
      ),
      q(
        "Retries on a Job should be safe because…",
        [
          "Spark retries delete gold",
          "Writes are idempotent (MERGE / partition replace)",
          "Retries never happen",
          "You use append-only with no key",
        ],
        1,
        "The same incremental rule as Python/SQL.",
      ),
    ],
  },
  "dbx-structured-streaming": {
    cheatSheet: [
      cs(
        "Checkpoint habit",
        "-- Streaming silver: readStream + checkpoint location you own\n-- Lab stand-in: bronze_events → silver_events (corrupt dropped)\nSELECT event_type, COUNT(*) FROM silver_events GROUP BY event_type;",
        "No live stream here. Checkpoints are the watermark of streaming.",
      ),
    ],
    quiz: [
      q(
        "A streaming query without a checkpoint is risky because…",
        [
          "Spark cannot SELECT",
          "A restart may reprocess or skip offsets — you lose exactly-once habits",
          "Checkpoints store PATs",
          "Streaming forbids WHERE",
        ],
        1,
        "Checkpoint location is part of the contract.",
      ),
      q(
        "Corrupt event_type rows in this seed stay in bronze_events so that…",
        [
          "Silver is a dump of bronze",
          "You can anti-join leftovers — quality is a write rule, not a hope",
          "Streaming is disabled",
          "Gold stores events only",
        ],
        1,
        "Run the events-quality sample on lab-hosting lessons.",
      ),
      q(
        "Watermarks in streaming vs batch incrementals…",
        [
          "Are unrelated ideas",
          "Both bound lateness — streaming in event time, batch in a high-water column",
          "Replace Unity Catalog",
          "Are only for Snowflake",
        ],
        1,
        "Same DE idea, different runtime.",
      ),
    ],
  },
  "dbx-sql-warehouses": {
    quiz: [
      q(
        "A SQL warehouse is for…",
        [
          "Running heavy Autoloader ETL all day",
          "Serving gold / BI-shaped SQL — keep transformation Jobs off it",
          "Storing Unity Catalog",
          "%sh scripts",
        ],
        1,
        "Compute role. ETL on Jobs; serve on the warehouse.",
      ),
      q(
        "Auto-stop on a warehouse matters because…",
        [
          "It deletes gold",
          "Idle warehouses still cost — same habit as Snowflake auto-suspend",
          "Spark cannot start again",
          "It disables SELECT",
        ],
        1,
        "Stop idle compute.",
      ),
    ],
  },
  "dbx-autoloader-ingestion": {
    quiz: [
      q(
        "Autoloader’s job is…",
        [
          "To replace Unity Catalog",
          "To incrementally land files into bronze with a schema-evolution policy you named",
          "To MERGE gold from a dashboard",
          "To store secrets in _schema",
        ],
        1,
        "Bronze landing. Silver still needs a quality contract.",
      ),
      q(
        "Why not infer schema forever in prod Autoloader?",
        [
          "Inference is illegal",
          "A surprise field can change bronze and fan out silver — evolve on purpose",
          "JSON has no schema",
          "Jobs cannot read files",
        ],
        1,
        "Name the evolution policy. Rescue paths exist for a reason.",
      ),
    ],
  },
  "dbx-capstone-medallion-job": {
    quiz: [
      q(
        "Capstone bronze → silver → gold should fail if…",
        [
          "A dashboard is ugly",
          "A DQ gate on silver breaks (NULL amounts, leftover corrupt keys you promised to drop)",
          "The cluster is a Job cluster",
          "You used Spark SQL",
        ],
        1,
        "Gates before gold. Pretty Jobs that load garbage are still incidents.",
      ),
      q(
        "Who owns the Job after the capstone?",
        [
          "Nobody — notebooks are enough",
          "A named on-call — alerts go somewhere a human reads",
          "The model vendor",
          "ACCOUNTADMIN forever",
        ],
        1,
        "Delivery without an owner is a demo, not a Job.",
      ),
    ],
  },
  "dbx-dlt-pipelines": {
    quiz: [
      q(
        "DLT / declarative pipelines are a fit when…",
        [
          "You want hidden %sh credentials",
          "You can name bronze/silver/gold expectations the engine will enforce",
          "You need to skip quality",
          "You refuse to name grain",
        ],
        1,
        "Expectations are DQ gates with an owner. Still not a live lab runtime.",
      ),
      q(
        "A failed expectation should…",
        [
          "Be ignored so gold stays fresh",
          "Stop or quarantine per the policy you wrote — same as a SQL gate",
          "Delete Unity Catalog",
          "Rotate the PAT",
        ],
        1,
        "Name drop vs fail. Silent continues are how bad silver ships.",
      ),
    ],
  },
  "dbx-liquid-clustering": {
    quiz: [
      q(
        "Liquid clustering / maintenance is for…",
        [
          "Storing secrets",
          "Keeping large tables readable — clustering keys you actually filter on",
          "Replacing WHERE",
          "Disabling Jobs",
        ],
        1,
        "Physical layout follows access. Filter columns first in SQL.",
      ),
      q(
        "OPTIMIZE / maintenance windows belong…",
        [
          "In the BI warehouse during peak dashboards",
          "On the ETL compute, off the serving warehouse",
          "Inside %sh with a token",
          "Never — Delta never needs maintenance",
        ],
        1,
        "Same cost habit as Snowflake: do not fight users for compute.",
      ),
    ],
  },
  "dbx-medallion-etl-builder": {
    quiz: [
      q(
        "Autoloader bronze → MERGE silver → DQ → gold is ordered that way because…",
        [
          "Gold must run first",
          "You never persist a mart from unvalidated silver",
          "MERGE cannot run on silver",
          "Autoloader writes gold directly",
        ],
        1,
        "Land, clean, gate, serve.",
      ),
      q(
        "The builder stays copy-to-workspace because…",
        [
          "This site is a live Databricks workspace",
          "The local lab is DuckDB SELECT/WITH — Jobs/Autoloader syntax is educational copy",
          "%sh is enabled here",
          "Unity Catalog is attached to your cloud",
        ],
        1,
        "Honest lab. No Wave B runtime.",
      ),
    ],
  },
  "dbx-spark-select-nulls": {
    cheatSheet: [
      cs(
        "North silver peek",
        "SELECT order_id, order_date, region, amount\nFROM silver_orders\nWHERE region = 'north' AND status = 'ok'\nORDER BY order_date, order_id;",
        "Wave A1 north landings. amount = NULL matches zero rows — use IS NULL.",
      ),
    ],
    quiz: [
      q(
        "In Spark SQL, amount = NULL returns…",
        [
          "Rows where amount is unknown",
          "Zero rows — use IS NULL",
          "A runtime error always",
          "The string 'NULL'",
        ],
        1,
        "Same ANSI habit as the SQL track.",
      ),
      q(
        "LIMIT 5 on a silver notebook sample is…",
        [
          "A production incremental",
          "A lab/sample cap — Jobs filter a date partition or Autoloader checkpoint",
          "How you drop corrupt rows",
          "A Delta constraint",
        ],
        1,
        "The lesson’s LIMIT sample says this out loud.",
      ),
    ],
  },
  "dbx-delta-write-preview": {
    cheatSheet: [
      cs(
        "Leftover bronze keys",
        "SELECT b.order_id, b.status, b.amount\nFROM bronze_orders b\nWHERE NOT EXISTS (SELECT 1 FROM silver_orders s WHERE s.order_id = b.order_id);",
        "Anti-join preview. The lab will not MERGE.",
      ),
    ],
    quiz: [
      q(
        "A MERGE preview in this lab is a join because…",
        [
          "Delta cannot MERGE",
          "The engine is read-only DuckDB — you practice the match set, then copy MERGE",
          "JOIN is the official Delta syntax",
          "VACUUM is a SELECT",
        ],
        1,
        "Honest stand-in. Spark SQL / Delta syntax differs.",
      ),
      q(
        "WHEN NOT MATCHED should insert…",
        [
          "Corrupt bronze with no rule",
          "Only rows that pass the silver contract",
          "Every notebook cell",
          "A PAT",
        ],
        1,
        "Not-matched is not a license to land garbage.",
      ),
    ],
  },
  "dbx-gold-aggregates": {
    cheatSheet: [
      cs(
        "Gold daily returns",
        "SELECT order_date, region, returned_orders, returned_amount\nFROM gold_returns_daily\nORDER BY order_date, region;",
        "Do not mix this grain with gold_daily_orders revenue.",
      ),
    ],
    quiz: [
      q(
        "HAVING belongs on gold aggregates because…",
        [
          "WHERE cannot see region",
          "You filter groups (e.g. revenue floor) after SUM — WHERE filters rows first",
          "HAVING writes Delta",
          "Spark forbids WHERE",
        ],
        1,
        "Same SQL-track rule. Persist the grain; do not re-aggregate bronze in every notebook.",
      ),
      q(
        "metrics.returns_daily is…",
        [
          "A live UC Metric View in your cloud",
          "A local dim_/measure_ stand-in for returns — same-origin only",
          "A secret table",
          "An Autoloader checkpoint",
        ],
        1,
        "Teaching fixture. No remote catalog.",
      ),
    ],
  },
  "dbx-silver-patterns-case": {
    quiz: [
      q(
        "CASE status buckets in silver are…",
        [
          "A Delta constraint that blocks writes",
          "A column expression for cleaning — reviewers can see the rule",
          "A Job cluster setting",
          "A Unity Catalog privilege",
        ],
        1,
        "CASE is an expression, not a stored procedure.",
      ),
      q(
        "LIKE 'w%' on region…",
        [
          "Is a regex engine",
          "Matches a suffix after w — useful, but a typed region column + IN is clearer for marts",
          "Updates gold",
          "Ignores case in every dialect always",
        ],
        1,
        "Patterns for exploration. Contracts prefer IN / = on typed dims.",
      ),
    ],
  },
  "dbx-semi-joins-leftovers": {
    cheatSheet: [
      cs(
        "Bronze event leftovers",
        "SELECT b.event_id, b.event_type\nFROM bronze_events b\nWHERE NOT EXISTS (SELECT 1 FROM silver_events s WHERE s.event_id = b.event_id);",
        "Same anti-join habit as leftover order keys.",
      ),
    ],
    quiz: [
      q(
        "Leftover bronze keys after silver writes mean…",
        [
          "Silver is broken always",
          "A quality rule dropped them — prove it with NOT EXISTS, do not hide with DISTINCT",
          "You should DELETE bronze nightly",
          "Unity Catalog failed",
        ],
        1,
        "This seed’s leftover is the corrupt row. Name the rule.",
      ),
      q(
        "EXISTS as a semi-join is better than JOIN when…",
        [
          "You need every bronze column in gold",
          "You only care that a silver key exists — JOIN can fan out",
          "You want to UPDATE",
          "You are in %sh",
        ],
        1,
        "Existence vs projection.",
      ),
    ],
  },
  "dbx-delta-table-contracts": {
    quiz: [
      q(
        "Read information_schema (or DESCRIBE) before CREATE TABLE USING DELTA because…",
        [
          "The lab will run the CREATE",
          "You need the current columns/types — this lab does not execute Delta DDL",
          "Schema is stored in %sh",
          "Contracts are optional on gold",
        ],
        1,
        "Inspect, then copy DDL to a workspace.",
      ),
      q(
        "A schema-enforced Delta table should…",
        [
          "Accept any surprise column silently",
          "Fail or send extras to a rescue path when the contract breaks",
          "Store PATs in comments",
          "Disable MERGE",
        ],
        1,
        "Enforcement is the point of a contract.",
      ),
    ],
  },
  "dbx-dates-partition-filters": {
    quiz: [
      q(
        "Wrapping order_date in DATE_FORMAT before comparing is risky because…",
        [
          "Dates cannot format",
          "You may disable pruning — filter on the typed partition-like column",
          "Spark forbids functions",
          "FORMAT is a write",
        ],
        1,
        "Keep the column naked in WHERE.",
      ),
      q(
        "BETWEEN on DATE in the lab is inclusive so that…",
        [
          "You accidentally skip the end day",
          "You know the bound — then write the same habit in Spark SQL",
          "Streaming forbids BETWEEN",
          "It injects strings",
        ],
        1,
        "Inclusive bounds. Bind values; do not glue UI strings.",
      ),
    ],
  },
  "dbx-catalog-views-metrics": {
    quiz: [
      q(
        "silver.ok_orders is a view so that…",
        [
          "Gold can skip persisting a contract",
          "Notebooks share a stored SELECT — gold should still persist a mart grain",
          "It is a live UC Metric View",
          "It stores checkpoints",
        ],
        1,
        "Views are not a load. Marts persist.",
      ),
      q(
        "lab_catalog_objects lists teaching names because…",
        [
          "This browser attached to your cloud metastore",
          "Same-origin inventory — no remote catalog, no ATTACH from learner SQL",
          "It is ACCOUNTADMIN",
          "It is a secret manager",
        ],
        1,
        "Honest labels.",
      ),
    ],
  },

  // --- Snowflake ---
  "sf-day0-objects": {
    cheatSheet: [
      cs(
        "Warehouse vs database",
        "SELECT name, size, auto_suspend_sec, status FROM sf_warehouses;\nSELECT database, schema, object_name FROM sf_account_objects;",
        "Warehouses are compute. Databases/schemas hold objects. Auto-suspend stops credit burn.",
      ),
    ],
    quiz: [
      q(
        "The warehouse name is not…",
        [
          "Compute you size and suspend",
          "A database — tables live in database.schema.table",
          "Something you auto-suspend",
          "A credit-consuming resource",
        ],
        1,
        "Day-0: compute vs storage nesting.",
      ),
      q(
        "learn_wh auto_suspend 60 seconds exists in the seed so you remember…",
        [
          "To keep BI warehouses running all weekend",
          "Idle warehouses still spend — suspend when idle",
          "That XSMALL cannot SELECT",
          "That suspend deletes data",
        ],
        1,
        "Credits are time × size. Data stays in tables.",
      ),
    ],
  },
  "sf-architecture": {
    quiz: [
      q(
        "Storage and compute separate so that…",
        [
          "You can scale a warehouse without copying tables",
          "Tables live inside the warehouse size",
          "Time Travel is disabled",
          "You need ACCOUNTADMIN to SELECT",
        ],
        0,
        "Classic Snowflake pitch — and it is the day-0 habit.",
      ),
      q(
        "A BI warehouse and an ETL warehouse should be different because…",
        [
          "They cannot share a database",
          "ETL should not steal serving credits (and vice versa)",
          "BI cannot run SQL",
          "ETL cannot use MERGE",
        ],
        1,
        "The seed’s etl_wh vs bi_wh is the picture.",
      ),
      q(
        "Cloud services layer (auth, metadata) is…",
        [
          "Your virtual warehouse",
          "The control plane — warehouses still do the heavy scans",
          "A Dynamic Table",
          "A stage URL",
        ],
        1,
        "Do not confuse metadata with a MEDIUM warehouse.",
      ),
    ],
  },
  "sf-time-travel-clones": {
    cheatSheet: [
      cs(
        "Version delta stand-in",
        "SELECT v1.order_id, v1.amount AS v1, v2.amount AS v2\nFROM sf_orders_history v1\nJOIN sf_orders_history v2 ON v1.order_id = v2.order_id\nWHERE v1.as_of_version = 1 AND v2.as_of_version = 2;",
        "DuckDB stand-in for AT (TIMESTAMP). Snowflake syntax differs.",
      ),
    ],
    quiz: [
      q(
        "Time Travel lets you…",
        [
          "Skip RBAC",
          "Query a prior table version after a bad UPDATE — within retention",
          "Attach a remote catalog from this lab",
          "Disable Fail-safe",
        ],
        1,
        "Recovery tool. Not a substitute for preview SELECTs.",
      ),
      q(
        "Zero-copy clone is useful for DEV because…",
        [
          "It copies every micro-partition immediately at full cost",
          "It is a metadata pointer until you write — cheap isolated DEV",
          "It disables Time Travel",
          "It is a live share to customers",
        ],
        1,
        "Clone, then write in the clone. Do not clone prod to a role you do not trust.",
      ),
      q(
        "Fail-safe is…",
        [
          "The same as a clone you can SELECT anytime",
          "A support-led recovery window after Time Travel — not a sandbox",
          "A Stream offset",
          "A warehouse size",
        ],
        1,
        "Do not plan nightly DEV on Fail-safe.",
      ),
    ],
  },
  "sf-streams-tasks": {
    cheatSheet: [
      cs(
        "Stream + Task shape",
        "CREATE STREAM raw.orders_stream ON TABLE raw.orders;\nCREATE TASK load_orders WAREHOUSE = etl_wh SCHEDULE = '5 MINUTE' AS\n  MERGE INTO analytics.orders t USING raw.orders_stream s ...;",
        "Educational copy. METADATA$ACTION is INSERT/UPDATE/DELETE since last consume.",
      ),
    ],
    quiz: [
      q(
        "A Stream’s offset advances when…",
        [
          "You look at the table in the UI",
          "A DML consumes the stream (or you advance it on purpose)",
          "The warehouse auto-suspends",
          "You clone the database",
        ],
        1,
        "Unconsumed streams keep change rows. Consumption is a contract.",
      ),
      q(
        "METADATA$ACTION = 'DELETE' in a MERGE should…",
        [
          "Be ignored so gold never shrinks",
          "Be handled explicitly — deletes are data too",
          "Drop the warehouse",
          "Rotate keys",
        ],
        1,
        "CDC without deletes is a lie if source deletes exist.",
      ),
      q(
        "Task trees exist so that…",
        [
          "You click Run All in a worksheet forever",
          "land → clean → mart has dependencies and one owner",
          "Dynamic Tables are disabled",
          "RBAC is skipped",
        ],
        1,
        "Schedule + dependency. Same idea as a DBX Job.",
      ),
    ],
  },
  "sf-dynamic-tables": {
    quiz: [
      q(
        "A Dynamic Table persists…",
        [
          "A worksheet history",
          "A named grain that refreshes from upstream — not a view that re-reads bronze every dashboard click",
          "The warehouse size",
          "A PAT",
        ],
        1,
        "Views do not persist. DTs do (with lag you name).",
      ),
      q(
        "TARGET_LAG is a…",
        [
          "Secret",
          "Freshness contract — tighter lag costs more refreshes",
          "Clone name",
          "Stream offset you never consume",
        ],
        1,
        "Cost vs freshness. Do not set 1 minute because it sounds nice.",
      ),
      q(
        "The lab’s sf_daily_mart sample is a SELECT because…",
        [
          "Dynamic Tables are illegal",
          "This engine will not CREATE DYNAMIC TABLE — practice the grain, copy the DDL",
          "SELECT cannot GROUP BY",
          "Warehouses cannot run SQL",
        ],
        1,
        "Honest stand-in.",
      ),
    ],
  },
  "sf-performance-cost": {
    quiz: [
      q(
        "Prune with a date filter early so that…",
        [
          "The profile shows less scanned — credits follow bytes scanned and warehouse time",
          "Time Travel turns off",
          "RBAC is bypassed",
          "AUTO_SUSPEND is ignored",
        ],
        0,
        "The prune-filter sample is the habit. Read a query profile in a real account.",
      ),
      q(
        "Spilling / a too-small warehouse is a signal to…",
        [
          "Always jump to 3XL",
          "Filter/project first, then size — do not buy compute to hide a SELECT *",
          "Disable clustering",
          "Paste the query into a public chat with results",
        ],
        1,
        "Cost control is SQL shape, then size.",
      ),
      q(
        "Keep ETL off bi_wh because…",
        [
          "BI warehouses cannot SELECT",
          "Dashboards and MERGE should not fight for the same credits",
          "etl_wh cannot MERGE",
          "Suspend deletes gold",
        ],
        1,
        "The seed’s two warehouses exist for this sentence.",
      ),
    ],
  },
  "sf-governance-rbac": {
    cheatSheet: [
      cs(
        "Least privilege sketch",
        "-- Educational copy (not executed here)\nGRANT USAGE ON DATABASE analytics TO ROLE aurora_analyst;\nGRANT SELECT ON VIEW analytics.paid_orders TO ROLE aurora_analyst;\n-- Not: GRANT ACCOUNTADMIN TO everyone",
        "Roles own privileges. Users get roles. ACCOUNTADMIN is not a daily driver.",
      ),
    ],
    quiz: [
      q(
        "Analysts should usually get…",
        [
          "ACCOUNTADMIN",
          "USAGE + SELECT on the views/marts they need — not CREATE on raw",
          "The ability to disable Time Travel",
          "A shared password in Slack",
        ],
        1,
        "Least privilege. Views are a grant surface.",
      ),
      q(
        "Why not use ACCOUNTADMIN for worksheets?",
        [
          "It cannot run SELECT",
          "Blast radius — one bad DML or grant becomes an incident",
          "It disables warehouses",
          "It is slower",
        ],
        1,
        "Break-glass only.",
      ),
      q(
        "A role hierarchy helps because…",
        [
          "You can hide grants from query history",
          "You grant once to a functional role and assign users to it",
          "It replaces MFA",
          "It stores PATs",
        ],
        1,
        "Functional roles > per-user snowflakes (pun intended).",
      ),
    ],
  },
  "sf-snowpark-python": {
    cheatSheet: [
      cs(
        "Snowpark vs SQL",
        "# Educational copy — not a live session\n# df = session.table('analytics.orders').filter(col('status') == 'paid')\n# Same grain rules as pandas/Spark: do not fan out amount on items.",
        "Snowpark is Python that becomes SQL. Cortex is a different decision.",
      ),
    ],
    quiz: [
      q(
        "Snowpark is a fit when…",
        [
          "You want to skip RBAC",
          "You already have tested Python transforms and need them close to the data",
          "You need a public web chat to hold a PAT",
          "SQL cannot GROUP BY",
        ],
        1,
        "Same contract, different API. Still review the generated SQL.",
      ),
      q(
        "A Snowpark join to line items then sum(order.amount) is…",
        [
          "Fine — Python protects grain",
          "The same fan-out bug as SQL",
          "Impossible",
          "A Time Travel feature",
        ],
        1,
        "APIs do not save you from grain.",
      ),
      q(
        "This lesson does not open a live Snowpark session because…",
        [
          "Snowpark is fictional",
          "No Wave B AI/Python warehouse runtime — copy examples to an account",
          "Python is banned",
          "Warehouses cannot run Python",
        ],
        1,
        "Educational copy only.",
      ),
    ],
  },
  "sf-copy-stages-ingestion": {
    quiz: [
      q(
        "COPY INTO from a stage is…",
        [
          "A gold MERGE",
          "A bronze landing — then Streams/Tasks or a DT clean it",
          "A clone",
          "A Cortex function",
        ],
        1,
        "Land first. Transform second.",
      ),
      q(
        "A named file format + stage beats ad-hoc paths because…",
        [
          "Paths are illegal",
          "The contract (delim, tz, error mode) is reusable and reviewable",
          "Stages store ACCOUNTADMIN",
          "COPY cannot use formats",
        ],
        1,
        "Ingestion is a contract. Name it.",
      ),
    ],
  },
  "sf-capstone-dynamic-table-mart": {
    quiz: [
      q(
        "Capstone cost checklist should include…",
        [
          "Only the logo",
          "Warehouse size, auto-suspend, DT lag, and who is on-call if gold is stale",
          "A PAT in a worksheet",
          "ACCOUNTADMIN as the owner role",
        ],
        1,
        "Freshness and cost are the same checklist.",
      ),
      q(
        "Daily revenue grain in the capstone is…",
        [
          "Item sku",
          "The mart you named (date + region) — not a dashboard GROUP BY on bronze",
          "The stream offset",
          "The warehouse name",
        ],
        1,
        "Persist the grain.",
      ),
    ],
  },
  "sf-zero-copy-clone-dev": {
    quiz: [
      q(
        "After you clone prod to DEV, the first grant should…",
        [
          "Be ACCOUNTADMIN to the intern",
          "Match DEV least privilege — a clone copies data, not your common sense",
          "Disable Time Travel",
          "Share the clone publicly",
        ],
        1,
        "Clones are copies of access risk too.",
      ),
      q(
        "Writes in a clone…",
        [
          "Always rewrite prod",
          "Materialize new micro-partitions in the clone — prod stays until you write there",
          "Are free forever",
          "Delete Fail-safe",
        ],
        1,
        "Zero-copy until you mutate.",
      ),
    ],
  },
  "sf-cortex-vs-snowpark": {
    quiz: [
      q(
        "Pick Cortex-style functions when…",
        [
          "You need a reviewed, typed ETL contract in Python",
          "You want in-SQL assist / doc / classify on data you already govern",
          "You want to store PATs in a prompt",
          "You need to disable RBAC",
        ],
        1,
        "Different jobs. Cortex is not a Snowpark replacement for pipelines.",
      ),
      q(
        "Pick Snowpark when…",
        [
          "You have a tested Python transform and want it next to the warehouse",
          "You want an unsupervised agent to GRANT",
          "SQL cannot filter",
          "You need a public model to hold keys",
        ],
        0,
        "Python-near-data. Still review.",
      ),
    ],
  },
  "sf-warehouse-etl-builder": {
    quiz: [
      q(
        "COPY → Stream/Task MERGE → Dynamic Table gold is ordered that way because…",
        [
          "Gold must land first",
          "You do not persist a mart from unconsumed/unvalidated change rows",
          "COPY writes gold",
          "Tasks cannot MERGE",
        ],
        1,
        "Land, capture, gate, serve.",
      ),
      q(
        "The builder is copy-to-account because…",
        [
          "This page is a live Snowflake org",
          "The local lab is DuckDB SELECT/WITH — COPY/TASK/DT are educational copy",
          "ATTACH to your account is enabled",
          "Cortex runs here",
        ],
        1,
        "No Wave B warehouse runtime.",
      ),
    ],
  },
  "sf-select-filter-nulls": {
    cheatSheet: [
      cs(
        "North / LATAM paid",
        "SELECT o.order_id, c.region, o.amount, o.promo_code\nFROM sf_orders o\nJOIN sf_customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'paid' AND c.region IN ('north', 'latam');",
        "Wave A1 SAMPLE customers. promo_code = NULL is never TRUE.",
      ),
    ],
    quiz: [
      q(
        "COUNT(promo_code) on sf_orders counts…",
        [
          "All SAMPLE orders",
          "Rows with a non-NULL promo — COUNT(*) is the order count",
          "Warehouses",
          "Time Travel versions",
        ],
        1,
        "Same NULL lesson as Aurora SQL.",
      ),
      q(
        "LIMIT 5 on a SAMPLE worksheet is…",
        [
          "A Task incremental",
          "A sample cap — Tasks / DTs use a stream or a date window",
          "How you drop pending rows",
          "A clone",
        ],
        1,
        "Exploration vs pipeline.",
      ),
    ],
  },
  "sf-dml-write-path": {
    cheatSheet: [
      cs(
        "Preview pending writes",
        "SELECT order_id, status, amount, order_date\nFROM sf_orders\nWHERE status = 'pending' AND order_date <= DATE '2026-09-02';",
        "Read-only lab. Preview the MERGE set, then copy DML to an account.",
      ),
    ],
    quiz: [
      q(
        "MERGE without a preview SELECT is how you…",
        [
          "Save credits always",
          "Update the wrong grain — preview pending / matched keys first",
          "Enable Time Travel",
          "Skip RBAC",
        ],
        1,
        "The dml-preview sample is the habit.",
      ),
      q(
        "Why won’t this lab run MERGE?",
        [
          "Snowflake cannot MERGE",
          "Guard allows SELECT/WITH only — writes belong in an account you can Time Travel",
          "MERGE is deprecated",
          "Streams replace MERGE",
        ],
        1,
        "Honest engine.",
      ),
    ],
  },
  "sf-aggregates-group-having": {
    quiz: [
      q(
        "HAVING SUM(amount) >= 20 on SAMPLE paid revenue…",
        [
          "Filters rows before GROUP BY",
          "Filters groups after SUM — put status = 'paid' in WHERE",
          "Creates a Dynamic Table",
          "Suspends the warehouse",
        ],
        1,
        "WHERE then GROUP then HAVING.",
      ),
      q(
        "Joining sf_line_items then SUM(o.amount) is wrong because…",
        [
          "amount is not a column",
          "Line items fan out the order — sum qty * unit_price at item grain",
          "JOIN is banned",
          "SAMPLE cannot join",
        ],
        1,
        "Wave A1 line items exist so you can practice this.",
      ),
    ],
  },
  "sf-patterns-aliases-case": {
    quiz: [
      q(
        "LIKE 'F%' on promo_code matches…",
        [
          "A regex lookbehind",
          "FALL26 / FLASH-style prefixes — patterns, not a stored procedure",
          "Only VIP",
          "NULL promos",
        ],
        1,
        "LIKE is a pattern. IN is a set. BETWEEN is inclusive.",
      ),
      q(
        "CASE size buckets belong in…",
        [
          "A Task that GRANTs",
          "One SELECT so reviewers see the grain — not a hidden UDF you cannot find",
          "ACCOUNTADMIN",
          "The warehouse size",
        ],
        1,
        "Expression, not a procedure.",
      ),
    ],
  },
  "sf-exists-semi-joins": {
    quiz: [
      q(
        "The seed’s leftover customer is…",
        [
          "A paid VIP",
          "The churned west customer with no orders — NOT EXISTS",
          "etl_wh",
          "A clone",
        ],
        1,
        "Anti-join. Do not JOIN then DISTINCT to fake existence.",
      ),
      q(
        "EXISTS does not fan out because…",
        [
          "It is a semi-join — true/false per outer row",
          "Snowflake forbids multiple orders",
          "It is a warehouse",
          "It deletes the inner table",
        ],
        0,
        "Existence, not projection.",
      ),
    ],
  },
  "sf-ddl-constraints": {
    quiz: [
      q(
        "Clustering keys are…",
        [
          "PRIMARY KEY clones",
          "A storage layout hint for prune-friendly columns — not a uniqueness guarantee",
          "RBAC roles",
          "Stream offsets",
        ],
        1,
        "Constraints vs clustering. Do not confuse them.",
      ),
      q(
        "This lab will not CREATE TABLE because…",
        [
          "DDL is fictional",
          "You inspect sf_* columns, then copy CREATE/ALTER to an account",
          "information_schema is empty",
          "Warehouses cannot DDL",
        ],
        1,
        "Inspect first.",
      ),
    ],
  },
  "sf-dates-injection": {
    quiz: [
      q(
        "AT (TIMESTAMP => …) in an account is Time Travel. In this lab you…",
        [
          "Run AT against Snowflake",
          "Use sf_orders_history versions as a stand-in, then copy AT syntax to an account",
          "ATTACH the account",
          "Disable the guard",
        ],
        1,
        "Syntax differs. Habit matches.",
      ),
      q(
        "Gluing a form date into WHERE order_date = '…' is bad because…",
        [
          "Dates cannot be strings ever",
          "Injection + type bugs — bind a DATE parameter",
          "BETWEEN is exclusive",
          "Time Travel forbids dates",
        ],
        1,
        "Bind-safe filters.",
      ),
    ],
  },
  "sf-catalog-views-metrics": {
    quiz: [
      q(
        "analytics.paid_orders is a view, so…",
        [
          "It persists like a Dynamic Table",
          "It is a stored SELECT — DTs persist a grain; this view does not",
          "It is Cortex",
          "It is a warehouse",
        ],
        1,
        "View vs DT vs table.",
      ),
      q(
        "metrics.sf_daily_revenue is…",
        [
          "A live Snowflake semantic view in your org",
          "A local metric-style table — not Cortex, not a remote object",
          "ACCOUNTADMIN",
          "A stage",
        ],
        1,
        "Same-origin fixture.",
      ),
    ],
  },

  // --- FDE ---
  "fde-what-an-fde-is": {
    cheatSheet: [
      cs(
        "Not ACCOUNTADMIN forever",
        "Week 1: map who holds ACCOUNTADMIN / metastore admin\nWeek 2: least-privilege role for the Job / DT\nHandoff: they page their on-call, not you",
        "If nobody pages them when gold is stale, you have not handed off.",
      ),
    ],
    quiz: [
      q(
        "Owning ACCOUNTADMIN for the life of the account means…",
        [
          "You are a successful FDE",
          "You failed the handoff — least privilege + their on-call is the job",
          "You are a SWE on the runtime",
          "You are pre-sales SA",
        ],
        1,
        "Permanent admin is a trap, not a trophy.",
      ),
      q(
        "Which week-one artifact is most FDE-shaped?",
        [
          "A rewrite of Spark core",
          "A map of bronze/silver/gold owners and who can GRANT",
          "A seed-round deck",
          "A blog post only",
        ],
        1,
        "Discovery of their world, not yours.",
      ),
    ],
  },
  "fde-discovery-shadowing": {
    cheatSheet: [
      cs(
        "Shadow notes",
        "Standup: who speaks when gold is late?\nCatalog: who owns raw vs marts?\nChange control: CAB / ticket / none?\nDo not: promise a full medallion rewrite this sprint",
        "Write what you saw. Scope comes next.",
      ),
    ],
    quiz: [
      q(
        "You shadow a 9am warehouse standup to…",
        [
          "Replace their EM",
          "Hear who actually owns stale gold — titles lie",
          "Collect PATs",
          "Grant yourself ACCOUNTADMIN",
        ],
        1,
        "On-call reality beats the org chart.",
      ),
      q(
        "A useful discovery output is…",
        [
          "A 40-page strategy with no names",
          "A one-page map: systems, owners, constraints, smallest deploy",
          "A surprise prod cutover",
          "A public dump of their grants",
        ],
        1,
        "Names and constraints. Not a novel.",
      ),
    ],
  },
  "fde-smallest-valuable-deploy": {
    quiz: [
      q(
        "Smallest valuable deploy means…",
        [
          "Rewrite every mart in week one",
          "One Job / DT in DEV that a named user actually runs",
          "A slide-only architecture",
          "A clone of their entire prod to your laptop",
        ],
        1,
        "Used beats complete.",
      ),
      q(
        "Why refuse a “boil the lakehouse” week-one scope?",
        [
          "FDE work cannot touch gold",
          "You will miss security, owners, and a demo-able grain",
          "Jobs cannot be small",
          "Customers hate DEV catalogs",
        ],
        1,
        "Scope is a delivery skill.",
      ),
    ],
  },
  "fde-integrate-customer-env": {
    quiz: [
      q(
        "Their SSO / network / change control exists so that…",
        [
          "You can ignore it and use your demo tenant",
          "The integration has to live there — a clean vendor demo is not done",
          "You keep ACCOUNTADMIN",
          "You skip security review",
        ],
        1,
        "FDE work is in their env.",
      ),
      q(
        "A service principal for a Job should be…",
        [
          "A shared human password in Slack",
          "A dedicated identity with least-privilege grants you documented",
          "ACCOUNTADMIN",
          "The intern’s PAT",
        ],
        1,
        "Identities are part of the handoff.",
      ),
    ],
  },
  "fde-deploy-environments": {
    quiz: [
      q(
        "DEV vs PROD catalogs exist so that…",
        [
          "You can test grants and Jobs without writing prod gold",
          "PROD can use a personal cluster",
          "DEV disables RBAC",
          "You skip observability",
        ],
        0,
        "Promotion path. No surprise prod.",
      ),
      q(
        "A deploy without a rollback story is…",
        [
          "Agile",
          "Incomplete — Time Travel / previous Job version / clone, named in the runbook",
          "Required by FDE culture",
          "Safer than a runbook",
        ],
        1,
        "Handoff includes how they undo you.",
      ),
    ],
  },
  "fde-security-review": {
    cheatSheet: [
      cs(
        "Questionnaire sketch",
        "Data classes: who is in gold?\nIdentities: Job SP, not a user PAT\nNetwork: private link / IP allow?\nSecrets: scope / manager — never %sh / worksheet\nLogs: who can read query history?",
        "Answer with artifacts, not vibes.",
      ),
    ],
    quiz: [
      q(
        "A security reviewer asks where secrets live. Worst answer?",
        [
          "Secret manager / Databricks secret scope, injected at runtime",
          "In the notebook that we commit, and in the chat we used to debug",
          "CI inject for the Job",
          "Rotated and least-privilege",
        ],
        1,
        "Committed tokens fail the review — and the incident.",
      ),
      q(
        "Least privilege on a gold mart means…",
        [
          "Every analyst is metastore admin",
          "SELECT on the mart/view, not CREATE on raw, not ACCOUNTADMIN",
          "No query history",
          "Disabled MFA",
        ],
        1,
        "Grant the grain they need.",
      ),
    ],
  },
  "fde-observability-handoff": {
    quiz: [
      q(
        "A handoff runbook must say…",
        [
          "“Call the FDE forever”",
          "How to tell gold is stale, who is paged, and the first SELECT / Job retry",
          "The vendor’s stock price",
          "Nothing — dashboards are enough",
        ],
        1,
        "On-call without a first check is theater.",
      ),
      q(
        "Guest progress stepIndex after a lab run is…",
        [
          "A production SLA",
          "Local practice only — customer observability is their warehouse + Job alerts",
          "A PagerDuty integration",
          "A live stream",
        ],
        1,
        "Do not confuse the training lab with their telemetry.",
      ),
    ],
  },
  "fde-ai-rag-evals": {
    quiz: [
      q(
        "Ship an AI feature without evals is risky because…",
        [
          "Models cannot run in a VPC",
          "You cannot tell if retrieval/answers got worse after a prompt change",
          "Evals require ACCOUNTADMIN",
          "RAG is illegal",
        ],
        1,
        "Evals are DQ gates for AI.",
      ),
      q(
        "Customer documents in a RAG index should…",
        [
          "Bypass RBAC because the model is trusted",
          "Honor the same grants / redaction you would use for a mart",
          "Be pasted into a public chat to “test chunks”",
          "Include PATs for freshness",
        ],
        1,
        "AI does not waive governance.",
      ),
    ],
  },
  "fde-stakeholder-demos": {
    cheatSheet: [
      cs(
        "Demo grain",
        "Show: DEV catalog, one gold table, one number they already argue about\nSay: owner, refresh, what we will not do this sprint\nDo not: live-edit prod or invent a metric",
        "Demos are scoped truth, not theater.",
      ),
    ],
    quiz: [
      q(
        "A stakeholder demo should use…",
        [
          "A metric you invented that morning",
          "A grain they already fight about, on data they recognize",
          "ACCOUNTADMIN as the hero role",
          "A surprise prod write",
        ],
        1,
        "Credibility is their number, not yours.",
      ),
      q(
        "Writing after a demo matters because…",
        [
          "Slides expire; a written grain + owner + next check survives the meeting",
          "FDE work is only verbal",
          "Tickets are banned",
          "You should not leave artifacts",
        ],
        0,
        "Write it down. That is the handoff seed.",
      ),
    ],
  },
  "fde-capstone-engagement": {
    quiz: [
      q(
        "Capstone engagement is done when…",
        [
          "You still hold ACCOUNTADMIN and they have no runbook",
          "A named Job/DT is in their env, gated, alerted, and their on-call can run the first check",
          "The sales deck is prettier",
          "You cloned prod to your laptop",
        ],
        1,
        "Used, owned, reversible.",
      ),
      q(
        "The checklist exists so that…",
        [
          "You can skip discovery",
          "Security, grain, deploy, and handoff are not optional slides",
          "Labs become live warehouses",
          "Wave B ships from this PR",
        ],
        1,
        "Same spine as the ETL builders — plus customer constraints.",
      ),
    ],
  },

  // --- Git ---
  "git-rebase-vs-merge": {
    cheatSheet: [
      cs(
        "Play Lab first",
        "# Personal branch (Play Lab / your clone)\ngit fetch origin\ngit rebase origin/main\n# Shared release: merge, do not rebase teammates",
        "No GitHub push from this page. No practice VM.",
      ),
    ],
    quiz: [
      q(
        "Force-pushing a rebased personal branch is…",
        [
          "Required on main",
          "OK only if nobody else based work on those commits — still prefer --force-with-lease",
          "How you update prod gold",
          "Banned in all cases including your laptop",
        ],
        1,
        "Lease protects teammates. Never force-push main.",
      ),
      q(
        "Merge vs rebase on a dbt PR: default here is…",
        [
          "Rebase shared release branches",
          "Rebase your personal branch for a linear review; merge shared history",
          "Rewrite main nightly",
          "Skip git entirely",
        ],
        1,
        "Reviewable personal history. Honest shared history.",
      ),
    ],
  },
  "git-commit-hygiene": {
    cheatSheet: [
      cs(
        "One grain per commit",
        "feat(orders): reject notes.json in landing glob\n\nWhy: glob('*.json') picked up sidecars and fan-out gold.",
        "Subject + why. Not “fix stuff”. Play the hygiene level in Git Play Lab.",
      ),
    ],
    quiz: [
      q(
        "A useful analytics commit message names…",
        [
          "Only “wip”",
          "The grain or contract you changed and why",
          "The warehouse password",
          "A random SHA",
        ],
        1,
        "Future you will bisect this.",
      ),
      q(
        "Mixing a schema change and a dashboard color in one commit is bad because…",
        [
          "Git forbids two files",
          "Bisect and revert cannot isolate the breaking change",
          "dbt cannot compile",
          "PRs cannot have diffs",
        ],
        1,
        "Hygiene is for the next incident, not aesthetics.",
      ),
    ],
  },
  "git-bisect-and-blame": {
    cheatSheet: [
      cs(
        "Bisect a mart",
        "git bisect start\ngit bisect bad HEAD\ngit bisect good v1.4.0\n# test: dbt compile + one SELECT on orders_daily\ngit bisect good|bad",
        "A failing check you can rerun beats vibes. Play Lab has no VM.",
      ),
    ],
    quiz: [
      q(
        "git blame is most useful when…",
        [
          "You want to punish an author",
          "You need the commit that last touched a grain so you can read the why",
          "You skip tests",
          "You rewrite main",
        ],
        1,
        "Blame is archaeology, not HR.",
      ),
      q(
        "Bisect needs a…",
        [
          "Secret PAT in the script",
          "Deterministic test (compile, one DQ SELECT) you can run at each step",
          "Force-push to main",
          "Live Databricks cluster in this browser",
        ],
        1,
        "No test, no bisect.",
      ),
    ],
  },
  "git-branching-dbt-sql": {
    quiz: [
      q(
        "A long-lived personal branch on a dbt repo is risky because…",
        [
          "dbt cannot run on branches",
          "Refs and macros drift from main — rebase/merge often, keep PRs small",
          "SQL cannot be in git",
          "Play Lab rewrites GitHub",
        ],
        1,
        "Small PRs. Fresh main.",
      ),
      q(
        "Why keep marts and a one-off scratch query on different branches/PRs?",
        [
          "Git allows only one .sql file",
          "Reviewers can see the contract change without a pile of notebook leftovers",
          "Scratch SQL is illegal",
          "dbt forbids refs",
        ],
        1,
        "Branch purpose = review purpose.",
      ),
    ],
  },
  "git-pr-templates-data-diffs": {
    quiz: [
      q(
        "A data PR template should ask for…",
        [
          "Only a screenshot of the IDE",
          "Grain, how you proved it (row counts / metric diff), and rollback",
          "The warehouse password",
          "A promise that CI is optional",
        ],
        1,
        "Diffs of numbers, not only diffs of text.",
      ),
      q(
        "Why attach a before/after count on orders_daily?",
        [
          "Counts replace tests",
          "Reviewers can see fan-out or a dropped day without pulling the warehouse blindly",
          "Git stores the warehouse",
          "Play Lab pushes the counts to origin",
        ],
        1,
        "Data diffs are the point of a data PR.",
      ),
    ],
  },
};
