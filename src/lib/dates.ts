import { formatDistanceToNow, parseISO, isValid } from "date-fns";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseDate(value: string): Date | null {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

/** Calendar date in UTC so SSR and the browser always print the same string. */
export function formatDate(value: string): string {
  const d = parseDate(value);
  if (!d) return value;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Absolute timestamp labeled UTC — never uses the host timezone. */
export function formatDateTime(value: string): string {
  const d = parseDate(value);
  if (!d) return value;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(value)} · ${hh}:${mm} UTC`;
}

/** Relative phrases depend on "now" — only call after mount. */
export function relativeTime(value: string): string {
  const d = parseDate(value);
  if (!d) return value;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function todayISODate(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
