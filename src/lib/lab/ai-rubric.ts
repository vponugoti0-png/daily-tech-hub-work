/**
 * Client-only prompt checklist. No model, no network, no vendor keys.
 * Caps match the Python local-lab threat model (12k in / 8k sketch out).
 */

export const AI_PROMPT_MAX_CHARS = 12_000;
export const AI_SKETCH_MAX_CHARS = 8_000;

export interface AiRubricItem {
  id: string;
  label: string;
  hint: string;
  pass: boolean;
}

export interface AiExercise {
  id: string;
  label: string;
  starter: string;
  note: string;
  sketch: string;
  checks: AiCheck[];
}

export interface AiCheck {
  id: string;
  label: string;
  hint: string;
  test: (prompt: string) => boolean;
}

export interface AiRubricResult {
  pass: boolean;
  passed: number;
  total: number;
  items: AiRubricItem[];
  sketch: string;
}

export function assertSafeAiPrompt(source: string): string {
  const trimmed = source.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    throw new Error("Write a prompt in the editor first.");
  }
  if (trimmed.length > AI_PROMPT_MAX_CHARS) {
    throw new Error("This local practice only checks short prompts (12k characters).");
  }
  return trimmed;
}

function hay(text: string): string {
  return text.toLowerCase();
}

function includesAny(text: string, needles: readonly string[]): boolean {
  const n = hay(text);
  return needles.some((needle) => n.includes(needle.toLowerCase()));
}

function hasLabel(text: string, labels: readonly string[]): boolean {
  return labels.some((label) => {
    const re = new RegExp(`(?:^|[\\n\\r]|\\b)${label}\\s*[:\\-—]`, "i");
    return re.test(text) || new RegExp(`\\b${label}\\b`, "i").test(text);
  });
}

