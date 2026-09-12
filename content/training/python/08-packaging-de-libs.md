---
slug: python-packaging-de-libs
track: python
title: "Packaging shared DE libraries"
description: "Versioned internal packages, wheels for Jobs, and avoiding notebook copy-paste drift."
level: advanced
order: 8
durationMinutes: 30
topics: [python, databricks]
objectives:
  - "Structure a sharable transforms package"
  - "Pin versions in job environments"
  - "Document public APIs"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Installable contract"
    code: "# pyproject.toml\n[project]\nname = \"aurora-orders\"\nversion = \"0.1.0\"\n# pin pytest; keep secrets out of the package data"
    note: "Shared rules live in a package. Copy-pasted notebook cells drift."
quiz:
  - question: "Copy-pasting transforms across notebooks mainly causes…"
    options:
      - "Faster CI"
      - "Drift and inconsistent bugfixes"
      - "Better security"
      - "Automatic schema evolution"
    answer: 1
  - question: "Why package a watermark helper instead of pasting it into every notebook?"
    options:
      - "Packages are slower"
      - "One tested version, one import — notebooks drift"
      - "pip forbids DE code"
      - "Spark cannot import"
    answer: 1
    explanation: "Shared libraries are how you stop four slightly different watermark functions."
  - question: "What should never ship inside the wheel?"
    options:
      - "The TypedDict for OrderRow"
      - "A .env with warehouse passwords"
      - "pytest tests (dev extra is fine)"
      - "A README that names the grain"
    answer: 1
    explanation: "Secrets are env/CI, not package data."
# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)

---

# Packaging shared DE libraries

```
src/
  company_de/
    __init__.py
    contracts.py
    transforms/
pyproject.toml
```

Publish internal wheels; install in Databricks Job clusters / containers. Semver breaking changes carefully.

## Capstone exercise

Extract two transforms from earlier lessons into a tiny package with tests and a README section.
