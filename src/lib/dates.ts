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

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value: string): Date | null {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

/** YYYY-MM-DD as a calendar label — no timezone shift (avoids off-by-a-day). */
export function formatCalendarDate(value: string): string | null {
  const m = DATE_ONLY.exec(value.trim());
  if (!m) return null;
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const year = Number(m[1]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return `${MONTHS[month]} ${day}, ${year}`;
}

/** Calendar date. Date-only strings stay on that civil day; timestamps stay UTC. */
export function formatDate(value: string): string {
  const calendar = formatCalendarDate(value);
  if (calendar) return calendar;
  const d = parseDate(value);
  if (!d) return value;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Viewer's local civil date. Only call after mount (depends on host TZ). */
export function formatLocalDate(value: string | Date): string {
  const d = value instanceof Date ? value : parseDate(value);
  if (!d) return typeof value === "string" ? value : "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Absolute timestamp labeled UTC — never uses the host timezone. */
export function formatDateTime(value: string): string {
  const d = parseDate(value);
  if (!d) return value;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const calendar = formatCalendarDate(value);
  const day = calendar ?? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  return `${day} · ${hh}:${mm} UTC`;
}

/** Relative phrases depend on "now" — only call after mount. */
export function relativeTime(value: string): string {
  const d = parseDate(value);
  if (!d) return value;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Local civil date (YYYY-MM-DD). Used so "today" matches the viewer's clock. */
export function todayISODate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
