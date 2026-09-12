/** Wave A1 extras — original Aurora quiz + TryIt copy. Applied onto existing lessons. */

const q = (question, options, answer, explanation) => ({
  question,
  options,
  answer,
  explanation,
});

const cs = (label, code, note) => ({ label, code, note });

export const EXTRAS = {
  // --- Prompt engineering ---
  "pe-ask-better-questions": {
    cheatSheet: [
      cs(
        "Weak → strong rewrite",
        "Weak: Help with my pipeline\nStrong:\nGoal: Explain why silver dropped order_id 3\nContext: Junior DE, Aurora bronze→silver Spark SQL\nConstraints: 5 bullets, no secrets, DuckDB-friendly SQL\nOutput format: bullets then one SELECT",
        "Fill every line. Vague asks waste a turn.",
      ),
    ],
    quiz: [
      q(
        "A useful first answer comes back as a wall of prose. Which four-line slot did you probably skip?",
        [
          "Goal — you never said what success looks like",
          "Output format — bullets, a table, or SQL so you can paste it",
          "The model name only",
          "A joke to warm up the model",
        ],
        1,
        "Format is how you make the answer usable. A wall of prose is usually a missing output-format line.",
      ),
      q(
        "Which rewrite is stronger for “help with my pipeline”?",
        [
          "Help with my pipeline please",
          "I’m a junior DE on Aurora. Explain why silver dropped a bronze row, in 5 bullets plus one Spark SQL check I can run.",
          "Write code",
          "Fix everything in Databricks",
        ],
        1,
        "Audience, stack, the exact failure, length, and a runnable check beat a vague help ask.",
      ),
    ],
  },
  "pe-structure-prompts": {
    cheatSheet: [
      cs(
        "Tiny good-output example",
        "Good answer looks like:\n1. Cause (one sentence)\n2. Check (one SELECT)\n3. What not to do (one line)",
        "A short example teaches shape better than another adjective.",
      ),
    ],
    quiz: [
      q(
        "What is a role line for?",
        [
          "To flatter the model",
          "To set the voice and bar — tutor, reviewer, SQL coach — so the answer matches how you will use it",
          "To replace a task verb",
          "To hide missing constraints",
        ],
        1,
        "Role sets voice. You still need a task, constraints, and a format.",
      ),
      q(
        "A self-check checklist from the model is useful because…",
        [
          "You can trust it blindly",
          "It gives you a list you still run yourself",
          "It replaces unit tests",
          "It means the SQL is production-ready",
        ],
        1,
        "Ask for a checklist you will execute. Never treat the model’s “looks good” as a test.",
      ),
    ],
  },
  "pe-iterate-and-refine": {
    cheatSheet: [
      cs(
        "Cite-and-change follow-up",
        "Keep the 5-bullet cause list.\nChange: drop the warehouse lecture.\nAdd: one DuckDB SELECT on silver_orders that proves the leftover key.",
        "Quote what to keep vs change. “Try harder” is not a spec.",
      ),
    ],
    quiz: [
      q(
        "Why ask for two alternatives instead of one rewrite?",
        [
          "So you can pick a tradeoff you understand",
          "Because longer chats are always better",
          "To hide that you skipped constraints",
          "So you never have to run a check",
        ],
        0,
        "Alternatives surface tradeoffs. You still pick and verify.",
      ),
      q(
        "The model added a new CTE you did not ask for. Best follow-up?",
        [
          "Merge it unread",
          "“Remove the extra CTE. Keep the WHERE on order_date. Show only the grain I named.”",
          "Start over with a vaguer prompt",
          "Ask it to make the SQL longer",
        ],
        1,
        "Cite the extra piece and name the grain. Do not accept drive-by complexity.",
      ),
    ],
  },
  "pe-verify-answers": {
    cheatSheet: [
      cs(
        "Verify card",
        "1. Re-state the grain in one sentence\n2. Run the SELECT / test yourself\n3. Check dialect keywords against your warehouse\n4. Reject any secret or URL you did not provide",
        "You are the reviewer. The model is a draft.",
      ),
    ],
    quiz: [
      q(
        "The model says “this MERGE is safe.” What do you do?",
        [
          "Ship it — the model reviewed itself",
          "Dry-run or preview the match set, then read every write clause",
          "Only run Prettier",
          "Paste prod credentials so it can connect",
        ],
        1,
        "Self-praise is not a review. Preview the rows a write would touch.",
      ),
      q(
        "A generated explanation invents a Snowflake function you have never seen. Next step?",
        [
          "Assume it shipped last night",
          "Look it up in your dialect docs, or ask for ANSI-only",
          "Use it in prod to learn",
          "Ignore dialect forever",
        ],
        1,
        "Hallucinated functions are common. Verify against docs or constrain the dialect.",
      ),
    ],
  },
  "pe-safety-privacy": {
    cheatSheet: [
      cs(
        "Redact before you paste",
        "Schema: order_id INT, email VARCHAR, amount NUMERIC\nSynthetic rows:\n  (1001, 'ada@example.test', 42.50)\n  (1002, NULL, 18.00)\nNever: real emails, DSNs, tokens, warehouse passwords.",
        "Shape is enough. Prod dumps and keys stay out of the chat.",
      ),
    ],
    quiz: [
      q(
        "Your teammate pastes a Databricks personal access token into a public chat to “debug auth.” That is…",
        [
          "Fine if they delete the thread later",
          "A secret leak — rotate the token and use a redacted error",
          "Required by most AI tools",
          "Safer than a screenshot",
        ],
        1,
        "Tokens in a prompt are credentials in a third-party log. Rotate and redact.",
      ),
      q(
        "Which prompt is workplace-safer?",
        [
          "Here is our ACCOUNTADMIN password, fix grants",
          "Here is a fake Unity Catalog grant list with names like ada@example.test — which privilege is extra?",
          "Upload last month’s customer export",
          "Paste the PEM for the warehouse user",
        ],
        1,
        "Synthetic names keep the shape. Real passwords and exports do not belong in a prompt.",
      ),
    ],
  },
  "pe-prompts-for-learning": {
    cheatSheet: [
      cs(
        "Teach-back prompt",
        "Explain Snowflake warehouses vs databases to a junior DE.\nThen ask me 3 quiz questions.\nWait for my answers before you reveal yours.",
        "Learning prompts should test you, not only lecture you.",
      ),
    ],
    quiz: [
      q(
        "Best learning prompt after you read a lesson?",
        [
          "Summarize the internet",
          "Quiz me on Aurora SELECT NULLs; wait for my answer; then explain why I was wrong",
          "Give me the answer key only",
          "Skip practice and generate a cert",
        ],
        1,
        "A quiz that waits for you builds the “why.” Answer keys alone fade.",
      ),
      q(
        "Why ask the model to use your stack names (Aurora, silver_orders)?",
        [
          "So it can log into your warehouse",
          "So examples transfer to the lab you will actually run",
          "Because generic SQL is illegal",
          "To hide missing constraints",
        ],
        1,
        "Familiar table names make practice copy-pasteable into the local lab.",
      ),
    ],
  },
  "pe-de-role-prompt-library": {
    cheatSheet: [
      cs(
        "On-call first message",
        "Role: incident scribe\nGoal: Turn this page into a 5-line timeline + one next check\nContext: Aurora gold_daily_orders is stale; last Job run 02:14 UTC\nConstraints: no secrets, no blame\nOutput: timeline, impact grain, next SELECT",
        "Incidents need a grain and a next check — not a novel.",
      ),
    ],
    quiz: [
      q(
        "A PR-review prompt should ask the model to…",
        [
          "Approve the PR automatically",
          "List grain risks, secret leaks, and missing tests — you still decide",
          "Rewrite history on main",
          "Post to Slack as you",
        ],
        1,
        "The model drafts a review. You own the merge.",
      ),
      q(
        "Why keep a library of role prompts instead of one mega-prompt?",
        [
          "Mega-prompts always win",
          "On-call, PR, and incident asks need different constraints and formats",
          "Libraries are required by Snowflake",
          "So you can paste prod keys once",
        ],
        1,
        "Different jobs, different fences. Reuse the skeleton; swap the role.",
      ),
    ],
  },

  // --- AI for DE ---
  "ai-de-copilot-mindset": {
    cheatSheet: [
      cs(
        "Copilot vs autopilot",
        "Draft: explain this Spark error\nReview: suggest a test I will run\nNever: auto-merge, rotate keys from chat, DROP in prod",
        "You own correctness. The model drafts.",
      ),
    ],
    quiz: [
      q(
        "Which task is high-leverage for a junior DE with AI?",
        [
          "Silent ALTER on prod gold",
          "Translate an error into the next warehouse check, then run it yourself",
          "Let chat rotate the service principal",
          "Skip the PR because the model “LGTM”",
        ],
        1,
        "Explain → you verify. Writes and secrets stay human-led.",
      ),
      q(
        "AI suggests DROP TABLE analytics.orders. You should…",
        [
          "Run it — copilots are careful",
          "Refuse and ask for a SELECT preview of what would disappear",
          "Paste ACCOUNTADMIN to make it easier",
          "Disable backups first",
        ],
        1,
        "Destructive DDL from chat is a low-trust use. Preview or reject.",
      ),
    ],
  },
  "ai-de-debug-with-ai": {
    cheatSheet: [
      cs(
        "Debug packet",
        "Error: (paste redacted)\nGrain I expected: 1 row per order_id\nLast change: added a join to aurora_order_items\nAsk: name 2 likely grain bugs and 1 SELECT to prove the fan-out.",
        "Give the grain and the last change. Do not paste secrets.",
      ),
    ],
    quiz: [
      q(
        "Your gold revenue doubled after an AI-suggested join. First check?",
        [
          "Ship a dashboard apology",
          "Count rows before vs after the join and look for item-grain fan-out",
          "Hide the metric",
          "Ask the model to invent a new grain",
        ],
        1,
        "Joins to items fan out order amount. Prove it with counts, then fix.",
      ),
      q(
        "What belongs in a debug prompt?",
        [
          "The warehouse password so it can connect",
          "Redacted error, expected grain, and last change",
          "The entire prod dump",
          "Only the word “broken”",
        ],
        1,
        "Shape + grain + last change. Credentials never.",
      ),
    ],
  },
  "ai-de-generate-code-safely": {
    cheatSheet: [
      cs(
        "Dialect-aware ask",
        "Write a MERGE for DuckDB-shaped SQL first, then note Snowflake differences.\nKey: order_id\nWhen matched: update amount, status\nWhen not matched: insert\nDo not invent SET * if the dialect lacks it.",
        "Name the engine. Review every write clause.",
      ),
    ],
    quiz: [
      q(
        "AI emits QUALIFY in a query you will run on a warehouse that lacks it. You…",
        [
          "Ship it and hope",
          "Rewrite with a window + filter, or ask for ANSI",
          "Enable every experimental flag in prod",
          "Ignore the lesson dialect",
        ],
        1,
        "Dialect mismatches fail at runtime. Constrain or translate.",
      ),
      q(
        "Why require comments on assumptions in generated SQL?",
        [
          "Comments make queries slower",
          "You can see where the model guessed a grain, timezone, or NULL rule",
          "Legal teams require Latin comments",
          "So you can skip tests",
        ],
        1,
        "Assumptions are where silent bugs hide. Make them visible, then test.",
      ),
    ],
  },
  "ai-de-docs-and-tests": {
    cheatSheet: [
      cs(
        "Test-first ask",
        "Write pytest for paid_only(rows).\nCases: paid kept, pending dropped, amount None excluded.\nThen draft a 4-line docstring that names the grain.",
        "Tests first. Docs that name the grain beat poetry.",
      ),
    ],
    quiz: [
      q(
        "Best first artifact to ask AI for on a new transform?",
        [
          "A logo",
          "A failing unit test that names the grain, then the function",
          "A production Job YAML",
          "A Slack announcement",
        ],
        1,
        "A test pins the contract. Code that follows is reviewable.",
      ),
      q(
        "AI wrote a docstring that never mentions grain. You should…",
        [
          "Ship — docs are optional",
          "Add the grain (1 row per order_id) before anyone copies the function",
          "Delete all comments",
          "Translate it to Latin",
        ],
        1,
        "Grain is the contract. A docstring without it invites the next join bug.",
      ),
    ],
  },
  "ai-de-tools-workflow": {
    cheatSheet: [
      cs(
        "Tool fence",
        "IDE chat: draft + explain\nPR bot: list risks, do not merge\nWarehouse copilot: SELECT only until you review\nNever: paste tokens into a generic web chat",
        "Pick the tool that already has your repo context — still review.",
      ),
    ],
    quiz: [
      q(
        "A generic web chat is a poor place to…",
        [
          "Ask how COUNT(*) differs from COUNT(col)",
          "Paste a service principal secret to “test connectivity”",
          "Rewrite a four-line prompt",
          "Request a quiz on NULLs",
        ],
        1,
        "Secrets in a generic chat are a leak. Use a secret manager, not a prompt.",
      ),
      q(
        "When is an in-IDE assistant higher-leverage than a fresh web chat?",
        [
          "When it can see the file you are editing and the test you just ran",
          "When you want to hide the PR",
          "When you need to rotate keys",
          "Never — web chat is always better",
        ],
        0,
        "Repo context beats re-pasting files. You still own the diff.",
      ),
    ],
  },
  "ai-de-review-changes": {
    cheatSheet: [
      cs(
        "AI-diff checklist",
        "- Grain still named?\n- Any secret or %sh credential?\n- Tests updated for the new branch?\n- Destructive DDL previewed?",
        "Review the diff like a teammate wrote it — because you will on-call it.",
      ),
    ],
    quiz: [
      q(
        "An AI patch adds a default of 0 for amount. That is risky because…",
        [
          "Zero is always correct",
          "It invents revenue when the landing was NULL",
          "Ints cannot be 0",
          "DuckDB forbids 0",
        ],
        1,
        "NULL means unknown. Zero-filling lies in gold.",
      ),
      q(
        "Who is on the hook if an AI-authored MERGE overwrites the wrong key?",
        [
          "The model vendor’s pager",
          "You and your review process",
          "Nobody — it was automated",
          "The laptop manufacturer",
        ],
        1,
        "Ownership does not transfer to the model. Review writes like any other PR.",
      ),
    ],
  },
  "ai-de-practice-agents": {
    quiz: [
      q(
        "Cortex-style SQL helpers are safest when they…",
        [
          "Run UPDATE from a chat with no preview",
          "Stay on SELECT / explain paths you can re-run in a worksheet",
          "Store your password for next time",
          "Skip RBAC because the model is trusted",
        ],
        1,
        "Practice agents should not write prod. SELECT and explain, then you apply.",
      ),
      q(
        "An agent offers to “just run the warehouse SQL.” You…",
        [
          "Let it — agents never invent DDL",
          "Copy the SELECT, run it yourself, reject writes you did not ask for",
          "Hand it ACCOUNTADMIN",
          "Disable query history",
        ],
        1,
        "You are the execution engine. Agents draft.",
      ),
    ],
  },
  "ai-de-practice-nonsf-agents": {
    quiz: [
      q(
        "A Databricks Assistant-shaped tool should be asked to…",
        [
          "Grant itself metastore admin",
          "Explain a notebook error and propose a Spark SQL check you will run",
          "Disable Unity Catalog",
          "Push to main",
        ],
        1,
        "Same copilot rule: explain and propose. You run and review.",
      ),
      q(
        "Why practice with a generic agent and a DBX-shaped one?",
        [
          "The buttons look different; the ownership rule does not",
          "Generic agents can hold your PAT safely",
          "Only Cortex is real AI",
          "So you can skip quizzes",
        ],
        0,
        "Tool chrome changes. You still own correctness and secrets.",
      ),
    ],
  },
};

export const MORE = {};
