/** Same-page bridge: TryIt Run deep-links to #lab and hands the edited SQL to the lab. */

export const TRYIT_RUN_EVENT = "dth-tryit-run";

export interface TryItRunDetail {
  sql: string;
}

export function dispatchTryItRun(sql: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TryItRunDetail>(TRYIT_RUN_EVENT, { detail: { sql } }));
}
