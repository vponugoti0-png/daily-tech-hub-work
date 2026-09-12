/** Kid-friendly glossary for DE / AI jargon. */
export type JargonEntry = {
  term: string;
  plain: string;
  /** Optional longer tip */
  tip?: string;
};

export const JARGON: JargonEntry[] = [
  {
    term: "DE",
    plain: "Data Engineer",
    tip: "Someone who builds pipelines that move and clean data.",
  },
  {
    term: "DBX",
    plain: "Databricks",
    tip: "A cloud platform for big data and AI notebooks.",
  },
  {
    term: "CLI",
    plain: "Command line",
    tip: "The text box where you type commands instead of clicking.",
  },
  {
    term: "Cortex",
    plain: "Snowflake AI helpers",
    tip: "Built-in AI features inside Snowflake for SQL and apps.",
  },
  {
    term: "SQL",
    plain: "Database language",
    tip: "How you ask a database for rows of data.",
  },
  {
    term: "ETL",
    plain: "Extract → Transform → Load",
    tip: "Pull data out, clean it, then store it somewhere useful.",
  },
  {
    term: "API",
    plain: "App connector",
    tip: "A way for programs to talk to each other.",
  },
  {
    term: "XP",
    plain: "Experience points",
    tip: "Points you earn when you finish lessons — like a game.",
  },
  {
    term: "OAuth",
    plain: "Sign in with Google/GitHub",
    tip: "A safe way to log in without inventing a new password here.",
  },
  {
    term: "LLM",
    plain: "AI chat brain",
    tip: "The model behind tools like Claude, Copilot, or Grok.",
  },
  {
    term: "Prompt",
    plain: "Question for AI",
    tip: "What you type to ask an AI for help.",
  },
  {
    term: "Warehouse",
    plain: "Big data store",
    tip: "A place (like Snowflake) that holds lots of tables for analytics.",
  },
  {
    term: "Pipeline",
    plain: "Data assembly line",
    tip: "Steps that move data from A to B automatically.",
  },
  {
    term: "Sandbox",
    plain: "Safe practice area",
    tip: "A place to try code without breaking real systems.",
  },
  {
    term: "Delta Lake",
    plain: "Spreadsheet-with-history for big tables",
    tip: "A lakehouse table format that keeps versions so you can undo a bad write.",
  },
  {
    term: "Medallion",
    plain: "Bronze → Silver → Gold layers",
    tip: "Raw data, then cleaned data, then the tables dashboards read.",
  },
  {
    term: "Schema",
    plain: "Table blueprint",
    tip: "The list of columns and types a table is allowed to have.",
  },
  {
    term: "Cluster",
    plain: "Shared computers for a job",
    tip: "The machines Databricks starts to run your notebook or pipeline.",
  },
  {
    term: "Incremental",
    plain: "Only the new rows",
    tip: "A job that loads today’s changes instead of re-reading the whole table.",
  },
];

export function findJargon(word: string): JargonEntry | undefined {
  const clean = word.replace(/[^A-Za-z0-9+/.-]/g, "");
  return JARGON.find((j) => j.term.toLowerCase() === clean.toLowerCase());
}

export const PLAIN_ENGLISH_KEY = "dth-plain-english";
