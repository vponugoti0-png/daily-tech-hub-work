const BLOCKED =
  /\b(ATTACH|DETACH|COPY|EXPORT|IMPORT|INSTALL|LOAD|PRAGMA|CALL|CHECKPOINT|SET|RESET|CREATE\s+SECRET|CREATE\s+MACRO|PIVOT)\b/i;

/**
 * Lab v1 is SQL samples only — read-only SELECT/WITH against local DuckDB tables.
 * Rejects multi-statement and remote/extension surfaces even though the engine
 * is in-browser (defense in depth; no cloud credentials exist).
 */
export function assertSafeLabSql(sql: string): string {
  const trimmed = sql.trim().replace(/;+\s*$/g, "").trim();
  if (!trimmed) {
    throw new Error("Enter a SQL sample to run.");
  }
  if (trimmed.includes(";")) {
    throw new Error("Run one statement at a time.");
  }
  if (BLOCKED.test(trimmed)) {
    throw new Error("This local lab only runs read-only SQL samples.");
  }
  if (!/^(WITH|SELECT)\b/i.test(trimmed)) {
    throw new Error("This local lab only runs SELECT / WITH samples against local tables.");
  }
  return trimmed;
}

export const LAB_RESULT_ROW_LIMIT = 50;
