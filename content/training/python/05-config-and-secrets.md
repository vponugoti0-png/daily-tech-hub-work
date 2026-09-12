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
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Env, not notebooks"
    code: "settings = Settings(\n    warehouse=os.environ[\"WH\"],\n    database=os.environ[\"DB\"],\n    dry_run=os.environ.get(\"DRY_RUN\", \"0\") == \"1\",\n)\n# Password: secret manager / CI inject — never commit."
    note: "12-factor. Staging and prod are different env files, not if/else in code."
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
