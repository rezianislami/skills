// Typechecks every code block in every skill, so a pattern can't ship code
// that doesn't compile. Blocks fenced as ```tsx / ```ts go through tsc against
// React and Motion; ```vue blocks go through vue-tsc. A deliberate fragment
// (a JSX excerpt, a usage line) opts out with an extra word on the fence:
// ```tsx nocheck
//
// Usage: node tools/check-snippets.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(TOOLS, "..");
const OUT = join(TOOLS, ".snippets");

const FENCE = /^```(tsx|ts|vue)( +[^\n]*)?\n([\s\S]*?)^```$/gm;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "react"), { recursive: true });
mkdirSync(join(OUT, "vue"), { recursive: true });

let count = { react: 0, vue: 0, skipped: 0 };
for (const skill of readdirSync(join(ROOT, "skills"))) {
  const dir = join(ROOT, "skills", skill);
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir, { recursive: true })
    .map((p) => join(dir, String(p)))
    .filter((p) => p.endsWith(".md"));

  for (const file of files) {
    let n = 0;
    for (const [, lang, info, code] of readFileSync(file, "utf8").matchAll(FENCE)) {
      n++;
      if (info && /\bnocheck\b/.test(info)) {
        count.skipped++;
        continue;
      }
      const target = lang === "vue" ? "vue" : "react";
      // Each block is its own module: the name keeps skill, file and block
      // index so a compiler error points straight back to the markdown.
      const name = `${skill}__${basename(file, ".md")}__${n}.${lang}`;
      writeFileSync(join(OUT, target, name), code);
      count[target]++;
    }
  }
}

const base = {
  target: "ES2022",
  lib: ["dom", "dom.iterable", "esnext"],
  strict: true,
  noEmit: true,
  module: "esnext",
  moduleResolution: "bundler",
  skipLibCheck: true,
  isolatedModules: true,
  // Snippets resolve packages from tools/node_modules.
  baseUrl: ".",
  typeRoots: [join(TOOLS, "node_modules/@types")],
};

writeFileSync(
  join(OUT, "react", "tsconfig.json"),
  JSON.stringify({ compilerOptions: { ...base, jsx: "react-jsx", types: ["react", "react-dom"] }, include: ["*.ts", "*.tsx"] }),
);
writeFileSync(
  join(OUT, "vue", "tsconfig.json"),
  JSON.stringify({ compilerOptions: { ...base, jsx: "preserve", types: [] }, include: ["*.vue"] }),
);

const bin = (name) => join(TOOLS, "node_modules", ".bin", name);
let failed = false;
const run = (label, cmd, project, n) => {
  if (!n) return;
  try {
    execFileSync(cmd, ["-p", project], { stdio: "inherit", cwd: TOOLS });
    console.log(`✓ ${label}: ${n} blocks typecheck`);
  } catch {
    failed = true;
    console.error(`✗ ${label}: type errors above (files in tools/.snippets/)`);
  }
};

run("react", bin("tsc"), join(OUT, "react", "tsconfig.json"), count.react);
run("vue", bin("vue-tsc"), join(OUT, "vue", "tsconfig.json"), count.vue);
console.log(`  (${count.skipped} blocks marked nocheck)`);
process.exit(failed ? 1 : 0);