/** Looks like a dumped credential — fail closed. Mentions of “no secrets” are fine. */
export function looksLikeSecretDump(text: string): boolean {
  return (
    /(?:password|passwd|api[_-]?key|secret|token|private[_-]?key|dsn|connection[_-]?string)\s*[:=]\s*\S+/i.test(
      text,
    ) ||
    /\bsk-[A-Za-z0-9]{16,}\b/.test(text) ||
    /\bAKIA[0-9A-Z]{8,}\b/.test(text) ||
    /BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/.test(text)
  );
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function notVague(text: string): boolean {
  if (wordCount(text) < 12) return false;
  if (/^(help|fix|explain|write|optimize|debug)\b/i.test(text.trim()) && wordCount(text) < 20) {
    return false;
  }
  return true;
}

const checkGoal: AiCheck = {
  id: "goal",
  label: "States a goal",
  hint: "Add a Goal line — what success looks like.",
  test: (p) => hasLabel(p, ["goal", "task", "ask"]) || includesAny(p, ["i need", "i want", "draft", "explain"]),
};

const checkContext: AiCheck = {
  id: "context",
  label: "Gives context",
  hint: "Add Context — stack, table, level, or situation.",
  test: (p) =>
    hasLabel(p, ["context", "background", "situation"]) ||
    includesAny(p, ["snowflake", "databricks", "spark", "postgres", "dbt", "silver", "gold", "junior", "warehouse"]),
};

const checkConstraints: AiCheck = {
  id: "constraints",
  label: "Sets constraints",
  hint: "Add Constraints — dialect, length, tools you have, fences.",
  test: (p) =>
    hasLabel(p, ["constraint", "constraints", "do not", "don't", "limits"]) ||
    includesAny(p, ["no secrets", "no drop", "word count", "under ", "dialect", "do not"]),
};

const checkFormat: AiCheck = {
  id: "format",
  label: "Asks for an output format",
  hint: "Add Output format — bullets, table, SQL, checklist, headings.",
  test: (p) =>
    hasLabel(p, ["output format", "format", "output"]) ||
    includesAny(p, ["bullets", "checklist", "table", "numbered", "headings", "json"]),
};

const checkNoSecretsAsk: AiCheck = {
  id: "no-secrets",
  label: "Forbids secrets",
  hint: "Write “no secrets” (or no tokens / no PII) in the constraints.",
  test: (p) => includesAny(p, ["no secret", "no secrets", "no token", "no pii", "no password", "sanitized", "synthetic"]),
};

const checkNoSecretDump: AiCheck = {
  id: "no-dump",
  label: "Does not paste credentials",
  hint: "Remove anything that looks like a password, token, or key. Use fake rows.",
  test: (p) => !looksLikeSecretDump(p),
};

const checkRole: AiCheck = {
  id: "role",
  label: "Sets a role",
  hint: "Start with Role: tutor, reviewer, on-call pair, etc.",
  test: (p) => hasLabel(p, ["role", "you are"]) || includesAny(p, ["you are a", "you are an"]),
};

const checkVerify: AiCheck = {
  id: "verify",
  label: "Asks for a check you will run",
  hint: "Demand a checklist, test, or source you can verify yourself.",
  test: (p) =>
    includesAny(p, ["checklist", "verify", "dry-run", "dry run", "unit test", "docs", "source", "falsify", "i will"]),
};

const checkSpecific: AiCheck = {
  id: "specific",
  label: "Is specific enough to practice",
  hint: "More than “help” / “fix this” — add audience, length, or a concrete object.",
  test: notVague,
};

function checksFor(extra: AiCheck[]): AiCheck[] {
  return [checkSpecific, checkNoSecretDump, ...extra];
}

const EXERCISES: Record<string, AiExercise[]> = {
  "pe-ask-better-questions": [
    {
      id: "four-line",
      label: "Four-line prompt",
      starter: "Goal:\nContext:\nConstraints:\nOutput format:",
      note: "Fill every line. Vague “help with Snowflake” fails the checklist.",
      sketch:
        "A live model might return a short explanation plus the format you asked for. You still check facts. This sketch is not Claude or GPT.",
      checks: checksFor([checkGoal, checkContext, checkConstraints, checkFormat]),
    },
  ],
  "pe-structure-prompts": [
    {
      id: "role-task",
      label: "Role + task + verify",
      starter:
        "You are a patient data-engineering tutor.\nTask: ...\nShow work in steps.\nEnd with a 3-item checklist I can verify.",
      note: "Role, one verb, steps, and a checklist you will still run.",
      sketch:
        "Expected shape: numbered steps, then a 3-item verify list. Local practice only — not a live tutor account.",
      checks: checksFor([checkRole, checkGoal, checkFormat, checkVerify]),
    },
  ],
  "pe-iterate-and-refine": [
    {
      id: "steer-draft",
      label: "Steer a first draft",
      starter:
        "Keep the warehouse vs database table.\nRewrite the intro for a beginner DE.\nShow two options and when I’d pick each.\nYou assumed Postgres — redo the SQL in Snowflake.",
      note: "Quote what to keep vs change. “Try harder” is not a follow-up.",
      sketch:
        "A follow-up like this steers a draft. A live model would rewrite only the parts you named. Review both options yourself.",
      checks: checksFor([
        {
          id: "keep-or-change",
          label: "Says what to keep or change",
          hint: "Quote the weak part, or say keep X / rewrite Y.",
          test: (p) => includesAny(p, ["keep", "rewrite", "change", "redo", "shorten", "drop", "instead"]),
        },
        {
          id: "alternative",
          label: "Asks for options or a tighter rewrite",
          hint: "Ask for two options, a dialect redo, or a shorter version.",
          test: (p) => includesAny(p, ["two options", "option", "alternative", "redo", "snowflake", "shorten", "beginner"]),
        },
      ]),
    },
  ],
  "pe-verify-answers": [
    {
      id: "verify-loop",
      label: "Verify loop",
      starter: "1. Restate claim\n2. Find source or run tiny test\n3. Compare\n4. Keep / fix / discard",
      note: "AI can be wrong with confidence. You are the safety layer.",
      sketch:
        "Use this loop on the next model answer you get. Local practice does not look up docs or run SQL for you.",
      checks: checksFor([
        checkVerify,
        {
          id: "claim-or-test",
          label: "Names a claim, source, or tiny test",
          hint: "Restate the claim and say how you will check it (docs or a dry-run).",
          test: (p) => includesAny(p, ["claim", "source", "test", "docs", "compare", "keep", "discard", "dialect"]),
        },
      ]),
    },
  ],
  "pe-safety-privacy": [
    {
      id: "safe-sample",
      label: "Safe sample instead of prod",
      starter:
        "Goal: Help me shape a quality check for late orders.\nContext: Schema only — order_id, updated_at, status. Two fake rows (Ada, 2026-09-10).\nConstraints: no secrets, no customer emails, no connection strings.\nOutput format: 5-bullet checklist I can run in SQL.",
      note: "Prefer schema + synthetic rows. Never paste keys or customer dumps.",
      sketch:
        "Good. A live chat would still be untrusted — you run the SQL. This page never sends your prompt anywhere.",
      checks: checksFor([
        checkNoSecretsAsk,
        checkFormat,
        {
          id: "synthetic",
          label: "Uses schema or fake rows",
          hint: "Describe columns or 2–3 made-up rows instead of a prod extract.",
          test: (p) => includesAny(p, ["schema", "fake", "synthetic", "sample", "made-up", "order_id", "column"]),
        },
      ]),
    },
  ],
  "pe-prompts-for-learning": [
    {
      id: "tutor-drill",
      label: "Tutor + drill",
      starter:
        "Role: You are a DE tutor.\nGoal: Quiz me on INNER vs LEFT joins after I attempt an explanation.\nContext: I already tried: INNER keeps matches; LEFT keeps all left rows.\nConstraints: no secrets; wait for my attempt before the answer key.\nOutput format: 3 drill questions, then critique my attempt.",
      note: "Attempt first. AI critiques — it does not replace thinking.",
      sketch:
        "A tutor pattern: you attempt, then ask for drills and a critique. Grade the drills yourself. Not a live tutor login.",
      checks: checksFor([checkRole, checkGoal, checkVerify, checkNoSecretsAsk]),
    },
  ],
  "pe-de-role-prompt-library": [
    {
      id: "on-call",
      label: "On-call triage",
      starter:
        "Role: You are a calm data-engineering on-call pair.\nGoal: Rank likely causes for orders_daily being 0 rows for today.\nContext: Silver MERGE + gold daily grain; late overlap 2 days; no cluster IDs.\nConstraints: no secrets, no DROP/UPDATE, list checks I can run.\nOutput format:\n1. Top 3 causes (ranked)\n2. The next query or Job check for each\n3. What would falsify each cause",
      note: "Same four-line skeleton — specialized for ops. You run the checks.",
      sketch:
        "Expected: ranked causes, a next check each, and a falsifier. Local checklist only — not paging a vendor model.",
      checks: checksFor([checkRole, checkGoal, checkConstraints, checkFormat, checkNoSecretsAsk, checkVerify]),
    },
  ],
  "ai-de-copilot-mindset": [
    {
      id: "copilot-scope",
      label: "Draft, don’t merge",
      starter:
        "Goal: Explain this Spark error and suggest the next check I should run.\nContext: Junior DE; gold.orders_daily job; I own the merge.\nConstraints: no secrets; do not tell me to auto-merge; I will review.\nOutput format: 3 bullets — meaning, likely cause, next human check.",
      note: "AI drafts and explains. You own correctness.",
      sketch:
        "A copilot answer is a draft. You still run the check and own the change. Not a live Claude or GPT account.",
      checks: checksFor([checkGoal, checkConstraints, checkFormat, checkVerify]),
    },
  ],
  "ai-de-debug-with-ai": [
    {
      id: "symptom-pack",
      label: "Symptom package",
      starter: "Symptom:\nExpected:\nActual:\nRecent changes:\nEnvironment:\nAsk: 3 hypotheses + checks (no secrets).",
      note: "Expected vs actual + what you tried. Ask for checks, not a magical fix.",
      sketch:
        "Fill every line, then Copy into your own tool if you want a live reply. This page only scores the package.",
      checks: checksFor([
        {
          id: "expected-actual",
          label: "Expected vs actual",
          hint: "Write both Expected and Actual (or symptom + what you saw).",
          test: (p) =>
            (includesAny(p, ["expected"]) && includesAny(p, ["actual"])) ||
            includesAny(p, ["symptom", "error", "failed", "0 rows"]),
        },
        {
          id: "hypotheses",
          label: "Asks for hypotheses + checks",
          hint: "Ask for ranked hypotheses and concrete checks.",
          test: (p) => includesAny(p, ["hypothes", "check", "rank", "likely"]),
        },
        checkNoSecretsAsk,
      ]),
    },
  ],
  "ai-de-generate-code-safely": [
    {
      id: "dialect-merge",
      label: "Dialect-aware MERGE ask",
      starter:
        "Goal: Draft a Snowflake MERGE for dim_customers (explicit columns, no SET *).\nContext: Natural key email; warehouse ANALYTICS; I will dry-run.\nConstraints: Snowflake SQL; list assumptions; no secrets; no DROP.\nOutput format: SQL + numbered assumptions I can challenge.",
      note: "Name the dialect and require assumptions. Review writes like a PR.",
      sketch:
        "A live model might invent a MERGE. You still read every write, filter, and join key. Local practice does not execute SQL.",
      checks: checksFor([
        {
          id: "dialect",
          label: "Names a dialect or engine",
          hint: "Say Snowflake, Spark, Postgres, or another engine.",
          test: (p) => includesAny(p, ["snowflake", "spark", "postgres", "databricks", "duckdb", "ansi", "dialect"]),
        },
        {
          id: "assumptions",
          label: "Asks for assumptions or a review hook",
          hint: "Require “list assumptions” or a dry-run / test.",
          test: (p) => includesAny(p, ["assumption", "dry-run", "dry run", "review", "idempotent", "explicit"]),
        },
        checkNoSecretsAsk,
        checkFormat,
      ]),
    },
  ],
  "ai-de-docs-and-tests": [
    {
      id: "docs-tests",
      label: "Docs + edge-case tests",
      starter:
        "Goal: Write a 6-line README note and 2 tests for this sanitized function.\nContext: def paid_only(rows): return [r for r in rows if r.get(\"status\") == \"paid\"]\nConstraints: no secrets; I will run the tests; include one empty-list case.\nOutput format: docs, then pytest-shaped tests.",
      note: "Paste sanitized code + intended behavior. Read and run what you get.",
      sketch:
        "Docs and tests are drafts. Execute them. This checklist never calls a model.",
      checks: checksFor([
        {
          id: "code-or-behavior",
          label: "Includes code or intended behavior",
          hint: "Paste a sanitized function or say what it should do.",
          test: (p) => includesAny(p, ["def ", "function", "readme", "behavior", "paid", "status"]),
        },
        {
          id: "tests",
          label: "Asks for tests or edge cases",
          hint: "Ask for tests, empty-list, or an edge case you will run.",
          test: (p) => includesAny(p, ["test", "edge", "pytest", "empty"]),
        },
        checkNoSecretsAsk,
      ]),
    },
  ],
  "ai-de-tools-workflow": [
    {
      id: "pick-tool",
      label: "Match the tool to the job",
      starter:
        "Goal: Pick one tool for this task and say why — not a catalog dump.\nContext: I am in a Snowflake worksheet next to silver.orders, not in an IDE.\nConstraints: no secrets; I will still review; workplace policy applies.\nOutput format: 1) tool 2) why it fits 3) what I still verify.",
      note: "Chat vs inline vs warehouse assistant. You still review.",
      sketch:
        "Warehouse-native assist fits SQL-next-to-catalog. Copilot-style fits the editor. Local practice does not open those products.",
      checks: checksFor([
        {
          id: "tool-named",
          label: "Names a tool or surface",
          hint: "Mention chat, Copilot, Cortex, Assistant, or a worksheet.",
          test: (p) =>
            includesAny(p, ["copilot", "claude", "grok", "cortex", "assistant", "worksheet", "chat", "notebook"]),
        },
        checkFormat,
        checkVerify,
      ]),
    },
  ],
  "ai-de-review-changes": [
    {
      id: "pr-checklist",
      label: "AI PR checklist",
      starter: "- Dialect correct?\n- Idempotent writes?\n- Secrets absent?\n- Tests/dry-run?\n- Lineage impact noted?",
      note: "You are accountable for the merge. Read write paths even when tests are green.",
      sketch:
        "Turn this into comments on the PR. Local practice does not merge anything.",
      checks: checksFor([
        {
          id: "writes",
          label: "Mentions writes, dialect, or idempotency",
          hint: "Call out dialect, MERGE/UPDATE, or replay safety.",
          test: (p) => includesAny(p, ["dialect", "idempotent", "write", "merge", "dry-run", "dry run"]),
        },
        checkNoSecretsAsk,
        checkVerify,
      ]),
    },
  ],
  "ai-de-practice-agents": [
    {
      id: "tool-call",
      label: "Agent tool call",
      starter:
        "You are a data-engineering agent.\n\nGoal: Find why yesterday's orders_daily job scanned ~12x more bytes.\n\nAvailable tools:\n- inspect_query_profile(query_id)\n- list_recent_queries(warehouse, hours)\n- sample_table(fqn, limit)\n\nPlan:\n1. Call list_recent_queries(warehouse=\"etl_wh\", hours=24)\n2. Pick the slowest QUERY_ID\n3. Call inspect_query_profile(query_id=...)\n4. Report bytes scanned, pruning, spill, and the next human check\n\nConstraints: no secrets, no DROP/UPDATE, cite the next tool call.\nOutput format:\n- Thought\n- Tool call (name + JSON args)\n- Expected evidence",
      note: "The model should name the tool — you still run it. Not a live Cortex account.",
      sketch:
        "Thought → tool name + JSON args → evidence you will read. Copy into your own chat if you want a live draft. This page does not call Cortex.",
      checks: checksFor([
        {
          id: "tools",
          label: "Names tools",
          hint: "List available tools or a single tool name.",
          test: (p) =>
            includesAny(p, ["tool", "inspect_query_profile", "warehouse_query", "list_recent", "cortex"]),
        },
        {
          id: "json-args",
          label: "Shows JSON-shaped args or a plan",
          hint: "Include { \"…\" } args or a numbered tool plan.",
          test: (p) => /\{\s*"/.test(p) || includesAny(p, ["json", "args", "query_id", "plan:"]),
        },
        checkNoSecretsAsk,
        checkFormat,
      ]),
    },
    {
      id: "cortex-sql",
      label: "Cortex SQL shape (copy fallback)",
      starter:
        "SELECT SNOWFLAKE.CORTEX.COMPLETE(\n  'llama3.1-70b',\n  'Summarize this incident in 2 bullets: ' || incident_text\n) AS summary\nFROM ops.incidents\nLIMIT 5;",
      note: "Copy into a Snowflake worksheet later. Treat output as untrusted. No live account here.",
      sketch:
        "This is a SQL shape to copy — not a running Cortex call. Local practice never opens a warehouse.",
      checks: checksFor([
        {
          id: "cortex-fn",
          label: "Uses a Cortex function or COMPLETE",
          hint: "Keep SNOWFLAKE.CORTEX.* (or say you will copy it to a worksheet).",
          test: (p) => includesAny(p, ["cortex", "complete", "summarize", "sentiment", "translate"]),
        },
        {
          id: "select-only",
          label: "Stays read-only",
          hint: "Keep it SELECT-shaped. No DROP / UPDATE / credentials.",
          test: (p) => !includesAny(p, ["drop ", "delete ", "update ", "password", "private key"]),
        },
      ]),
    },
  ],
  "ai-de-practice-nonsf-agents": [
    {
      id: "generic-tools",
      label: "Generic tool-calling plan",
      starter:
        "You are a data-engineering agent (not Snowflake-specific).\n\nGoal: Explain why the orders_daily job ran 3x longer today.\n\nAvailable tools:\n- list_job_runs(job_name, hours)\n- inspect_job_run(run_id)\n- sample_table(fqn, limit)\n- explain_query(sql)\n\nPlan:\n1. Call list_job_runs(job_name=\"orders_daily\", hours=48)\n2. Pick the slow run_id vs the previous success\n3. Call inspect_job_run(run_id=...)\n4. If a SQL task dominates, call explain_query\n\nConstraints: no secrets, no DROP, cite the next tool call.\nOutput format:\n- Thought\n- Tool call (name + JSON args)\n- Expected evidence",
      note: "Named tools + JSON args. You run the call. No /practice simulator.",
      sketch:
        "Same mindset as Cortex — different tools. Local checklist only; no Databricks Assistant login.",
      checks: checksFor([
        {
          id: "tools",
          label: "Names generic tools",
          hint: "Include list_job_runs, inspect_job_run, warehouse_query, or similar.",
          test: (p) =>
            includesAny(p, ["tool", "list_job", "inspect_job", "warehouse_query", "explain_query", "assistant"]),
        },
        {
          id: "json-args",
          label: "Shows JSON args or a plan",
          hint: "Add JSON args or a numbered plan.",
          test: (p) => /\{\s*"/.test(p) || includesAny(p, ["json", "args", "plan:", "run_id"]),
        },
        checkNoSecretsAsk,
        checkFormat,
      ]),
    },
  ],
};

const FALLBACK: AiExercise[] = [
  {
    id: "four-line-fallback",
    label: "Four-line prompt",
    starter: "Goal:\nContext:\nConstraints:\nOutput format:",
    note: "Fill every line, then check. Copy if you want a live model.",
    sketch: "Local practice sketch — not a live Claude or GPT reply.",
    checks: checksFor([checkGoal, checkContext, checkConstraints, checkFormat]),
  },
];

export function exercisesForLesson(slug: string): AiExercise[] {
  return EXERCISES[slug] ?? FALLBACK;
}

export function matchExercise(slug: string, source: string): AiExercise | undefined {
  const list = exercisesForLesson(slug);
  const trimmed = source.trim();
  return (
    list.find((ex) => ex.starter.trim() === trimmed) ??
    list.find((ex) => trimmed.includes(ex.starter.trim().slice(0, 40))) ??
    list[0]
  );
}

export function evaluatePrompt(exercise: AiExercise, source: string): AiRubricResult {
  const prompt = assertSafeAiPrompt(source);
  const items = exercise.checks.map((check) => ({
    id: check.id,
    label: check.label,
    hint: check.hint,
    pass: check.test(prompt),
  }));
  const passed = items.filter((item) => item.pass).length;
  const total = items.length;
  const pass = total > 0 && passed === total;
  const sketch = buildSketch(exercise, pass, items);
  return { pass, passed, total, items, sketch };
}

function buildSketch(exercise: AiExercise, pass: boolean, items: AiRubricItem[]): string {
  const failed = items.filter((item) => !item.pass).map((item) => `• ${item.hint}`);
  const body = [
    "Local practice sketch — not a live Claude or GPT reply. Nothing left this browser.",
    "",
    pass
      ? "Checklist met. Copy into your own AI tool if you want a live draft — you still review it."
      : "Tighten the failed lines, then check again. Copy stays available either way.",
    "",
    exercise.sketch,
    failed.length ? `\nStill open:\n${failed.join("\n")}` : "",
  ]
    .join("\n")
    .trim();
  return body.length > AI_SKETCH_MAX_CHARS ? `${body.slice(0, AI_SKETCH_MAX_CHARS - 1)}…` : body;
}
