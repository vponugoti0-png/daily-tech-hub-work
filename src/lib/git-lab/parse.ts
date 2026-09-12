export type ParsedGitCommand =
  | { ok: true; cmd: GitVerb }
  | { ok: false; error: string };

export type GitVerb =
  | { name: "help" }
  | { name: "status" }
  | { name: "log"; oneline: boolean }
  | { name: "commit"; message?: string }
  | { name: "branch"; create?: string; list: boolean }
  | { name: "checkout"; target?: string; create: boolean }
  | { name: "switch"; target?: string; create: boolean }
  | { name: "merge"; target?: string }
  | { name: "rebase"; target?: string }
  | { name: "reset"; target?: string; mode: "soft" | "mixed" | "hard" }
  | { name: "fetch" }
  | { name: "pull"; rebase: boolean }
  | { name: "push"; remote?: string; branch?: string }
  | { name: "remote" };

const SHELL_BLOCK =
  "This is a git-only sandbox, not a shell. Practice VM (B) is out of scope — commands stay on this page.";

const NETWORK_BLOCK =
  "No network. Remotes here are a same-origin mock named origin — nothing leaves the browser.";

/** Split a CLI line, honoring single/double quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function isHttpUrl(token: string): boolean {
  return /^https?:\/\//i.test(token);
}

export function parseGitCommand(line: string): ParsedGitCommand {
  const trimmed = line.trim();
  if (!trimmed) return { ok: false, error: "" };

  const tokens = tokenize(trimmed);
  if (!tokens.length) return { ok: false, error: "" };

  const head = tokens[0].toLowerCase();
  if (["ls", "cd", "rm", "cat", "echo", "sudo", "bash", "sh", "python", "npm", "ssh", "curl", "wget"].includes(head)) {
    return { ok: false, error: SHELL_BLOCK };
  }
  if (head === "clone" || (head === "git" && tokens[1]?.toLowerCase() === "clone")) {
    return { ok: false, error: NETWORK_BLOCK };
  }
  if (tokens.some(isHttpUrl) && !["help", "log", "status"].includes(head)) {
    return { ok: false, error: NETWORK_BLOCK };
  }

  if (head === "help" || (head === "git" && tokens[1]?.toLowerCase() === "help")) {
    return { ok: true, cmd: { name: "help" } };
  }

  let rest = tokens;
  if (head === "git") {
    rest = tokens.slice(1);
    if (!rest.length) return { ok: true, cmd: { name: "help" } };
  }

  const verb = rest[0]?.toLowerCase();
  const args = rest.slice(1);

  switch (verb) {
    case "status":
      return { ok: true, cmd: { name: "status" } };
    case "log":
      return { ok: true, cmd: { name: "log", oneline: args.includes("--oneline") || args.includes("-1") } };
    case "commit": {
      const mi = args.findIndex((a) => a === "-m" || a === "-am" || a === "--message");
      const message = mi >= 0 ? args[mi + 1] : undefined;
      return { ok: true, cmd: { name: "commit", message } };
    }
    case "branch": {
      const name = args.find((a) => !a.startsWith("-"));
      return { ok: true, cmd: { name: "branch", create: name, list: !name } };
    }
    case "checkout": {
      const create = args.includes("-b") || args.includes("-B");
      const target = args.find((a) => !a.startsWith("-"));
      return { ok: true, cmd: { name: "checkout", target, create } };
    }
    case "switch": {
      const create = args.includes("-c") || args.includes("-C");
      const target = args.find((a) => !a.startsWith("-"));
      return { ok: true, cmd: { name: "switch", target, create } };
    }
    case "merge":
      return { ok: true, cmd: { name: "merge", target: args.find((a) => !a.startsWith("-")) } };
    case "rebase": {
      if (args.includes("--abort")) {
        return { ok: false, error: "No rebase in progress (this model finishes rebase in one step)." };
      }
      return { ok: true, cmd: { name: "rebase", target: args.find((a) => !a.startsWith("-")) } };
    }
    case "reset": {
      let mode: "soft" | "mixed" | "hard" = "mixed";
      if (args.includes("--soft")) mode = "soft";
      if (args.includes("--hard")) mode = "hard";
      const target = args.find((a) => !a.startsWith("-")) ?? "HEAD";
      return { ok: true, cmd: { name: "reset", target, mode } };
    }
    case "fetch":
      return { ok: true, cmd: { name: "fetch" } };
    case "pull":
      return { ok: true, cmd: { name: "pull", rebase: args.includes("--rebase") } };
    case "push": {
      const positional = args.filter((a) => !a.startsWith("-"));
      return {
        ok: true,
        cmd: { name: "push", remote: positional[0], branch: positional[1] },
      };
    }
    case "remote":
      return { ok: true, cmd: { name: "remote" } };
    default:
      return {
        ok: false,
        error: verb
          ? `Unknown command \`${verb}\`. Try \`help\` for the verbs this in-browser model supports.`
          : "Type a git command, or \`help\`.",
      };
  }
}
