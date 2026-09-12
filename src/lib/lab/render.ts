export type CellTextOptions = {
  /** Arrow DECIMAL scale (e.g. 2 → 6425 displays as 64.25). */
  decimalScale?: number;
};

/** Strip C0 controls so query cells never become HTML / unexpected markup. */
export function cellText(value: unknown, options?: CellTextOptions): string {
  const scale = options?.decimalScale;
  if (typeof scale === "number" && scale > 0) {
    const scaled = formatScaledDecimal(value, scale);
    if (scaled != null) return sanitizeText(scaled);
  }
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NaN";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof String || value instanceof Number || value instanceof Boolean) {
    return cellText(value.valueOf(), options);
  }
  if (typeof value === "object") {
    if (typeof (value as { toJSON?: unknown }).toJSON === "function") {
      try {
        const jsonish = (value as { toJSON: () => unknown }).toJSON();
        if (jsonish !== value && (jsonish === null || typeof jsonish !== "object" || jsonish instanceof Date)) {
          return cellText(jsonish, options);
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
 * Arrow DecimalBigNum.toJSON() is `"${unscaled}"` (quotes in the string, no
 * scale). Unwrap that chrome and apply scale so 6425 / `"6425"` → 64.25.
 */
export function formatScaledDecimal(value: unknown, scale: number): string | null {
  const digits = unscaledDecimalDigits(value);
  if (digits == null) return null;
  return applyDecimalScale(digits, scale);
}

function unscaledDecimalDigits(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
    return String(value);
  }
  if (typeof value === "string") {
    return integerDigits(unwrapQuotedCell(value.trim()));
  }
  if (typeof value === "object") {
    if (typeof (value as { toString?: unknown }).toString === "function") {
      const asText = integerDigits(unwrapQuotedCell(value.toString()));
      if (asText) return asText;
    }
    if (typeof (value as { toJSON?: unknown }).toJSON === "function") {
      try {
        const jsonish = (value as { toJSON: () => unknown }).toJSON();
        if (typeof jsonish === "string" || typeof jsonish === "number" || typeof jsonish === "bigint") {
          return unscaledDecimalDigits(jsonish);
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

function integerDigits(text: string): string | null {
  return /^-?\d+$/.test(text) ? text : null;
}

export function applyDecimalScale(unscaled: string, scale: number): string {
  const negative = unscaled.startsWith("-");
  const digits = (negative ? unscaled.slice(1) : unscaled).replace(/^0+(?=\d)/, "") || "0";
  const padded = digits.padStart(scale + 1, "0");
  const split = padded.length - scale;
  const text = `${padded.slice(0, split)}.${padded.slice(split)}`;
  return negative ? `-${text}` : text;
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
