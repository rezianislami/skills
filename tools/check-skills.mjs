// Validates every skill against the Agent Skills format and checks that every
// relative link inside a skill resolves, so a renamed reference file can't
// silently leave SKILL.md pointing at nothing.
//
// Usage: node tools/check-skills.mjs   (from the repo root or anywhere)

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");

// Limits from the Agent Skills specification (agentskills.io/specification).
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
const MAX_COMPATIBILITY = 500;
const MAX_SKILL_LINES = 500;

const errors = [];
const fail = (skill, message) => errors.push(`${skill}: ${message}`);

function frontmatter(text) {
  // The file must open with a YAML block delimited by lines that are exactly "---".
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  return match ? parseYaml(match[1]) : null;
}

function markdownFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .map((p) => join(dir, String(p)))
    .filter((p) => p.endsWith(".md") && statSync(p).isFile());
}

// Relative link targets only: external URLs, mailto and pure #anchors are skipped.
function relativeLinks(text) {
  const links = [];
  // Fenced blocks and inline code spans are removed first: an expression like
  // rows[0](x) has the same "](" shape as a link and isn't one.
  const prose = text.replace(/^```[\s\S]*?^```$/gm, "").replace(/`[^`\n]*`/g, "");
  for (const [, target] of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^[a-z]+:/i.test(target) || target.startsWith("#")) continue;
    links.push(target.split("#")[0]);
  }
  return links;
}

for (const name of readdirSync(SKILLS)) {
  const dir = join(SKILLS, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) {
    fail(name, "missing SKILL.md");
    continue;
  }

  const text = readFileSync(file, "utf8");
  let meta;
  try {
    meta = frontmatter(text);
  } catch (e) {
    fail(name, `frontmatter is not valid YAML: ${e.message}`);
    continue;
  }
  if (!meta) {
    fail(name, "SKILL.md has no frontmatter block");
    continue;
  }

  if (typeof meta.name !== "string" || !NAME.test(meta.name) || meta.name.length > MAX_NAME) {
    fail(name, `name must be lowercase letters, digits and single hyphens, max ${MAX_NAME} chars`);
  }
  if (meta.name !== name) fail(name, `name "${meta.name}" must match the folder name`);
  if (typeof meta.description !== "string" || !meta.description.trim()) {
    fail(name, "description is required");
  } else if (meta.description.length > MAX_DESCRIPTION) {
    fail(name, `description is ${meta.description.length} chars (max ${MAX_DESCRIPTION})`);
  }
  if (meta.compatibility !== undefined && String(meta.compatibility).length > MAX_COMPATIBILITY) {
    fail(name, `compatibility is over ${MAX_COMPATIBILITY} chars`);
  }
  if (meta.metadata !== undefined) {
    const bad = Object.entries(meta.metadata ?? {}).filter(([, v]) => typeof v !== "string");
    if (bad.length) fail(name, `metadata values must be strings (quote them): ${bad.map(([k]) => k).join(", ")}`);
  }

  const lines = text.split("\n").length;
  if (lines > MAX_SKILL_LINES) fail(name, `SKILL.md has ${lines} lines (keep it under ${MAX_SKILL_LINES})`);

  for (const md of markdownFiles(dir)) {
    for (const target of relativeLinks(readFileSync(md, "utf8"))) {
      if (!target) continue;
      if (!existsSync(resolve(dirname(md), target))) {
        fail(name, `${md.slice(dir.length + 1)} links to missing ${target}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ all skills valid");
