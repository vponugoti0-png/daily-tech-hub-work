/** Strip C0 controls so query cells never become HTML / unexpected markup. */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NaN";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof String || value instanceof Number || value instanceof Boolean) {
    return cellText(value.valueOf());
  }
  if (typeof value === "object") {
    if (typeof (value as { toJSON?: unknown }).toJSON === "function") {
      try {
        const jsonish = (value as { toJSON: () => unknown }).toJSON();
        if (jsonish !== value && (jsonish === null || typeof jsonish !== "object" || jsonish instanceof Date)) {
          return cellText(jsonish);
        }
      } catch {
        // Fall through to stringify.
      }
    }
    try {
      const encoded = JSON.stringify(value);
      if (encoded === undefined) return "[object]";
      return sanitizeText(unwrapQuotedCell(encoded));
    } catch {
      return "[object]";
    }
  }
  return sanitizeText(unwrapQuotedCell(String(value)));
}

/**
 * DuckDB-WASM / Arrow `toJSON()` often leaves DECIMAL and VARCHAR cells as a
 * JSON string literal (`"12.50"`) or leftover `\"12.50\"` chrome. Unwrap that
 * as plain text — never HTML-unescape, never interpret markup.
 */
export function unwrapQuotedCell(raw: string): string {
  let text = raw;
  for (let i = 0; i < 2; i++) {
    const next = unwrapQuotedCellOnce(text);
    if (next === text) break;
    text = next;
  }
  return text;
}

function unwrapQuotedCellOnce(text: string): string {
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (typeof parsed === "string") return parsed;
    } catch {
      // Not a JSON string literal.
    }
  }
  if (text.length >= 4 && text.startsWith('\\"') && text.endsWith('\\"')) {
    return text.slice(2, -2);
  }
  return text;
}

export function sanitizeText(raw: string): string {
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function headerText(name: string): string {
  const cleaned = sanitizeText(name).trim();
  return cleaned || "column";
}
