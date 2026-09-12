"use client";

import type { TrackId } from "./types";
import { authedFetch } from "@/lib/auth/client";

const KEY = "dth-progress-v3";
const LEGACY_KEY = "dth-progress-v2";

export interface LessonProgress {
  completed: boolean;
  quizScore?: number;
  quizTotal?: number;
  stepIndex?: number;
  updatedAt: string;
}

/** Prompt E placement landing — no quiz scores stored. */
export type PlacementLanding = "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";

export interface PlacementResult {
  landingLevel: PlacementLanding;
  setAt: string;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  /** Client-only skip-ahead result. Not a score; not synced as an exam. */
  placement?: PlacementResult;
}

/** Legacy progress keys from old lesson URL/slug experiments. */
const SLUG_ALIASES: Record<string, string> = {
  "ask-better-questions": "pe-ask-better-questions",
  "01-ask-better-questions": "pe-ask-better-questions",
};

function canonicalSlug(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

function lessonKey(track: TrackId | string, slug: string) {
  return `${track}:${canonicalSlug(slug)}`;
}

const PLACEMENT_LANDINGS = new Set<PlacementLanding>([
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "L6",
  "L7",
]);

function readPlacement(raw: unknown): PlacementResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const landingLevel = (raw as PlacementResult).landingLevel;
  const setAt = (raw as PlacementResult).setAt;
  if (!PLACEMENT_LANDINGS.has(landingLevel)) return undefined;
  if (typeof setAt !== "string" || !setAt) return undefined;
  return { landingLevel, setAt };
}

function normalizeProgressKeys(state: ProgressState): ProgressState {
  const lessons: ProgressState["lessons"] = {};
  for (const [key, value] of Object.entries(state.lessons ?? {})) {
    const idx = key.indexOf(":");
    if (idx < 0) {
      lessons[key] = value;
      continue;
    }
    const track = key.slice(0, idx);
    const slug = key.slice(idx + 1);
    const nextKey = lessonKey(track, slug);
    const prev = lessons[nextKey];
    if (!prev || (value.updatedAt || "") >= (prev.updatedAt || "")) {
      lessons[nextKey] = value;
    }
  }
  const placement = readPlacement(state.placement);
  return placement ? { lessons, placement } : { lessons };
}


function migrateLegacy(): ProgressState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressState;
    localStorage.setItem(KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return null;
  }
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return { lessons: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacy = migrateLegacy();
      return normalizeProgressKeys(legacy ?? { lessons: {} });
    }
    return normalizeProgressKeys(JSON.parse(raw) as ProgressState);
  } catch {
    return { lessons: {} };
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Wipe guest/local progress — use on fresh signup so a new account starts at 0%. */
export function clearLocalProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY_KEY);
}

/** Overwrite local progress with server state (no guest merge). Keep local placement. */
export function replaceLocalProgress(serverLessons: Record<string, LessonProgress>) {
  if (typeof window === "undefined") return { lessons: serverLessons };
  const placement = loadProgress().placement;
  const next: ProgressState = placement
    ? { lessons: { ...serverLessons }, placement }
    : { lessons: { ...serverLessons } };
  saveProgress(next);
  return next;
}

export function loadPlacement(): PlacementResult | undefined {
  return loadProgress().placement;
}

export function savePlacement(landingLevel: PlacementLanding): ProgressState {
  const state = loadProgress();
  state.placement = { landingLevel, setAt: new Date().toISOString() };
  saveProgress(state);
  return state;
}

export function clearPlacement(): ProgressState {
  const state = loadProgress();
  delete state.placement;
  saveProgress(state);
  return state;
}

export function getLessonProgress(track: string, slug: string): LessonProgress | undefined {
  return loadProgress().lessons[lessonKey(track, slug)];
}

async function syncToServer(
  track: string,
  slug: string,
  patch: Partial<LessonProgress>,
) {
  try {
    await authedFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({
        track,
        slug,
        completed: patch.completed,
        quizScore: patch.quizScore,
        quizTotal: patch.quizTotal,
        stepIndex: patch.stepIndex,
      }),
    });
  } catch {
    /* offline / guest */
  }
}

export function upsertLessonProgress(
  track: string,
  slug: string,
  patch: Partial<LessonProgress>,
): ProgressState {
  const state = loadProgress();
  const key = lessonKey(track, slug);
  const prev = state.lessons[key] ?? {
    completed: false,
    updatedAt: new Date().toISOString(),
  };
  state.lessons[key] = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveProgress(state);
  void syncToServer(track, slug, state.lessons[key]);
  return state;
}

export function markLessonComplete(track: string, slug: string) {
  return upsertLessonProgress(track, slug, { completed: true });
}

export function trackCompletion(
  track: string,
  slugs: string[],
): { done: number; total: number; pct: number } {
  const state = loadProgress();
  const done = slugs.filter((s) => state.lessons[lessonKey(track, s)]?.completed).length;
  const total = slugs.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Merge server progress into localStorage (server wins on newer timestamps). */
export function mergeServerProgress(
  serverLessons: Record<string, LessonProgress>,
): ProgressState {
  const local = loadProgress();
  const merged: ProgressState = { lessons: { ...local.lessons } };
  for (const [key, remote] of Object.entries(serverLessons)) {
    const cur = merged.lessons[key];
    if (!cur) {
      merged.lessons[key] = remote;
      continue;
    }
    const localTs = Date.parse(cur.updatedAt || 0 as unknown as string) || 0;
    const remoteTs = Date.parse(remote.updatedAt || 0 as unknown as string) || 0;
    if (remoteTs >= localTs) {
      merged.lessons[key] = {
        ...cur,
        ...remote,
        completed: remote.completed || cur.completed,
      };
    } else {
      merged.lessons[key] = {
        ...remote,
        ...cur,
        completed: cur.completed || remote.completed,
      };
    }
  }
  const placement = local.placement;
  const next: ProgressState = placement ? { lessons: merged.lessons, placement } : merged;
  saveProgress(next);
  return next;
}

export async function pushLocalProgressToServer() {
  const state = loadProgress();
  if (!Object.keys(state.lessons).length) return state;
  try {
    const res = await authedFetch("/api/progress", {
      method: "POST",
      body: JSON.stringify({ merge: state.lessons }),
    });
    if (!res.ok) return state;
    const data = (await res.json()) as { lessons: Record<string, LessonProgress> };
    return mergeServerProgress(data.lessons);
  } catch {
    return state;
  }
}

export async function pullServerProgress() {
  try {
    const res = await fetch("/api/progress");
    if (!res.ok) return loadProgress();
    const data = (await res.json()) as { lessons: Record<string, LessonProgress> };
    return mergeServerProgress(data.lessons);
  } catch {
    return loadProgress();
  }
}
