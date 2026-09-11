import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { assertCsrf } from "@/lib/auth/csrf";
import { readSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

/**
 * Development helper — run the daily refresh script.
 * Prefer `npm run refresh:daily` in CI/local shells.
 * Disabled in production builds unless ALLOW_REFRESH_API=1.
 * Even when enabled, POST requires CSRF + an authenticated session.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_REFRESH_API !== "1") {
    return NextResponse.json(
      { ok: false, error: "Refresh API disabled in production" },
      { status: 403 },
    );
  }

  const csrf = await assertCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: csrf.status });
  }

  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const script = path.join(process.cwd(), "scripts", "refresh-daily.mjs");
  try {
    const { stdout, stderr } = await execFileAsync("node", [script], {
      cwd: process.cwd(),
      env: process.env,
    });
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST to run refresh, or use: npm run refresh:daily",
  });
}
