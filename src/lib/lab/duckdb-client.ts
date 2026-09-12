import { LAB_OPTIONAL_CATALOG_SQL, LAB_SEED_SQL, seedStatements } from "./seed";
import { assertSafeLabSql, LAB_RESULT_ROW_LIMIT } from "./sql-guard";
import { cellText, headerText } from "./render";

export interface LabQueryResult {
  columns: string[];
  rows: string[][];
  rowCount: number;
  truncated: boolean;
}

type DuckDbModule = typeof import("@duckdb/duckdb-wasm");

let dbPromise: Promise<InstanceType<DuckDbModule["AsyncDuckDB"]>> | null = null;

function publicUrl(file: string): string {
  return new URL(`/duckdb/${file}`, window.location.origin).toString();
}

async function initDb() {
  const duckdb = await import("@duckdb/duckdb-wasm");
  const bundles: import("@duckdb/duckdb-wasm").DuckDBBundles = {
    mvp: {
      mainModule: publicUrl("duckdb-mvp.wasm"),
      mainWorker: publicUrl("duckdb-browser-mvp.worker.js"),
    },
    eh: {
      mainModule: publicUrl("duckdb-eh.wasm"),
      mainWorker: publicUrl("duckdb-browser-eh.worker.js"),
    },
  };
  const bundle = await duckdb.selectBundle(bundles);
  if (!bundle.mainWorker || !bundle.mainModule) {
    throw new Error("Local SQL engine assets are missing. Refresh and try again.");
  }
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();
  try {
    for (const stmt of seedStatements(LAB_SEED_SQL)) {
      await conn.query(stmt);
    }
    try {
      for (const stmt of seedStatements(LAB_OPTIONAL_CATALOG_SQL)) {
        await conn.query(stmt);
      }
    } catch {
      // Extra in-memory catalogs are optional. Core schemas/views still load.
    }
  } finally {
    await conn.close();
  }
  return db;
}

async function getDb() {
  if (typeof window === "undefined") {
    throw new Error("The local practice lab only runs in the browser.");
  }
  if (!dbPromise) {
    dbPromise = initDb().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

function fieldDecimalScale(field: { type?: { scale?: unknown } }): number | undefined {
  const scale = field.type?.scale;
  return typeof scale === "number" && Number.isInteger(scale) && scale > 0 ? scale : undefined;
}

export async function runLabSql(sql: string): Promise<LabQueryResult> {
  const safe = assertSafeLabSql(sql);
  const wrapped = `SELECT * FROM (${safe}) AS lab_q LIMIT ${LAB_RESULT_ROW_LIMIT + 1}`;
  const db = await getDb();
  const conn = await db.connect();
  try {
    const table = await Promise.race([
      conn.query(wrapped),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Query timed out (10s).")), 10_000);
      }),
    ]);
    const fields = table.schema.fields;
    const rawNames = fields.map((f) => f.name);
    const columns = rawNames.map((name) => headerText(name));
    const records = table.toArray();
    const truncated = records.length > LAB_RESULT_ROW_LIMIT;
    const sliced = truncated ? records.slice(0, LAB_RESULT_ROW_LIMIT) : records;
    const rows = sliced.map((row) => {
      const obj = row.toJSON() as Record<string, unknown>;
      return fields.map((field) =>
        cellText(obj[field.name] ?? (row as Record<string, unknown>)[field.name], {
          decimalScale: fieldDecimalScale(field),
        }),
      );
    });
    return {
      columns,
      rows,
      rowCount: sliced.length,
      truncated,
    };
  } finally {
    await conn.close();
  }
}
