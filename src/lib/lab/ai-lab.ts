/**
 * Wave B1 — AI Local practice (pure client).
 * Kill-switch: NEXT_PUBLIC_AI_LAB=0 omits chrome; Copy stays.
 * Unset or any other value ships the in-page checklist (no server, no vendor key).
 */
export function isAiLabEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_LAB !== "0";
}

export const PE_LAB_ENTRY_SLUG = "pe-ask-better-questions";
export const AI_DE_LAB_ENTRY_SLUG = "ai-de-practice-agents";

export const PE_LAB_SLUGS = [
  "pe-ask-better-questions",
  "pe-structure-prompts",
  "pe-iterate-and-refine",
  "pe-verify-answers",
  "pe-safety-privacy",
  "pe-prompts-for-learning",
  "pe-de-role-prompt-library",
] as const;

export const AI_DE_LAB_SLUGS = [
  "ai-de-copilot-mindset",
  "ai-de-debug-with-ai",
  "ai-de-generate-code-safely",
  "ai-de-docs-and-tests",
  "ai-de-tools-workflow",
  "ai-de-review-changes",
  "ai-de-practice-agents",
  "ai-de-practice-nonsf-agents",
] as const;

export type PeLabSlug = (typeof PE_LAB_SLUGS)[number];
export type AiDeLabSlug = (typeof AI_DE_LAB_SLUGS)[number];

export function isPromptEngineeringLabSlug(slug: string): boolean {
  return (PE_LAB_SLUGS as readonly string[]).includes(slug);
}

export function isAiDataEngLabSlug(slug: string): boolean {
  return (AI_DE_LAB_SLUGS as readonly string[]).includes(slug);
}

/** True when this lesson may host AI Local practice (ignores the env kill-switch). */
export function isAiLabSlug(track: string, slug: string): boolean {
  return (
    (track === "prompt-engineering" && isPromptEngineeringLabSlug(slug)) ||
    (track === "ai-data-eng" && isAiDataEngLabSlug(slug))
  );
}

/** Flag on + PE / AI-for-DE lesson. */
export function isAiLabLesson(track: string, slug: string): boolean {
  return isAiLabEnabled() && isAiLabSlug(track, slug);
}

export function aiLabEntrySlug(track: string): string | undefined {
  if (!isAiLabEnabled()) return undefined;
  if (track === "prompt-engineering") return PE_LAB_ENTRY_SLUG;
  if (track === "ai-data-eng") return AI_DE_LAB_ENTRY_SLUG;
  return undefined;
}

export function aiLabCtaLabel(track: string): string | undefined {
  if (!isAiLabEnabled()) return undefined;
  if (track === "prompt-engineering") return "Practice · Prompt lab";
  if (track === "ai-data-eng") return "Practice · AI lab";
  return undefined;
}
