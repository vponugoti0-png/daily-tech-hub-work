/**
 * Same-origin practice files for the Python local lab VFS.
 * Written under /data/… in Pyodide (in-browser). Not a cloud bucket.
 * Stdlib only — csv / json / pathlib. No pandas wheel, no remote fetch.
 */

export interface LabVfsFile {
  path: string;
  label: string;
  contents: string;
}

export const LAB_VFS_MAX_CHARS = 20_000;

const ORDERS_CSV = `order_id,status,amount,promo_code
1001,paid,42.50,FALL26
1002,paid,18.00,
1003,pending,99.00,FALL26
1004,cancelled,12.00,WIN25
1005,paid,64.25,VIP
`;

const CUSTOMERS_JSON = `[
  {"customer_id": 1, "region": "west", "status": "active"},
  {"customer_id": 2, "region": "east", "status": "active"},
  {"customer_id": 3, "region": "west", "status": "churned"}
]
`;

const JOB_CONFIG_JSON = `{
  "job_name": "orders_etl",
  "start": "2026-09-01",
  "end": "2026-09-02",
  "env": "lab",
  "warehouse": "learn_wh",
  "database": "analytics",
  "dry_run": true
}
`;

const LANDING_ORDERS_11 = `[
  {"order_id": 1001, "status": "paid", "amount": 12.5, "promo_code": "FALL26"},
  {"order_id": 1002, "status": "pending", "amount": 18.0, "promo_code": null},
  {"order_id": 1008, "status": "paid", "amount": 31.0, "promo_code": "FLASH"},
  {"order_id": 1009, "status": "pending", "amount": 48.0, "promo_code": null},
  {"order_id": 1010, "status": "paid", "amount": null, "promo_code": "FALL26"}
]
`;

const LANDING_ORDERS_12 = `[
  {"order_id": 1001, "status": "paid", "amount": 42.5},
  {"order_id": 1002, "status": "paid", "amount": 18.0}
]
`;

const LANDING_NOTES = `{
  "note": "not an orders file"
}
`;

const LANDING_ORDERS_13 = `[
  {"order_id": 1005, "status": "paid", "amount": 64.25, "promo_code": "VIP"},
  {"order_id": 1007, "status": "paid", "amount": 7.5, "promo_code": "FLASH"},
  {"order_id": 1011, "status": "paid", "amount": 88.0, "promo_code": "VIP"},
  {"order_id": 1012, "status": "returned", "amount": 31.0, "promo_code": "FLASH"},
  {"order_id": 1014, "status": "paid", "amount": 27.4, "promo_code": "EMEA26"},
  {"order_id": 1015, "status": "paid", "amount": 12.0, "promo_code": null}
]
`;

const RETURNS_JSON = `[
  {"refund_id": 9001, "order_id": 1006, "amount": 22.0, "reason": "changed_mind"},
  {"refund_id": 9002, "order_id": 1012, "amount": 31.0, "reason": "damaged"}
]
`;

const PROMOS_JSON = `[
  {"code": "FALL26", "pct": 10},
  {"code": "FLASH", "pct": 15},
  {"code": "VIP", "pct": 20},
  {"code": "EMEA26", "pct": 12}
]
`;

const SHIPMENTS_JSON = `[
  {"order_id": 1001, "carrier": "lane-express", "status": "delivered"},
  {"order_id": 1002, "carrier": "hub-freight", "status": "in_transit"},
  {"order_id": 1006, "carrier": "hub-freight", "status": "returned"}
]
`;

const TICKETS_JSON = `[
  {"ticket_id": 501, "customer_id": 1, "severity": "high", "status": "open"},
  {"ticket_id": 502, "customer_id": 2, "severity": "low", "status": "closed"}
]
`;

const EVENTS_JSONL = `${JSON.stringify({ event_id: 9001, order_id: 1001, event_type: "checkout" })}
${JSON.stringify({ event_id: 9002, order_id: 1001, event_type: "paid" })}
`;

/** Full seed written on engine init and before each Run. */
export const LAB_VFS_SEED: LabVfsFile[] = [
  {
    path: "/data/orders.csv",
    label: "orders.csv",
    contents: ORDERS_CSV,
  },
  {
    path: "/data/customers.json",
    label: "customers.json",
    contents: CUSTOMERS_JSON,
  },
  {
    path: "/data/customers/customers.json",
    label: "customers.json",
    contents: CUSTOMERS_JSON,
  },
  {
    path: "/data/shipments/shipments.json",
    label: "shipments.json",
    contents: SHIPMENTS_JSON,
  },
  {
    path: "/data/tickets/tickets.json",
    label: "tickets.json",
    contents: TICKETS_JSON,
  },
  {
    path: "/data/events/events.jsonl",
    label: "events.jsonl",
    contents: EVENTS_JSONL,
  },
  {
    path: "/data/config/job.json",
    label: "job.json",
    contents: JOB_CONFIG_JSON,
  },
  {
    path: "/data/ref/promos.json",
    label: "promos.json",
    contents: PROMOS_JSON,
  },
  {
    path: "/data/landing/orders/2026-09-11/orders_2026-09-11.json",
    label: "orders_2026-09-11.json",
    contents: LANDING_ORDERS_11,
  },
  {
    path: "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    label: "orders_2026-09-12.json",
    contents: LANDING_ORDERS_12,
  },
  {
    path: "/data/landing/orders/2026-09-12/notes.json",
    label: "notes.json",
    contents: LANDING_NOTES,
  },
  {
    path: "/data/landing/orders/2026-09-13/orders_2026-09-13.json",
    label: "orders_2026-09-13.json",
    contents: LANDING_ORDERS_13,
  },
  {
    path: "/data/landing/returns/2026-09-12/returns_2026-09-12.json",
    label: "returns_2026-09-12.json",
    contents: RETURNS_JSON,
  },
];

const DEFAULT_EDITOR_PATHS = ["/data/orders.csv", "/data/customers.json"];

const EDITOR_PATHS_BY_LESSON: Record<string, string[]> = {
  "python-pathlib-extracts": [
    "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    "/data/landing/orders/2026-09-12/notes.json",
    "/data/orders.csv",
  ],
  "python-config-and-secrets": ["/data/config/job.json", "/data/orders.csv"],
  "python-dataframe-contracts": ["/data/orders.csv", "/data/customers.json"],
  "python-idempotent-writers": ["/data/orders.csv", "/data/customers.json"],
  "python-etl-pipeline-builder": ["/data/orders.csv", "/data/customers.json"],
  "python-vfs-datasets": [
    "/data/orders.csv",
    "/data/customers/customers.json",
    "/data/shipments/shipments.json",
    "/data/events/events.jsonl",
  ],
};

export function isLabVfsPath(path: string): boolean {
  return path.startsWith("/data/") && !path.includes("..") && !path.includes("\0");
}

export function vfsFileByPath(path: string): LabVfsFile | undefined {
  return LAB_VFS_SEED.find((file) => file.path === path);
}

/** Data files shown as editor tabs for a lesson (main.py is always first in the UI). */
export function vfsFilesForLesson(slug: string): LabVfsFile[] {
  const paths = EDITOR_PATHS_BY_LESSON[slug] ?? DEFAULT_EDITOR_PATHS;
  return paths
    .map((path) => vfsFileByPath(path))
    .filter((file): file is LabVfsFile => Boolean(file));
}

export function clipVfsContents(contents: string): string {
  if (contents.length <= LAB_VFS_MAX_CHARS) return contents;
  return contents.slice(0, LAB_VFS_MAX_CHARS);
}
