/** Shared Local practice lab chrome — same honest labels on SQL / Databricks / Snowflake. */

export const LAB_HEADING = "Local practice lab";
export const LAB_ENGINE_LABEL = "DuckDB";

export function labHonestyLine(track: string): string {
  if (track === "snowflake") {
    return "Not a live Snowflake account. SQL samples run locally in your browser — no cloud credentials, no shell.";
  }
  if (track === "sql") {
    return "Not a live warehouse. SQL samples run locally in your browser — no cloud credentials, no shell.";
  }
  return "Not a live Databricks workspace. SQL samples run locally in your browser — no cloud credentials, no shell.";
}
