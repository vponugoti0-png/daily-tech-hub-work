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
  "warehouse": "learn_wh",
  "database": "analytics",
  "dry_run": true
}
`;

const LANDING_ORDERS_JSON = `[
  {"order_id": 1001, "status": "paid", "amount": 42.5},
  {"order_id": 1002, "status": "paid", "amount": 18.0}
]
`;

const LANDING_NOTES_JSON = `{
  "note": "not an orders file"
}
`;

/** Wave A1 extra landing day — paid / pending / null amount. */
const LANDING_ORDERS_SEP11_JSON = `[
  {"order_id": 1008, "status": "paid", "amount": 31.0, "promo_code": "FLASH"},
  {"order_id": 1009, "status": "pending", "amount": 48.0, "promo_code": null},
  {"order_id": 1010, "status": "paid", "amount": null, "promo_code": "FALL26"}
]
`;

const LANDING_ORDERS_SEP13_JSON = `[
  {"order_id": 1011, "status": "paid", "amount": 88.0, "promo_code": "VIP"},
  {"order_id": 1012, "status": "returned", "amount": 31.0, "promo_code": "FLASH"},
  {"order_id": 1014, "status": "paid", "amount": 27.4, "promo_code": "EMEA26"},
  {"order_id": 1015, "status": "paid", "amount": 12.0, "promo_code": null}
]
`;

const LANDING_RETURNS_JSON = `[
  {"refund_id": 9001, "order_id": 1006, "amount": 22.0, "reason": "changed_mind"},
  {"refund_id": 9002, "order_id": 1012, "amount": 31.0, "reason": "damaged"}
]
`;

const PROMOS_REF_JSON = `[
  {"code": "FALL26", "pct": 10},
  {"code": "FLASH", "pct": 15},
  {"code": "VIP", "pct": 20},
  {"code": "EMEA26", "pct": 12}
]
`;

/** Full seed written on engine init and before each Run. Includes Wave A1 extras. */
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
    path: "/data/config/job.json",
    label: "job.json",
    contents: JOB_CONFIG_JSON,
  },
  {
    path: "/data/landing/orders/2026-09-11/orders_2026-09-11.json",
    label: "orders_2026-09-11.json",
    contents: LANDING_ORDERS_SEP11_JSON,
  },
  {
    path: "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    label: "orders_2026-09-12.json",
    contents: LANDING_ORDERS_JSON,
  },
  {
    path: "/data/landing/orders/2026-09-12/notes.json",
    label: "notes.json",
    contents: LANDING_NOTES_JSON,
  },
  {
    path: "/data/landing/orders/2026-09-13/orders_2026-09-13.json",
    label: "orders_2026-09-13.json",
    contents: LANDING_ORDERS_SEP13_JSON,
  },
  {
    path: "/data/landing/returns/2026-09-12/returns_2026-09-12.json",
    label: "returns_2026-09-12.json",
    contents: LANDING_RETURNS_JSON,
  },
  {
    path: "/data/ref/promos.json",
    label: "promos.json",
    contents: PROMOS_REF_JSON,
  },
];

const DEFAULT_EDITOR_PATHS = ["/data/orders.csv", "/data/customers.json"];

const EDITOR_PATHS_BY_LESSON: Record<string, string[]> = {
  "python-pathlib-extracts": [
    "/data/landing/orders/2026-09-12/orders_2026-09-12.json",
    "/data/landing/orders/2026-09-12/notes.json",
    "/data/landing/orders/2026-09-11/orders_2026-09-11.json",
    "/data/landing/returns/2026-09-12/returns_2026-09-12.json",
    "/data/orders.csv",
  ],
  "python-config-and-secrets": ["/data/config/job.json", "/data/orders.csv"],
  "python-dataframe-contracts": ["/data/orders.csv", "/data/customers.json"],
  "python-idempotent-writers": ["/data/orders.csv", "/data/customers.json"],
  "python-etl-pipeline-builder": ["/data/orders.csv", "/data/customers.json"],
  "python-performance-de": ["/data/orders.csv"],
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
