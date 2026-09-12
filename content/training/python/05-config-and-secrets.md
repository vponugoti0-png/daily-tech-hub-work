---
slug: python-config-and-secrets
track: python
title: "Config, secrets, and environment boundaries"
description: "12-factor style config for DE jobs: typed settings, secret backends, and no credentials in notebooks."
level: beginner
order: 5
durationMinutes: 25
topics: [python, general]
objectives:
  - "Load typed config from env"
  - "Never commit secrets"
  - "Separate prod/staging endpoints cleanly"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Load job.json (no secrets)"
    code: "import json\nfrom pathlib import Path\n\ncfg = json.loads(Path(\"/data/config/job.json\").read_text(encoding=\"utf-8\"))\nrequired = (\"warehouse\", \"database\", \"dry_run\")\nmissing = [k for k in required if k not in cfg]\nif missing:\n    raise ValueError(f\"missing config: {missing}\")\nif any(k in cfg for k in (\"password\", \"secret\", \"token\")):\n    raise ValueError(\"do not store secrets in the job file\")\nprint(cfg[\"warehouse\"], cfg[\"database\"], \"dry_run=\", cfg[\"dry_run\"])"
    note: "Run in the local lab. Names belong in git; passwords never do. This fixture has no credentials."
  - label: "Required env names"
    code: "import os\n\nREQUIRED = (\"WH\", \"DB\")\nmissing = [k for k in REQUIRED if k not in os.environ]\nprint(\"missing env\", missing or \"none — set these in the job, not the notebook\")"
    note: "The in-browser lab has no secret manager. Fail loud when a name is absent — never default a password."
  - label: "DRY_RUN flag"
    code: "dry_run = True  # from /data/config/job.json in the lab\nprint(\"would load\" if dry_run else \"loading\")"
    note: "A dry-run rehearses extract/transform without publishing. Orchestrators pass the flag."
quiz:
  - question: "Where should warehouse passwords live?"
    options:
      - "In the repo README"
      - "Hardcoded in notebooks"
      - "Secret manager / CI secrets injected at runtime"
      - "Git commit messages"
    answer: 2
  - question: "A notebook cell with TOKEN = 'dapi…' is…"
    options:
      - "Fine if the notebook is in a private repo"
      - "A committed secret — move it to a secret scope / CI inject"
      - "Required by Spark"
      - "Safer than env vars"
    answer: 1
    explanation: "Repos get cloned. Secret managers get injected at runtime."
  - question: "dry_run as a typed setting helps because…"
    options:
      - "It prints the password"
      - "Jobs can preview writes in staging without a code change"
      - "It disables logging"
      - "It is required by JSON"
    answer: 1
    explanation: "Flags belong in env. Do not fork the job to skip a MERGE."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Config, secrets, and environment boundaries

Practice loading `/data/config/job.json` in the **local practice lab** on this page. That fixture has warehouse/database names and `dry_run` — **no passwords**. Pydantic + env injection below is the repo twin.

## Typed settings

```python
import os
from pydantic import BaseModel

class Settings(BaseModel):
    warehouse: str
    database: str
    dry_run: bool = False

settings = Settings(
    warehouse=os.environ["WH"],
    database=os.environ["DB"],
    dry_run=os.environ.get("DRY_RUN", "0") == "1",
)
```

## Rules

- Secrets via env / secret manager only
- `DRY_RUN` flags for safe rehearsals
- Fail startup if required config missing

## Exercises

### Exercise 1
List 5 config values that differ between staging and prod for a Snowflake loader.
