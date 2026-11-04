// Runs skills/wow-moments/scripts/verify.mjs against tiny pages that each hide
// one guardrail bug, and checks the script reports it. A real browser run is
// the point: the checks rely on how Chromium computes styles, animations and
// layout shifts, which a mock would not reproduce.
//
// Usage: cd tools && node --test   (needs `npx playwright install chromium`)

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const TOOLS = dirname(fileURLToPath(import.meta.url));
const VERIFY = join(TOOLS, "..", "skills/wow-moments/scripts/verify.mjs");

const PAGES = {
  "/form": `<form onsubmit="event.preventDefault()"><input type="email"><button>Join</button></form>`,
  // Four children, so the wrapper itself is skipped; each child's own opacity is 1.
  "/hidden-wrapper": `<section style="opacity:0"><h1>Title</h1><p>One</p><p>Two</p><p>Three</p></section>`,
  // The click pushes a 400px block down 300px straight away; it has to be that
  // big for the shift to clear the 0.1 threshold in a 1280x720 viewport.
  "/shift-on-click": `<button onclick="document.getElementById('gap').style.height='300px'">Open</button>
    <div id="gap"></div><p style="height:400px">Text below that moves</p>`,
  // No reduced-motion guard; 300ms is over well before networkidle.
  "/entrance": `<style>@keyframes rise{from{transform:translateY(20px)}} h1{animation:rise 300ms}</style><h1>Hello</h1>`,
};

let server;
let base;
before(async () => {
  server = createServer((req, res) => {
    const body = PAGES[req.url];
    res.writeHead(body ? 200 : 404, { "content-type": "text/html" });
    res.end(body ? `<!doctype html><html><body>${body}</body></html>` : "");
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

// Async on purpose: execFileSync would block this process, and with it the
// server the script is loading pages from. cwd is tools/ so the script
// resolves Playwright from tools/node_modules.
const verify = (path, ...flags) =>
  new Promise((done) =>
    execFile(process.execPath, [VERIFY, base + path, ...flags], { cwd: TOOLS }, (err, stdout, stderr) =>
      done({ code: err ? err.code : 0, out: stdout + stderr }),
    ),
  );

test("--fill accepts a selector that contains '='", async () => {
  const { code, out } = await verify("/form", "--fill", "input[type=email]=me@example.com", "--click", "form button");
  assert.equal(code, 0, out);
});

test("a hidden wrapper fails first paint without JS", async () => {
  const { out } = await verify("/hidden-wrapper");
  assert.match(out, /✗ first paint without JS/, out);
});

test("a shift right after the click counts toward CLS", async () => {
  const { out } = await verify("/shift-on-click", "--click", "button");
  assert.match(out, /✗ layout shift/, out);
});

test("an unguarded entrance on load fails reduced motion", async () => {
  const { out } = await verify("/entrance");
  assert.match(out, /✗ reduced motion/, out);
});
