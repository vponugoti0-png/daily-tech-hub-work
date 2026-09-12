export const GIT_PLAY_LAB_ENTRY_SLUG = "git-play-lab";

export const GIT_PLAY_LAB_SLUGS = [
  "git-play-lab",
  "git-rebase-vs-merge",
  "git-commit-hygiene",
  "git-bisect-and-blame",
  "git-branching-dbt-sql",
  "git-pr-templates-data-diffs",
] as const;

export type GitPlayLabSlug = (typeof GIT_PLAY_LAB_SLUGS)[number];

export function isGitPlayLabLesson(track: string, slug: string): boolean {
  return track === "git" && (GIT_PLAY_LAB_SLUGS as readonly string[]).includes(slug);
}
