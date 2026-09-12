import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import {
  MERGE_PAYLOAD_MAX_KEYS,
  getProgressForUser,
  mergeLocalProgress,
  upsertProgress,
} from "@/lib/auth/users";
import { assertCsrf } from "@/lib/auth/csrf";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { isValidProgressIds } from "@/lib/auth/progress-validate";

export const runtime = "nodejs";

/** Tens of writes/minute — enough for lesson + quiz + lab step clicks. */
const PROGRESS_WINDOW_MS = 60 * 1000;
const PROGRESS_IP_LIMIT = 60;
const PROGRESS_USER_LIMIT = 40;

type LessonPatch = {
  completed?: boolean;
  quizScore?: number;
  quizTotal?: number;
  stepIndex?: number;
  updatedAt?: string;
};

function lessonsPayload(userId: number) {
  const progress = getProgressForUser(userId);
  return {
    lessons: Object.fromEntries(
      progress.map((p) => [
        `${p.track}:${p.slug}`,
        {
          completed: Boolean(p.completed),
          quizScore: p.quiz_score ?? undefined,
          quizTotal: p.quiz_total ?? undefined,
          stepIndex: p.step_index ?? undefined,
          updatedAt: p.updated_at,
        },
      ]),
    ),
  };
}

function rateLimitProgress(req: Request, userId: number) {
  const ip = clientIp(req);
  const ipLimit = rateLimit(`progress:ip:${ip}`, PROGRESS_IP_LIMIT, PROGRESS_WINDOW_MS);
  if (!ipLimit.ok) return ipLimit;
  return rateLimit(`progress:user:${userId}`, PROGRESS_USER_LIMIT, PROGRESS_WINDOW_MS);
}

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(lessonsPayload(session.id));
}

export async function POST(req: Request) {
  const csrf = await assertCsrf(req);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.error }, { status: csrf.status });
  }

  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimitProgress(req, session.id);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many progress updates. Try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: {
    track?: unknown;
    slug?: unknown;
    completed?: boolean;
    quizScore?: number;
    quizTotal?: number;
    stepIndex?: number;
    merge?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.merge !== undefined) {
    if (
      typeof body.merge !== "object" ||
      body.merge === null ||
      Array.isArray(body.merge)
    ) {
      return NextResponse.json({ error: "Invalid merge payload" }, { status: 400 });
    }
    const merge = body.merge as Record<string, LessonPatch>;
    const keyCount = Object.keys(merge).length;
    if (keyCount > MERGE_PAYLOAD_MAX_KEYS) {
      return NextResponse.json(
        { error: `Merge payload exceeds ${MERGE_PAYLOAD_MAX_KEYS} keys` },
        { status: 400 },
      );
    }
    try {
      mergeLocalProgress(session.id, merge);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Merge failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else if (isValidProgressIds(body.track, body.slug)) {
    try {
      upsertProgress(session.id, {
        track: body.track as string,
        slug: body.slug as string,
        completed: body.completed,
        quizScore: body.quizScore,
        quizTotal: body.quizTotal,
        stepIndex: body.stepIndex,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } else if (body.track != null || body.slug != null) {
    return NextResponse.json({ error: "Invalid track or slug" }, { status: 400 });
  } else {
    return NextResponse.json({ error: "Missing progress payload" }, { status: 400 });
  }

  return NextResponse.json(lessonsPayload(session.id));
}
