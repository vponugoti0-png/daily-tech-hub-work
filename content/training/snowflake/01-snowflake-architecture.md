---
slug: sf-architecture
track: snowflake
title: "Snowflake architecture for practitioners"
description: "Storage/compute separation, warehouses, credits, and layered database design."
level: beginner
order: 1
durationMinutes: 30
topics: [snowflake]
objectives:
  - "Explain storage vs compute separation"
  - "Size warehouses for workload types"
  - "Organize databases/schemas for medallion-like layers"
updatedAt: "2026-09-11"
cheatSheet:
  - label: "Account map"
    code: "SELECT database, schema, object_name, object_type\nFROM sf_account_objects\nORDER BY database, schema, object_name;"
    note: "Run this in the local practice lab — not a live Snowflake account."
  - label: "Storage vs compute"
    code: "SELECT warehouse_name, size, auto_suspend_s\nFROM sf_warehouses\nORDER BY warehouse_name;"
    note: "Warehouses bill credits while they run. Databases/schemas do not."
quiz:
  - question: "Virtual warehouses primarily provide…"
    options:
      - "Permanent storage only"
      - "Elastic compute billed by credits"
      - "Git hosting"
      - "DNS"
    answer: 1
---

# Snowflake architecture for practitioners

Independent **storage** and **virtual warehouses**. Suspend idle warehouses; separate ETL vs BI warehouses.

## Exercises

1. Propose warehouse sizes for nightly ETL vs daytime BI.
2. Sketch DB/schema layout for raw/analytics/marts.
