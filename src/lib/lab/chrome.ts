/** Shared Local practice lab chrome — same honest labels on SQL / Databricks / Snowflake. */

export const LAB_HEADING = "Local practice lab";
export const LAB_ENGINE_LABEL = "DuckDB";
export const LAB_PYTHON_ENGINE_LABEL = "Pyodide";

export function labEngineLabel(track: string): string {
  return track === "python" ? LAB_PYTHON_ENGINE_LABEL : LAB_ENGINE_LABEL;
}

export function labHonestyLine(track: string): string {
  if (track === "python") {
    return "Not a live notebook or remote kernel. Python samples run locally in your browser — no cloud credentials, no shell.";
  }
  if (track === "snowflake") {
    return "Not a live Snowflake account. SQL samples run locally in your browser — no cloud credentials, no shell.";
  }
  if (track === "sql") {
    return "Not a live warehouse. SQL samples run locally in your browser — no cloud credentials, no shell.";
  }
  return "Not a live Databricks workspace. SQL samples run locally in your browser — no cloud credentials, no shell.";
}

export function labEditorLabel(track: string): string {
  return track === "python" ? "Python to run" : "SQL to run";
}

export function labSampleLabel(track: string): string {
  return track === "python" ? "Python sample" : "SQL sample";
}

export function labRunLabel(track: string): string {
  return track === "python" ? "Run sample" : "Run sample";
}

export function labRunAria(track: string): string {
  return track === "python" ? "Run Python sample" : "Run SQL sample";
}
