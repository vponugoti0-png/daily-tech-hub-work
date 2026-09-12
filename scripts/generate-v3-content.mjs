#!/usr/bin/env node
/** Generate prompt-engineering + ai-data-eng lessons and AI shortcut packs.
 *  FDE (content/training/forward-deployed/) is hand-authored — do not clobber.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WAVE_FILES_BY_TRACK } from "./wave-lessons.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const training = path.join(root, "content", "training");
const shortcutsPath = path.join(root, "content", "shortcuts", "items.json");

function writeLesson(track, filename, fm, body) {
  const dir = path.join(training, track);
  fs.mkdirSync(dir, { recursive: true });
  const waveKeep = WAVE_FILES_BY_TRACK[track];
  if (waveKeep?.has(filename) && fs.existsSync(path.join(dir, filename))) {
    // W1–W4 markdown is the source of truth — do not clobber.
    return;
  }
  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length && typeof v[0] === "object") {
          return `${k}:\n${v
            .map((obj) => {
              if (obj.question) {
                const opts = obj.options.map((o) => `      - ${JSON.stringify(o)}`).join("\n");
                return `  - question: ${JSON.stringify(obj.question)}\n    options:\n${opts}\n    answer: ${obj.answer}${
                  obj.explanation ? `\n    explanation: ${JSON.stringify(obj.explanation)}` : ""
                }`;
              }
              if (obj.label) {
                return `  - label: ${JSON.stringify(obj.label)}\n    code: ${JSON.stringify(obj.code)}${
                  obj.note ? `\n    note: ${JSON.stringify(obj.note)}` : ""
                }`;
              }
              if (obj.title && obj.prompt) {
                return `  - title: ${JSON.stringify(obj.title)}\n    prompt: ${JSON.stringify(obj.prompt)}${
                  obj.hint ? `\n    hint: ${JSON.stringify(obj.hint)}` : ""
                }`;
              }
              return `  - ${JSON.stringify(obj)}`;
            })
            .join("\n")}`;
        }
        return `${k}: [${v.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(", ")}]`;
      }
      if (typeof v === "string") return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${v}`;
    })
    .join("\n");
  fs.writeFileSync(path.join(dir, filename), `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

const pe = [
  {
    file: "01-ask-better-questions.md",
    fm: {
      slug: "pe-ask-better-questions",
      track: "prompt-engineering",
      title: "Ask AI better questions",
      description: "Turn vague asks into clear, scoped prompts that get useful answers the first time.",
      level: "beginner",
      order: 1,
      durationMinutes: 25,
      topics: ["general"],
      objectives: [
        "State goal, context, and constraints in one prompt",
        "Ask for format and depth so answers are usable",
        "Spot vague prompts and rewrite them",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        { label: "Prompt skeleton", code: "Goal:\nContext:\nConstraints:\nOutput format:", note: "Fill every line" },
      ],
      quiz: [
        {
          question: "Which prompt is most likely to get a useful first answer?",
          options: [
            "Explain Spark",
            "Fix my pipeline",
            "Explain Spark partitions to a junior DE in 5 bullets with one example",
            "Write code",
          ],
          answer: 2,
          explanation: "Clear audience, length, and format beat vague asks.",
        },
        {
          question: "What belongs in Constraints?",
          options: [
            "Only the model name",
            "Limits like dialect, no secrets, word count, or tools you have",
            "A joke to warm up the model",
            "Nothing — constraints slow AI down",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Ask AI better questions

AI is helpful when **you** are specific. Vague prompts waste time.

## The four-line prompt

1. **Goal** — what success looks like  
2. **Context** — your stack, level, and situation  
3. **Constraints** — dialect, length, “no secrets”, tools you have  
4. **Output format** — bullets, table, SQL, checklist

### Weak → strong

- Weak: “Help with Snowflake.”  
- Strong: “I’m a beginner DE. Explain Snowflake warehouses vs databases in plain language, then give a 4-row comparison table.”

## Exercises

1. Rewrite “optimize this query” into a four-line prompt (invent a realistic context).
2. Add an output format that would make the answer paste into a ticket.
`,
  },
  {
    file: "02-structure-prompts.md",
    fm: {
      slug: "pe-structure-prompts",
      track: "prompt-engineering",
      title: "Structure prompts that scale",
      description: "Roles, examples, checklists, and stepwise instructions for reliable answers.",
      level: "beginner",
      order: 2,
      durationMinutes: 30,
      topics: ["general"],
      objectives: [
        "Use role + task + examples when helpful",
        "Break complex asks into steps",
        "Request self-checks without trusting them blindly",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        {
          label: "Role + task",
          code: "You are a patient data-engineering tutor.\\nTask: ...\\nShow work in steps.\\nEnd with a 3-item checklist I can verify.",
        },
      ],
      quiz: [
        {
          question: "Why add a short example of good output?",
          options: [
            "It makes the model slower",
            "It shows the shape and quality you want",
            "It is required by all APIs",
            "It replaces needing a goal",
          ],
          answer: 1,
        },
        {
          question: "Best next step for a multi-part ask?",
          options: [
            "Put everything in one paragraph with no structure",
            "Number the steps and ask for one section at a time if needed",
            "Only use emojis",
            "Delete all constraints",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Structure prompts that scale

## Patterns that help beginners

- **Role** — “patient tutor”, “code reviewer”, “SQL coach”  
- **Task** — one clear verb  
- **Examples** — tiny “good answer looks like…” samples  
- **Steps** — numbered instructions  
- **Verify** — ask for a checklist *you* will still run

## Template

\`\`\`
You are a patient data-engineering tutor for beginners.
Task: explain window functions for daily DE work.
Audience: knows SELECT/JOIN, new to windows.
Steps: 1) plain idea 2) one example 3) common pitfall
Output: markdown with a tiny SQL snippet (Snowflake dialect).
Self-check: list 3 things I should verify in a worksheet.
\`\`\`

## Exercises

1. Add a one-line “good output” example to a prompt you already use.
2. Split a mega-prompt into two turns: plan, then execute.
`,
  },
  {
    file: "03-iterate-and-refine.md",
    fm: {
      slug: "pe-iterate-and-refine",
      track: "prompt-engineering",
      title: "Iterate and refine answers",
      description: "Treat the first reply as a draft — tighten, challenge, and improve.",
      level: "beginner",
      order: 3,
      durationMinutes: 25,
      topics: ["general"],
      objectives: [
        "Use follow-ups that cite what to keep vs change",
        "Ask for alternatives and tradeoffs",
        "Stop when good enough for the task",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Best follow-up after a fuzzy answer?",
          options: [
            "Start a brand-new chat with the same vague ask",
            "Quote the weak part and say exactly what to change",
            "Say “try harder” only",
            "Accept the first answer always",
          ],
          answer: 1,
        },
        {
          question: "When should you stop iterating?",
          options: [
            "Never — keep prompting forever",
            "When the answer is checkable and good enough for the next real step",
            "After exactly one message",
            "Only when the model apologizes",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Iterate and refine answers

First drafts are normal. Good users **steer**.

## Useful follow-ups

- “Keep the example; rewrite the intro for a beginner.”  
- “Show two options and when I’d pick each.”  
- “Shorten to 8 lines; drop theory.”  
- “You assumed Postgres — redo in Snowflake SQL.”

## Anti-patterns

- Restarting from zero every time  
- Accepting code you cannot explain  
- Endless polish when a worksheet test would decide

## Exercises

1. Take any AI answer and write three precise follow-ups.
2. Decide a “done” criterion before you prompt (e.g., “runs in Snowsight”).
`,
  },
  {
    file: "04-verify-answers.md",
    fm: {
      slug: "pe-verify-answers",
      track: "prompt-engineering",
      title: "Verify before you trust",
      description: "Check AI output with docs, tiny tests, and skeptical reading.",
      level: "beginner",
      order: 4,
      durationMinutes: 30,
      topics: ["general"],
      objectives: [
        "Separate facts to verify from opinions",
        "Use tiny experiments and official docs",
        "Catch confident-sounding mistakes",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        {
          label: "Verify loop",
          code: "1. Restate claim\\n2. Find source or run tiny test\\n3. Compare\\n4. Keep / fix / discard",
        },
      ],
      quiz: [
        {
          question: "AI gives a Snowflake hotkey. What should you do?",
          options: [
            "Memorize it immediately",
            "Check Snowflake docs or the in-UI shortcut list",
            "Post it to production without reading",
            "Assume all vendors share hotkeys",
          ],
          answer: 1,
        },
        {
          question: "A confident SQL snippet uses UPDATE SET * on Snowflake. Red flag?",
          options: [
            "No — every warehouse supports it",
            "Yes — verify dialect; Snowflake needs explicit columns",
            "Only if the table is empty",
            "Only on weekends",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Verify before you trust

AI can be **wrong with confidence**. Your job is the safety layer.

## Fast checks

- Official docs for APIs and shortcuts  
- Tiny runnable examples  
- “Would a senior DE bet on this?”  
- Dialect mismatches (Spark vs Snowflake)

## Habit

Ask the model: “List assumptions I should verify.” Then verify them yourself.

## Exercises

1. Pick one claim from an AI answer and find a primary source.
2. Run a 5-line SQL or Python check that proves or kills the claim.
`,
  },
  {
    file: "05-safety-privacy-basics.md",
    fm: {
      slug: "pe-safety-privacy",
      track: "prompt-engineering",
      title: "Safety and privacy basics",
      description: "Keep secrets, PII, and prod credentials out of prompts — free tools included.",
      level: "beginner",
      order: 5,
      durationMinutes: 25,
      topics: ["general"],
      objectives: [
        "Recognize data that must not be pasted into AI",
        "Use redaction and synthetic examples",
        "Follow workplace AI policies",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Safe to paste into a public AI chat?",
          options: [
            "Production connection strings",
            "Customer emails from a support export",
            "A made-up sample row with fake names",
            "Your cloud private key",
          ],
          answer: 2,
        },
        {
          question: "Best practice when you need help with a messy table?",
          options: [
            "Upload the full prod dump",
            "Share schema + 2–3 synthetic rows that match the shape",
            "Paste passwords so AI can connect",
            "Disable all logging forever",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Safety and privacy basics

Free does **not** mean “paste everything.”

## Never paste

- Passwords, tokens, private keys  
- Customer PII / regulated data without approval  
- Full prod extracts  

## Prefer

- Synthetic rows  
- Schema-only discussions  
- Redacted logs  
- Company-approved tools and policies

## Exercises

1. Redact a fake log line that contains an email and API key.
2. Write a one-sentence personal rule for what never goes into prompts.
`,
  },
  {
    file: "06-prompts-for-learning.md",
    fm: {
      slug: "pe-prompts-for-learning",
      track: "prompt-engineering",
      title: "Prompt patterns for learning DE",
      description: "Use AI as a tutor: explanations, drills, and spaced practice — without skipping thinking.",
      level: "beginner",
      order: 6,
      durationMinutes: 30,
      topics: ["general"],
      objectives: [
        "Ask for progressive explanations",
        "Generate practice drills you can grade",
        "Use AI to review your attempt, not replace it",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Best learning use of AI?",
          options: [
            "Copy-paste solutions into prod unread",
            "Attempt first, then ask AI to critique your attempt",
            "Only ask for final answers",
            "Avoid examples",
          ],
          answer: 1,
        },
        {
          question: "Good tutor prompt includes…",
          options: [
            "Your level and what you already tried",
            "Nothing but “explain everything”",
            "Secrets from prod",
            "A request to skip quizzes",
          ],
          answer: 0,
        },
      ],
    },
    body: `# Prompt patterns for learning DE

## Tutor moves

- “Explain like I’m new to warehouses; then add one level of depth.”  
- “Quiz me with 3 questions; wait for my answers.”  
- “Here’s my attempt — what’s wrong and what to read next?”

## Keep the struggle

Struggle builds skill. Use AI after you try, or to unblock a stuck 10 minutes — not to skip the workout.

## Exercises

1. Write a quiz-me prompt for window functions.
2. Paste a wrong mental model on purpose and ask AI to correct it gently.
`,
  },
  {
    file: "07-de-role-prompt-library.md",
    fm: {
      slug: "pe-de-role-prompt-library",
      track: "prompt-engineering",
      title: "DE role prompt library (on-call / PR / incident)",
      description:
        "Copy-ready prompts for on-call triage, data-diff PR reviews, and incident write-ups — with constraints and verification asks.",
      level: "beginner",
      order: 7,
      durationMinutes: 30,
      topics: ["general"],
      objectives: [
        "Use a four-line prompt for on-call, PR review, and incidents",
        "Demand evidence and forbid secrets",
        "Reuse these cards instead of inventing a /practice chat",
      ],
      updatedAt: "2026-09-12",
      cheatSheet: [
        {
          label: "On-call triage",
          code: "Role: You are a calm data-engineering on-call pair.\\nGoal: Rank likely causes for orders_daily being 0 rows for today.",
          note: "Paste into Claude, Copilot Chat, or Grok. You run the checks.",
        },
      ],
      quiz: [
        {
          question: "An on-call prompt should always include…",
          options: [
            "Production passwords so the model can log in",
            "Goal, context, constraints (no secrets), and the next human check",
            "A request to disable RBAC",
            "A new primary nav item",
          ],
          answer: 1,
        },
      ],
    },
    body: `A **role library**, not a chatbot product. See content/training/prompt-engineering/07-de-role-prompt-library.md (wave source of truth).`,
  },
];

const aiDe = [
  {
    file: "01-ai-as-de-copilot.md",
    fm: {
      slug: "ai-de-copilot-mindset",
      track: "ai-data-eng",
      title: "AI as a data-engineering copilot",
      description: "Where AI helps DEs (and where it must not replace judgment).",
      level: "beginner",
      order: 1,
      durationMinutes: 25,
      topics: ["general", "python"],
      objectives: [
        "Map AI to drafting, explaining, and reviewing — not silent prod changes",
        "Choose tasks that are high-leverage for beginners",
        "Keep ownership of correctness",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Best first use of AI for a junior DE?",
          options: [
            "Auto-merge unreviewed PRs",
            "Explain an error message and suggest a next check",
            "Rotate cloud keys automatically from chat",
            "Drop production tables",
          ],
          answer: 1,
        },
        {
          question: "Who owns correctness of AI-suggested SQL?",
          options: ["The model vendor only", "You (and your review process)", "Nobody", "The laptop"],
          answer: 1,
        },
      ],
    },
    body: `# AI as a data-engineering copilot

Think **pair programmer**, not autopilot.

## High-leverage uses

- Explain errors and plans  
- Draft tests and docs  
- Suggest refactors you still review  
- Translate between SQL dialects carefully  

## Low-trust uses

- Untested destructive DDL  
- Security-sensitive scripts  
- “Fix prod now” without lineage awareness  

## Exercises

1. List 3 tasks this week where AI could draft and you would verify.
2. List 2 tasks that should stay human-led.
`,
  },
  {
    file: "02-debug-with-ai.md",
    fm: {
      slug: "ai-de-debug-with-ai",
      track: "ai-data-eng",
      title: "Debug pipelines with AI",
      description: "Share symptoms safely and get structured debugging help.",
      level: "beginner",
      order: 2,
      durationMinutes: 30,
      topics: ["general", "python", "sql"],
      objectives: [
        "Describe failures with expected vs actual",
        "Ask for hypotheses ranked by likelihood",
        "Turn suggestions into concrete checks",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        {
          label: "Debug prompt",
          code: "Symptom:\\nExpected:\\nActual:\\nRecent changes:\\nEnvironment:\\nAsk: 3 hypotheses + checks (no secrets).",
        },
      ],
      quiz: [
        {
          question: "What should a debug prompt include?",
          options: [
            "Only “it’s broken”",
            "Expected vs actual, context, and what you already tried",
            "Prod passwords",
            "A demand for one magical fix with no questions",
          ],
          answer: 1,
        },
        {
          question: "After AI suggests a hypothesis, you should…",
          options: [
            "Run a concrete check",
            "Restart the cluster forever",
            "Ignore logs",
            "Delete the table immediately",
          ],
          answer: 0,
        },
      ],
    },
    body: `# Debug pipelines with AI

## Symptom package

Expected · Actual · When it started · Recent changes · Minimal example

## Ask for

Ranked hypotheses + **checks**, not just “try this code.”

## Exercises

1. Write a symptom package for a late-arriving dimension join.
2. Convert one AI suggestion into a SQL or log check.
`,
  },
  {
    file: "03-generate-sql-python-safely.md",
    fm: {
      slug: "ai-de-generate-code-safely",
      track: "ai-data-eng",
      title: "Generate SQL & Python safely",
      description: "Prompt for dialect-aware code and review it like a PR.",
      level: "beginner",
      order: 3,
      durationMinutes: 30,
      topics: ["sql", "python"],
      objectives: [
        "Specify dialect, warehouse, and interfaces",
        "Require comments on assumptions",
        "Review AI code with tests and dry-runs",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "When asking for MERGE SQL you should specify…",
          options: [
            "Nothing — AI always guesses right",
            "Engine/dialect and whether SET * is allowed",
            "Only the table emoji",
            "That secrets should be hard-coded",
          ],
          answer: 1,
        },
        {
          question: "Good review habit for AI code?",
          options: [
            "Merge unread",
            "Run a dry-run / unit test and read every line that touches data",
            "Only check formatting",
            "Disable CI",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Generate SQL & Python safely

## Prompt musts

- Dialect (Snowflake / Spark / Postgres)  
- Inputs/outputs  
- Idempotency needs  
- “List assumptions”

## Review like a PR

Read writes, filters, and join keys. Prefer tiny tests.

## Exercises

1. Ask for a Snowflake MERGE with explicit columns for a customer dim.
2. Ask the model to list assumptions — then challenge one.
`,
  },
  {
    file: "04-docs-tests-with-ai.md",
    fm: {
      slug: "ai-de-docs-and-tests",
      track: "ai-data-eng",
      title: "Docs and tests with AI",
      description: "Turn working code into README notes and starter tests.",
      level: "beginner",
      order: 4,
      durationMinutes: 25,
      topics: ["python", "git"],
      objectives: [
        "Generate docs from real code you paste (sanitized)",
        "Ask for edge-case tests",
        "Keep docs short and accurate",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Best input for doc generation?",
          options: [
            "No code, only “document my platform”",
            "A sanitized function plus intended behavior",
            "The entire prod database",
            "Only screenshots of Slack",
          ],
          answer: 1,
        },
        {
          question: "AI-written tests should…",
          options: [
            "Be merged without running",
            "Be read and executed; add the edge cases that matter",
            "Never assert anything",
            "Only test happy paths forever",
          ],
          answer: 1,
        },
      ],
    },
    body: `# Docs and tests with AI

## Docs prompt

Paste a sanitized function → ask for purpose, inputs, outputs, failure modes (½ page max).

## Tests prompt

“Generate 3 pytest cases including one failure mode for null keys.”

## Exercises

1. Document a 10-line transform with AI, then delete anything untrue.
2. Add one test AI missed (nulls or duplicates).
`,
  },
  {
    file: "05-ai-tools-for-de-workflow.md",
    fm: {
      slug: "ai-de-tools-workflow",
      track: "ai-data-eng",
      title: "AI tools in the DE workflow",
      description: "Claude, Copilot, Grok, and warehouse assistants — when to use which.",
      level: "beginner",
      order: 5,
      durationMinutes: 25,
      topics: ["general"],
      objectives: [
        "Match tools to chat vs in-editor vs in-warehouse tasks",
        "Use Shortcuts packs for commands and features",
        "Stay policy-compliant at work",
      ],
      updatedAt: "2026-09-11",
      quiz: [
        {
          question: "Inline code completion while editing a notebook is closest to…",
          options: ["GitHub Copilot-style assist", "Only email newsletters", "Vacuuming a warehouse", "DNS"],
          answer: 0,
        },
        {
          question: "Warehouse-native assistants (Cortex / Databricks Assistant) shine when…",
          options: [
            "You need help next to your SQL and catalog context",
            "You want to avoid all review",
            "You need to disable RBAC",
            "You paste private keys",
          ],
          answer: 0,
        },
      ],
    },
    body: `# AI tools in the DE workflow

| Need | Try |
|------|-----|
| Long reasoning / tutoring | Claude-style chat |
| Inline code in the editor | Copilot-style |
| Fast Q&A / exploration | Grok-style chat |
| SQL next to warehouse context | Cortex / Databricks Assistant |

Open **Shortcuts** for Claude, Copilot, and Grok packs (keyboard, prompts, features).

## Exercises

1. Pick one real task and choose a tool category intentionally.
2. Skim one AI Shortcuts pack and star two tips.
`,
  },
  {
    file: "06-review-ai-changes.md",
    fm: {
      slug: "ai-de-review-changes",
      track: "ai-data-eng",
      title: "Review AI-assisted changes",
      description: "Checklist for PRs and notebooks that include AI-generated edits.",
      level: "beginner",
      order: 6,
      durationMinutes: 25,
      topics: ["git", "general"],
      objectives: [
        "Apply a practical review checklist",
        "Call out risks in comments",
        "Keep humans accountable for merges",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        {
          label: "AI PR checklist",
          code: "- Dialect correct?\\n- Idempotent writes?\\n- Secrets absent?\\n- Tests/dry-run?\\n- Lineage impact noted?",
        },
      ],
      quiz: [
        {
          question: "Before merging AI-touched SQL that writes data…",
          options: [
            "Skip review if tests are green on a tiny sample only — wait, still read write paths",
            "Never read it",
            "Disable audits",
            "Always force-push main",
          ],
          answer: 0,
          explanation: "Even with tests, read write paths and dialect carefully.",
        },
        {
          question: "Who is accountable for a merged AI-assisted change?",
          options: ["The author/reviewers", "Only the model", "Random internet users", "Nobody"],
          answer: 0,
        },
      ],
    },
    body: `# Review AI-assisted changes

## Checklist

- Correct dialect and APIs  
- Safe writes (idempotent, scoped)  
- No secrets  
- Tests or dry-run evidence  
- Clear description of AI help in the PR  

## Exercises

1. Review a fictional diff that uses Snowflake \`UPDATE SET *\` — reject or fix.
2. Write a PR note template that discloses AI assistance.
`,
  },
  {
    file: "07-practice-with-agents.md",
    fm: {
      slug: "ai-de-practice-agents",
      track: "ai-data-eng",
      title: "Practice with agents & Cortex functions",
      description:
        "Practice function calling and tools vs plain chat: copy Cortex functions and agent prompts you can run today.",
      level: "beginner",
      order: 7,
      durationMinutes: 25,
      topics: ["snowflake", "general"],
      objectives: [
        "Explain when a warehouse function beats a free-form chat, and when an agent should name a tool",
        "Copy and adapt Cortex COMPLETE, SUMMARIZE, SENTIMENT, TRANSLATE, and EXTRACT_ANSWER",
        "Write a structured agent prompt that calls a tool with JSON arguments",
        "Open existing Shortcuts packs instead of memorizing tip catalogs",
      ],
      updatedAt: "2026-09-11",
      cheatSheet: [
        {
          label: "Cortex COMPLETE — incident summary",
          code: "SELECT SNOWFLAKE.CORTEX.COMPLETE(\\n  'llama3.1-70b',\\n  'Summarize this incident in 2 bullets: ' || incident_text\\n) AS summary\\nFROM ops.incidents\\nLIMIT 5;",
          note: "Strong first Try-it: prompt a Cortex model from SQL next to warehouse rows.",
        },
        {
          label: "Agent tool call — inspect_query_profile",
          code: "You are a data-engineering agent.\\n\\nGoal: Find why yesterday's orders_daily job scanned ~12x more bytes.\\n\\nAvailable tools:\\n- inspect_query_profile(query_id)\\n- list_recent_queries(warehouse, hours)\\n- sample_table(fqn, limit)\\n\\nPlan:\\n1. Call list_recent_queries(warehouse=\\\"etl_wh\\\", hours=24)\\n2. Pick the slowest QUERY_ID\\n3. Call inspect_query_profile(query_id=...)\\n4. Report bytes scanned, pruning, spill, and the next human check\\n\\nConstraints: no secrets, no DROP/UPDATE, cite the next tool call.\\nOutput format:\\n- Thought\\n- Tool call (name + JSON args)\\n- Expected evidence",
          note: "Paste into Claude, Copilot Chat, or Grok. The model should name the tool — you still run it.",
        },
        {
          label: "Cortex SUMMARIZE",
          code: "SELECT SNOWFLAKE.CORTEX.SUMMARIZE(ticket_body) AS summary\\nFROM support.tickets;",
          note: "Quick document or ticket summarization in-warehouse.",
        },
        {
          label: "Cortex SENTIMENT",
          code: "SELECT review_id,\\n       SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS score\\nFROM product.reviews;",
          note: "Score feedback text. Treat the score as a hint, not a ground-truth label.",
        },
        {
          label: "Cortex TRANSLATE",
          code: "SELECT SNOWFLAKE.CORTEX.TRANSLATE(notes, 'fr', 'en') AS notes_en\\nFROM crm.notes;",
          note: "Normalize multi-language notes before downstream quality checks.",
        },
        {
          label: "Cortex EXTRACT_ANSWER",
          code: "SELECT SNOWFLAKE.CORTEX.EXTRACT_ANSWER(doc_text, 'What is the SLA?')\\nFROM knowledge.docs;",
          note: "QA over a passage you already stored — not a replacement for search + review.",
        },
        {
          label: "Agent tool call — warehouse_query",
          code: "You are a warehouse agent with one read-only tool.\\n\\nTool: warehouse_query\\nArgs: { \\\"sql\\\": \\\"<SELECT only>\\\" }\\n\\nTask: Sentiment-score the last 20 product reviews and list 3 negative themes.\\n\\n1. Thought: I need scores, then themes.\\n2. Tool call:\\n   warehouse_query({\\n     \\\"sql\\\": \\\"SELECT review_id, SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS score FROM product.reviews QUALIFY ROW_NUMBER() OVER (ORDER BY review_id DESC) <= 20\\\"\\n   })\\n3. After results: cluster negative scores into themes. No raw PII in the write-up.",
          note: "Structured prompt that calls a tool — copy to chat, then run the SQL yourself.",
        },
      ],
      quiz: [
        {
          question: "When should you use a Cortex function or a named tool instead of plain chat?",
          options: [
            "When you want to skip all review",
            "When you need named args next to warehouse evidence (SQL function or tool call)",
            "When you need to disable RBAC",
            "When you paste production passwords",
          ],
          answer: 1,
          explanation: "Functions and tool calls beat free-form chat when the work is argument-shaped and you will verify the result.",
        },
        {
          question: "What should you do with Cortex or agent output?",
          options: [
            "Merge it unread because the model is official",
            "Treat it as untrusted: validate, dry-run, and keep humans accountable",
            "Write it straight to prod tables",
            "Disable query history so nobody checks",
          ],
          answer: 1,
          explanation: "Functions and chat assistants draft. You still review writes, PII, and cost.",
        },
        {
          question: "Which Cortex function scores feedback text?",
          options: [
            "TRANSLATE",
            "EXTRACT_ANSWER",
            "SENTIMENT",
            "A brand-new /practice route",
          ],
          answer: 2,
          explanation: "SENTIMENT returns a score. EXTRACT_ANSWER answers a question over a passage.",
        },
      ],
    },
    body: `Agents are useful when they **name a tool and arguments**. Warehouse functions are useful when the text **already lives next to your tables**. This lesson is practice — copy a function, run a structured prompt, then verify.

You do not need a paid account. Progress uses the same guest/local model as every other lesson.

## Agent / tool mindset for DEs

Think of the model as a junior pair, not a warehouse admin.

1. **You** pick the goal and the allowed tools (SQL function, query profile, catalog lookup).
2. The agent proposes a **tool call** with explicit arguments — or you call a Cortex function yourself.
3. **You** run the call, read the evidence, and decide the next check.

Free-form “fix my pipeline” chat skips step 2. Function-as-example practice puts the call on the card so you can copy it.

## Function-as-example cards

Each practice card is a **function example**: name, arguments, when to use, and a copyable snippet. The **Try it** boxes (copy into a worksheet or AI chat) and cheat sheet above are those cards.

| Name | Args | When to use |
|------|------|-------------|
| \\\`COMPLETE\\\` | model, prompt | Function calling from SQL when text already sits next to warehouse rows |
| \\\`SUMMARIZE\\\` | text | Collapse tickets/docs in-warehouse |
| \\\`SENTIMENT\\\` | text | Score feedback; treat as a hint |
| \\\`TRANSLATE\\\` | text, from, to | Normalize notes before checks |
| \\\`EXTRACT_ANSWER\\\` | passage, question | QA over stored text — still review |
| \\\`inspect_query_profile\\\` | query_id | Agent tools when you need evidence, not an essay |
| \\\`warehouse_query\\\` | \\\`{ sql }\\\` | Read-only SELECT the human still runs |

Start with **COMPLETE**, then the \\\`inspect_query_profile\\\` agent prompt. Do **not** invent extra Cortex APIs. The full tip catalog already lives in Shortcuts.

## Shortcuts packs (do not duplicate)

Open the existing packs when you want keyboard tips, more prompts, or source links:

- [Snowflake Cortex AI](/shortcuts/snowflake-cortex-ai) — COMPLETE, SUMMARIZE, SENTIMENT, TRANSLATE, EXTRACT_ANSWER, Search
- [Claude (Anthropic)](/shortcuts/claude-anthropic-pack)
- [GitHub Copilot](/shortcuts/github-copilot-pack)
- [Grok (xAI)](/shortcuts/grok-xai-pack)

Browse all packs at [Shortcuts](/shortcuts).

## Guardrails

- Treat model output as **untrusted**. Validate JSON, read every write path, prefer dry-runs.
- Never send secrets, tokens, or real customer PII without policy review.
- Watch warehouse **and** Cortex cost. Batch small \\\`LIMIT\\\`s first.
- Chat agents do not get warehouse credentials in this lesson — you copy the SQL and run it.

## Exercises

1. Copy the **COMPLETE** card into a Snowflake worksheet (or write it by hand). Swap \\\`incident_text\\\` for a synthetic note. What two bullets did you expect?
2. Paste the **inspect_query_profile** agent prompt into Claude, Copilot Chat, or Grok. Check that the reply names a tool and JSON args — not a vague essay.
3. Sketch a two-step pipeline: \\\`TRANSLATE\\\` notes to English, then \\\`SUMMARIZE\\\`. Keep it \\\`SELECT\\\`-only.
4. Open the [Cortex Shortcuts pack](/shortcuts/snowflake-cortex-ai) and star two tips that are **not** already on this page (Search or guardrails).
`,
  },
  {
    file: "08-practice-nonsf-agents.md",
    fm: {
      slug: "ai-de-practice-nonsf-agents",
      track: "ai-data-eng",
      title: "Practice with generic agents & Databricks Assistant",
      description:
        "Tool-calling practice that is not Snowflake Cortex: generic warehouse tools and a Databricks Assistant-shaped prompt you can paste today.",
      level: "beginner",
      order: 8,
      durationMinutes: 30,
      topics: ["databricks", "general"],
      objectives: [
        "Write a tool-calling plan that names tools and JSON args (no Cortex required)",
        "Shape a Databricks Assistant / notebook-agent prompt with evidence steps",
        "Keep the same guest progress model — no /practice simulator",
      ],
      updatedAt: "2026-09-12",
      cheatSheet: [
        {
          label: "Generic tool call — inspect_job_run",
          code: "You are a data-engineering agent (not Snowflake-specific).\\n\\nGoal: Explain why the orders_daily job ran 3x longer today.",
          note: "Paste into Claude, Copilot Chat, Grok, or a workspace assistant. You still run the tool.",
        },
      ],
      quiz: [
        {
          question: "Generic tool-calling beats plain chat when…",
          options: [
            "You want to skip all review",
            "You need named tools and JSON args, then you run the call",
            "You must use Snowflake Cortex or nothing",
            "You paste production passwords",
          ],
          answer: 1,
        },
      ],
    },
    body: `Non-Snowflake sibling of the Cortex practice lesson. See content/training/ai-data-eng/08-practice-nonsf-agents.md (wave source of truth).`,
  },
];

for (const L of pe) writeLesson("prompt-engineering", L.file, L.fm, L.body);
for (const L of aiDe) writeLesson("ai-data-eng", L.file, L.fm, L.body);
console.log(`Wrote ${pe.length} prompt-engineering + ${aiDe.length} ai-data-eng lessons`);

const UPDATED = "2026-09-11";
const packs = [
  {
    slug: "claude-anthropic-pack",
    title: "Claude (Anthropic) — prompts & features",
    tool: "claude",
    category: "AI · Claude",
    summary: "Official-style tips for Claude chat: projects, artifacts mindset, strong prompt patterns, and privacy habits for DE learners.",
    topics: ["general"],
    updatedAt: UPDATED,
    sources: [
      { label: "Anthropic Claude", url: "https://claude.ai" },
      { label: "Anthropic docs", url: "https://docs.anthropic.com" },
    ],
    tips: [
      { group: "ai", title: "Clear role + task", body: "Start with who Claude should be and what done looks like.", code: "You are a patient data-engineering tutor.\\nTask: explain Delta MERGE vs COPY for beginners.\\nOutput: 6 bullets + 1 tiny SQL example (Spark SQL)." },
      { group: "ai", title: "Ask for assumptions", body: "Force hidden guesses into the open.", code: "List assumptions before answering. If dialect is unclear, ask." },
      { group: "ai", title: "Structured rewrite", body: "Turn messy notes into a ticket-ready brief.", code: "Rewrite my notes into: Problem / Impact / Next checks / Risks. Keep under 120 words." },
      { group: "ai", title: "Critique my attempt", body: "Learning mode — paste your work, not just ‘give answer’.", code: "Here is my SQL attempt (sanitized). Point out bugs, then show a corrected version with comments." },
      { group: "ai", title: "Long-doc navigation", body: "When pasting long docs, ask for a map first.", code: "Skim and outline sections relevant to Unity Catalog grants. Then deep-dive section 2 only." },
      { group: "keyboard", title: "Chat UX habits", body: "Use new threads per incident; keep one thread for a single lesson. Prefer copy-out of final snippets into your repo — not chat as source of truth." },
      { group: "ai", title: "Artifacts / canvases mindset", body: "Ask Claude to keep a living draft (checklist, SQL file, study plan) you iteratively edit in-thread.", code: "Maintain a living study checklist for Prompt Engineering lesson 1–6. Update it each turn; show only the checklist." },
      { group: "ai", title: "Privacy", body: "No secrets/PII. Use synthetic rows. Follow employer policy for Anthropic products." },
      { group: "ai", title: "DE example — pipeline design", body: "Architecture brainstorm with constraints.", code: "Design a beginner-friendly daily incremental load for orders (Snowflake). Constraints: explicit MERGE columns, watermark table, no PII in examples. Output: steps + SQL sketches." },
      { group: "ai", title: "Verify loop", body: "End prompts with verification asks.", code: "End with 3 checks I should run in Snowsight before trusting this." },
    ],
  },
  {
    slug: "github-copilot-pack",
    title: "GitHub Copilot — editor shortcuts & prompts",
    tool: "copilot",
    category: "AI · Copilot",
    summary: "Keyboard shortcuts, inline completions, chat/CLI-oriented prompts, and safe use for Python/SQL DE work.",
    topics: ["general", "python", "git"],
    updatedAt: UPDATED,
    sources: [
      { label: "GitHub Copilot docs", url: "https://docs.github.com/en/copilot" },
      { label: "Copilot keyboard shortcuts (VS Code)", url: "https://docs.github.com/en/copilot/how-tos/configure-personal-settings/configure-in-ide" },
    ],
    tips: [
      { group: "keyboard", title: "Accept suggestion", body: "Accept the current inline completion (VS Code).", code: "Tab", source: "VS Code Copilot" },
      { group: "keyboard", title: "Dismiss suggestion", body: "Dismiss the inline ghost text.", code: "Esc", source: "VS Code Copilot" },
      { group: "keyboard", title: "Open Copilot Chat (VS Code)", body: "Open chat panel — binding can vary by install; check Keyboard Shortcuts for ‘chat’ / Copilot.", code: "Ctrl/Cmd + Shift + I  (or Command Palette: “Chat: Open”)", source: "VS Code / Copilot docs" },
      { group: "keyboard", title: "Trigger inline suggest", body: "Manually request an inline suggestion.", code: "Alt/Option + \\   ·  or Command Palette: “GitHub Copilot: Trigger Inline Suggestion”", source: "VS Code Copilot" },
      { group: "keyboard", title: "Next / previous suggestion", body: "Cycle alternate inline completions when available.", code: "Alt/Option + ]  /  Alt/Option + [", source: "VS Code Copilot" },
      { group: "ai", title: "Comment-driven codegen", body: "Write intent as a comment above empty code.", code: "# Return a pandas DataFrame with columns id, ts normalized to UTC; drop null ids\\ndef normalize_events(df):\\n    ..." },
      { group: "ai", title: "Copilot Chat — explain", body: "Select code → ask for a beginner explanation.", code: "Explain this function like I’m new to Spark. List side effects." },
      { group: "ai", title: "Copilot Chat — tests", body: "Generate focused tests.", code: "/tests Focus on null keys and duplicate event_id. Use pytest." },
      { group: "ai", title: "SQL cell / file context", body: "State dialect in a header comment so completions match.", code: "-- dialect: snowflake\\n-- task: explicit-column MERGE into analytics.customers" },
      { group: "cli", title: "Copilot CLI / PR help (where enabled)", body: "Use Copilot-assisted PR summaries only on sanitized diffs; never paste secrets into prompts.", code: "gh copilot --help  # if GitHub Copilot CLI is installed" },
      { group: "ai", title: "Safety", body: "Review every suggestion. Disable Copilot on secret-heavy files. Prefer public/synthetic examples in chat." },
      { group: "ai", title: "DE workflow tip", body: "Let Copilot draft boilerplate; you own join keys, partition columns, and idempotent writes." },
    ],
  },
  {
    slug: "grok-xai-pack",
    title: "Grok (xAI) — prompts & features",
    tool: "grok",
    category: "AI · Grok",
    summary: "Practical Grok prompting for fast DE learning: clarity, iteration, verification, and example workflows.",
    topics: ["general"],
    updatedAt: UPDATED,
    sources: [
      { label: "xAI Grok", url: "https://grok.x.ai" },
      { label: "xAI", url: "https://x.ai" },
    ],
    tips: [
      { group: "ai", title: "Direct brief", body: "Grok responds well to crisp briefs — lead with the ask.", code: "In 8 bullets: difference between lakehouse and warehouse for a new DE. End with one analogy." },
      { group: "ai", title: "Compare tools", body: "Ask for decision tables.", code: "Compare Claude vs Copilot vs Grok for: tutoring, inline coding, quick Q&A. Table with columns: best for / watch-outs." },
      { group: "ai", title: "Drill mode", body: "Practice interviews / concepts.", code: "Quiz me on Snowflake Time Travel. 5 questions, one at a time. Wait for my answer." },
      { group: "ai", title: "Simplify jargon", body: "Progressive depth.", code: "Explain Photon like I’m 15, then again for a working DE, then list 3 myths." },
      { group: "ai", title: "Debug sketch", body: "Symptom package without secrets.", code: "Symptom: Databricks job doubles row counts on retry.\\nAsk: ranked causes + checks. No cluster IDs or tokens." },
      { group: "ai", title: "Prompt remodel", body: "Have Grok improve your prompt.", code: "Improve this prompt for clarity and verifiability: '''...''' Return only the improved prompt." },
      { group: "ai", title: "Learning plan", body: "Build a free study sprint.", code: "Make a 5-day beginner plan using Daily Tech Hub tracks: prompt-engineering + sql. 45 min/day. Checklist format." },
      { group: "ui", title: "Thread hygiene", body: "One topic per thread when possible; copy final answers into your notes. Treat chat as ephemeral." },
      { group: "ai", title: "Verification ask", body: "Always close the loop.", code: "What are 3 ways this could be wrong? How would I falsify each quickly?" },
      { group: "ai", title: "Privacy", body: "Same rules everywhere: no credentials, no customer data, prefer synthetic examples." },
    ],
  },
];

const existing = JSON.parse(fs.readFileSync(shortcutsPath, "utf8"));
const bySlug = new Map(existing.map((x) => [x.slug, x]));
for (const p of packs) bySlug.set(p.slug, p);
const merged = [...bySlug.values()];
fs.writeFileSync(shortcutsPath, JSON.stringify(merged, null, 2) + "\n");
console.log(`Shortcuts packs total: ${merged.length}`);
for (const p of packs) console.log(`  ${p.slug}: ${p.tips.length} tips`);
