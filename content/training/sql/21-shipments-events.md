---
slug: sql-shipments-events
track: sql
title: "Shipments, events, and tickets (local datasets)"
description: "Practice LEFT JOIN shipments, event-grain filters, and open-ticket views on the expanded Aurora DuckDB seed. Still SELECT / WITH only."
level: beginner
order: 21
durationMinutes: 25
topics: [sql]
objectives:
  - "LEFT JOIN shipments without dropping unshipped orders"
  - "Query event grain without fanning out order amount incorrectly"
  - "Read aurora.open_tickets as a stored SELECT"
updatedAt: "2026-09-12"
cheatSheet:
  - label: "Orders × shipments"
    code: "SELECT o.order_id, o.status AS order_status, s.carrier, s.status AS ship_status\nFROM aurora_orders o\nLEFT JOIN aurora_shipments s ON s.order_id = o.order_id\nORDER BY o.order_id;"
    note: "LEFT JOIN keeps pending orders. Run it in the local practice lab."
  - label: "Paid events"
    code: "SELECT e.event_id, e.order_id, e.event_type, o.amount\nFROM aurora_events e\nJOIN aurora_orders o ON o.order_id = e.order_id\nWHERE e.event_type = 'paid'\nORDER BY e.event_id;"
    note: "Event grain. Do not SUM(o.amount) if you later join items."
  - label: "Open tickets view"
    code: "SELECT ticket_id, customer_id, severity, status, reason\nFROM aurora.open_tickets\nORDER BY ticket_id;"
    note: "A view over open/pending tickets. Persist a mart when on-call needs a freshness SLO."
quiz:
  - question: "INNER JOIN shipments on this seed would hide…"
    options:
      - "Every paid order"
      - "Orders that do not have a shipment row yet"
      - "The products table"
      - "NULL promo codes"
    answer: 1
    explanation: "LEFT JOIN keeps the order grain. INNER JOIN is “only shipped.”"
  - question: "aurora.open_tickets is…"
    options:
      - "A live ServiceNow connector"
      - "A view (stored SELECT) over open/pending aurora.tickets"
      - "A Python runtime"
      - "A Databricks %sh cell"
    answer: 1
    explanation: "Views are stored queries. This lab still will not CREATE VIEW for you."
  - question: "Joining events to orders then to items and SUM(amount)…"
    options:
      - "Is always the daily mart"
      - "Fans out order amount per item unless you pick a grain on purpose"
      - "Deletes bronze"
      - "Is required by DuckDB"
    answer: 1
    explanation: "Name the grain. Event + item is a different question than order amount."
---

New **Aurora** fixtures in the same local DuckDB: `aurora_shipments`, `aurora_events`, `aurora_support_tickets`, plus `aurora.open_tickets`. Not a live warehouse.

## LEFT JOIN is a business choice

Unshipped paid orders are still orders. Use `LEFT JOIN` unless the question is “only shipped.”

## Event grain

`checkout` and `paid` can both exist for one `order_id`. Filter `event_type` before you aggregate money.

## Exercises

1. List west-region open/pending tickets (join customers).
2. Count orders with no shipment row (`NOT EXISTS` or anti-join).
3. Count paid events per day without double-counting order amount across items.
