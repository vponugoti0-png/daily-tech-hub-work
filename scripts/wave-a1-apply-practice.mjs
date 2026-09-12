/**
 * Surgically append Wave A1 quiz + cheatSheet extras onto existing lesson frontmatter.
 * Does not rewrite whole YAML (keeps reviewable diffs).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { EXTRAS } from "./wave-a1-practice-extras.mjs";
import { TOOL_EXTRAS } from "./wave-a1-practice-extras-tools.mjs";
import { WAREHOUSE_EXTRAS } from "./wave-a1-practice-extras-warehouse.mjs";

const ROOT = path.join(process.cwd(), "content/training");
const PACK = { ...EXTRAS, ...TOOL_EXTRAS, ...WAREHOUSE_EXTRAS };

function yamlScalar(value) {
  return JSON.stringify(value);
}

function quizYaml(questions) {
  return questions
    .map((item) => {
      const options = item.options.map((opt) => `      - ${yamlScalar(opt)}`).join("\n");
      return [
        `  - question: ${yamlScalar(item.question)}`,
        "    options:",
        options,
        `    answer: ${item.answer}`,
        `    explanation: ${yamlScalar(item.explanation)}`,
      ].join("\n");
    })
    .join("\n");
}

function cheatYaml(entries) {
  return entries
    .map((item) => {
      const lines = [`  - label: ${yamlScalar(item.label)}`, `    code: ${yamlScalar(item.code)}`];
      if (item.note) lines.push(`    note: ${yamlScalar(item.note)}`);
      return lines.join("\n");
    })
    .join("\n");
}

function splitFrontmatter(raw, file) {
  if (!raw.startsWith("---")) {
    throw new Error(`${file}: missing opening frontmatter`);
  }
  const end = raw.indexOf("\n---", 3);
  if (end < 0) throw new Error(`${file}: missing closing frontmatter`);
  return {
    head: raw.slice(0, end),
    tail: raw.slice(end),
  };
}

function applyFile(file, extras) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  const slug = String(data.slug);
  if (raw.includes("WAVE_A1_APPLIED")) {
    return { slug, skipped: true, q: 0, cs: 0 };
  }

  let { head, tail } = splitFrontmatter(raw, file);
  let addedQ = 0;
  let addedCs = 0;

  if (extras.cheatSheet?.length) {
    const block = cheatYaml(extras.cheatSheet);
    if (/\ncheatSheet:\s*\n/.test(head) || /\ncheatSheet:\s*$/.test(head)) {
      if (!/\nquiz:/.test(head)) {
        throw new Error(`${file}: cheatSheet present but no quiz key`);
      }
      head = head.replace(/\nquiz:/, `\n${block}\nquiz:`);
    } else if (/\nquiz:/.test(head)) {
      head = head.replace(/\nquiz:/, `\ncheatSheet:\n${block}\nquiz:`);
    } else {
      head = `${head}\ncheatSheet:\n${block}`;
    }
    addedCs = extras.cheatSheet.length;
  }

  if (extras.quiz?.length) {
    head = `${head}\n${quizYaml(extras.quiz)}`;
    addedQ = extras.quiz.length;
  }

  const next = `${head}\n# WAVE_A1_APPLIED: extra quiz / TryIt copy (practice volume)\n${tail}`;
  fs.writeFileSync(file, next);
  return { slug, skipped: false, q: addedQ, cs: addedCs };
}

const bySlug = new Map();
for (const track of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, track);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const file = path.join(dir, name);
    const { data } = matter(fs.readFileSync(file, "utf8"));
    bySlug.set(String(data.slug), file);
  }
}

const missingPack = [...bySlug.keys()].filter((slug) => !PACK[slug]);
const extraPack = Object.keys(PACK).filter((slug) => !bySlug.has(slug));
if (missingPack.length || extraPack.length) {
  console.error("Missing extras for", missingPack);
  console.error("Extras with no lesson", extraPack);
  process.exit(1);
}

const summary = [];
for (const [slug, file] of bySlug) {
  summary.push(applyFile(file, PACK[slug]));
}

for (const row of summary) {
  const { data } = matter(fs.readFileSync(bySlug.get(row.slug), "utf8"));
  const quiz = data.quiz || [];
  const cs = data.cheatSheet || [];
  const noExpl = quiz.filter((item) => !item.explanation).length;
  if (!quiz.length) {
    throw new Error(`${row.slug} lost its quiz`);
  }
  row.totalQ = quiz.length;
  row.totalCs = cs.length;
  row.noExpl = noExpl;
}

console.log(
  summary
    .map(
      (row) =>
        `${row.skipped ? "SKIP" : "OK  "} +${row.q}q +${row.cs}cs → ${row.totalQ}q/${row.totalCs}cs ${row.slug}${
          row.noExpl ? ` (${row.noExpl} still lack explanation)` : ""
        }`,
    )
    .join("\n"),
);
console.log(
  `\nApplied ${summary.filter((r) => !r.skipped).length} lessons. Total quiz now ${summary.reduce(
    (n, r) => n + r.totalQ,
    0,
  )}.`,
);
