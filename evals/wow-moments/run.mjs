// End-to-end eval for the wow-moments skill: runs a real headless Claude Code
// session on a copy of a fixture and checks the behaviour the skill promises.
//
//   node evals/wow-moments/run.mjs landing-page
//   node evals/wow-moments/run.mjs sample-next-app --pick "A1, A2"
//
// Phase "scan" always runs: the skill must trigger on its own, stop at a
// menu, change no files, keep to the budget and cite file:line that exist.
// With --pick, the same session continues with those IDs and the harness then
// builds the app itself and inspects the diff.
//
// Costs real tokens (roughly $0.5–2 per run), so it's run by hand before a
// release, not on every push. Needs the `claude` CLI, logged in.

import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const SKILL = join(ROOT, "skills/wow-moments");

const args = process.argv.slice(2);
const fixture = args.find((a) => !a.startsWith("--"));
const pickAt = args.indexOf("--pick");
const pick = pickAt >= 0 ? args[pickAt + 1] : null;
const keep = args.includes("--keep");
const prompt = "The UI of this app is done. Find wow moments in it.";

const source = fixture && join(ROOT, "examples/wow-moments", fixture);
if (!source || !existsSync(source)) {
  console.error("usage: node evals/wow-moments/run.mjs <fixture> [--pick \"A1, A2\"] [--keep]");
  process.exit(2);
}

// --- workspace -------------------------------------------------------------
// A throwaway copy, so the fixture in the repo stays motion-free. The fixture
// README is left out: some list what a good scan should find.
const work = mkdtempSync(join(tmpdir(), `wow-eval-${fixture}-`));
cpSync(source, work, {
  recursive: true,
  filter: (src) => !/\/(node_modules|\.next)(\/|$)/.test(src) && !src.endsWith(`${fixture}/README.md`),
});
// Installed at project level, the way `npx skills add` would put it.
cpSync(SKILL, join(work, ".claude/skills/wow-moments"), { recursive: true });

const sh = (cmd, cmdArgs, opts = {}) => execFileSync(cmd, cmdArgs, { cwd: work, encoding: "utf8", ...opts });
sh("git", ["init", "-q"]);
sh("git", ["add", "-A"]);
sh("git", ["-c", "user.email=eval@local", "-c", "user.name=eval", "commit", "-qm", "baseline"]);
console.log(`workspace: ${work}\ninstalling fixture dependencies…`);
sh("npm", ["ci", "--no-audit", "--no-fund"], { stdio: "ignore" });

// --- run the agent ---------------------------------------------------------
// --setting-sources project: only the skill under test is installed, so the
// result reflects the skill, not whatever else is in the runner's ~/.claude.
function claude(extraArgs, tools) {
  const res = spawnSync(
    "claude",
    ["-p", ...extraArgs, "--setting-sources", "project", "--allowedTools", tools, "--output-format", "stream-json", "--verbose"],
    { cwd: work, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (res.status !== 0) throw new Error(`claude exited ${res.status}: ${res.stderr}`);
  const events = res.stdout.trim().split("\n").map((l) => JSON.parse(l));
  const toolUses = events
    .filter((e) => e.type === "assistant")
    .flatMap((e) => e.message.content.filter((c) => c.type === "tool_use"));
  const result = events.find((e) => e.type === "result");
  return { toolUses, result };
}

const READ_TOOLS = "Skill Read Glob Grep Bash(ls:*) Bash(cat:*) Bash(grep:*) Bash(find:*) Bash(head:*) Bash(wc:*)";
const WRITE_TOOLS = `${READ_TOOLS} Edit Write Bash(npm run:*) Bash(npx tsc:*) Bash(git diff:*) Bash(git status:*)`;

const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });

console.log("phase 1: scan…");
const scan = claude([prompt], READ_TOOLS);
const menu = scan.result.result ?? "";

check(
  "skill triggered on its own",
  scan.toolUses.some((t) => t.name === "Skill" && t.input?.skill === "wow-moments"),
);
check("no files changed during the scan", sh("git", ["status", "--porcelain"]).trim() === "");
check("menu has recommended candidates (★)", /\b[A-Z]\d+\s*★/.test(menu));
check("menu lists rejected ideas", /not recommended/i.test(menu));
check("menu asks the user to pick", /reply with|pick/i.test(menu));

