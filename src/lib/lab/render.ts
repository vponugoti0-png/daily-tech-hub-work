/** Strip C0 controls so query cells never become HTML / unexpected markup. */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NaN";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return sanitizeText(JSON.stringify(value));
    } catch {
      return "[object]";
    }
  }
  return sanitizeText(String(value));
}

export function sanitizeText(raw: string): string {
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function headerText(name: string): string {
  const cleaned = sanitizeText(name).trim();
  return cleaned || "column";
}