// Budget: at most one hero per screen. Candidate IDs share the screen's
// letter (A1, A2 … on screen A), so heroes are counted per letter.
const heroes = {};
for (const line of menu.split("\n")) {
  const id = line.match(/\b([A-Z])\d+\b/);
  if (id && /\|\s*hero\s*\||\btier:?\**\s*hero\b/i.test(line)) heroes[id[1]] = (heroes[id[1]] ?? 0) + 1;
}
const overBudget = Object.entries(heroes).filter(([, n]) => n > 1);
check("at most one hero per screen", overBudget.length === 0, overBudget.map(([s, n]) => `${s}: ${n}`).join(", "));

// Every `path:line` the menu cites must exist and be within the file. The
// skill asks for full paths; a bare file name that matches exactly one
// tracked file is tolerated but reported, anything else fails.
const tracked = sh("git", ["ls-files"]).trim().split("\n");
const cites = [...menu.matchAll(/`([\w.\/\[\]-]+\.(?:tsx?|jsx?|css|vue)):(\d+)(?:[-–](\d+))?`/g)];
const shortCites = [];
const badCites = cites.filter(([cite, file, from, to]) => {
  let path = file;
  if (!tracked.includes(file)) {
    const matches = tracked.filter((t) => t.endsWith(`/${file}`));
    if (matches.length !== 1) return true;
    path = matches[0];
    shortCites.push(cite);
  }
  const lines = readFileSync(join(work, path), "utf8").split("\n").length;
  return Number(to ?? from) > lines;
});
check(
  "cited file:line locations exist",
  cites.length > 0 && badCites.length === 0,
  [badCites.length && `bad: ${badCites.map((c) => c[0]).join(", ")}`, shortCites.length && `short paths: ${shortCites.join(", ")}`, `${cites.length} cited`]
    .filter(Boolean)
    .join("; "),
);

let build;
if (pick) {
  console.log(`phase 2: implement ${pick}…`);
  const before = readFileSync(join(work, "package.json"), "utf8");
  const impl = claude([pick, "--resume", scan.result.session_id], WRITE_TOOLS);
  const diff = sh("git", ["diff"]) + sh("git", ["ls-files", "--others", "--exclude-standard"]);

  check("files changed", diff.trim() !== "");
  check("no new dependencies", readFileSync(join(work, "package.json"), "utf8") === before);
  check("reduced-motion handled in the diff", /prefers-reduced-motion|motion-safe|motion-reduce|useReducedMotion|reducedMotion/.test(diff));
  // An animation that holds a transform or filter after it ends traps
  // position:fixed descendants; the skill asks for "backwards".
  const bothFill = diff.split("\n").filter((l) => l.startsWith("+") && /\banimation\b[^;]*\bboth\b/.test(l));
  check("no animation-fill-mode: both", bothFill.length === 0, bothFill.join(" | "));

  build = spawnSync("npm", ["run", "build"], { cwd: work, encoding: "utf8" });
  check("app still builds", build.status === 0, build.status === 0 ? "" : build.stdout.slice(-800));
  checks.cost = (scan.result.total_cost_usd ?? 0) + (impl.result.total_cost_usd ?? 0);
  checks.implementReport = impl.result.result ?? "";
} else {
  checks.cost = scan.result.total_cost_usd ?? 0;
}
// Outputs land next to the harness (git-ignored) so they survive the cleanup.
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = join(HERE, ".results", `${fixture}-${stamp}`);
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "menu.md"), menu);

// --- report ----------------------------------------------------------------
console.log("");
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
if (checks.implementReport) writeFileSync(join(out, "implement-report.md"), checks.implementReport);
writeFileSync(join(out, "checks.json"), JSON.stringify({ fixture, pick, cost: checks.cost, checks }, null, 2));
console.log(`\ncost: $${checks.cost.toFixed(2)}   results: ${out}`);
const failed = checks.filter((c) => !c.ok).length;
if (!keep && failed === 0) rmSync(work, { recursive: true, force: true });
else console.log(`workspace kept: ${work}`);
process.exit(failed ? 1 : 0);
