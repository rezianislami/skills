#!/usr/bin/env node
// Checks a running page against the wow-moments guardrails that are easy to
// get wrong and hard to see by eye:
//
//   1. first paint without JavaScript: nothing visible is stuck hidden
//   2. reduced motion: no transform/opacity/filter animation still runs
//   3. layout shift: CLS while the page loads and the moment plays
//   4. leftovers: no transform/filter left on the trigger's ancestors afterwards
//
// Usage (the app must already be running):
//   node <skill>/scripts/verify.mjs http://localhost:3000/ [--click "<selector>"] [--fill "<selector>=<text>"]
//
// --fill runs before --click, so a form moment can be triggered:
//   --fill "input[type=email]=me@example.com" --click "form button"
//
// Needs Playwright with a Chromium build. It is resolved from the project you
// run it in (or globally); it is never installed by this script.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:\/\//.test(a));
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const click = opt("--click");
const fill = opt("--fill");
if (!url) {
  console.error('usage: verify.mjs <url> [--fill "<selector>=<text>"] [--click "<selector>"]');
  process.exit(2);
}

function loadPlaywright() {
  const roots = [process.cwd()];
  try {
    roots.push(execSync("npm root -g", { encoding: "utf8" }).trim());
  } catch {}
  for (const root of roots) {
    for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
      try {
        return createRequire(join(root, "noop.js"))(name);
      } catch {}
    }
  }
  console.error(
    "Playwright isn't available in this project or globally.\n" +
      "Ask the user before adding it, e.g. `npm i -D playwright && npx playwright install chromium`,\n" +
      "or verify the same four points by hand in DevTools.",
  );
  process.exit(3);
}

const { chromium } = loadPlaywright();
// Playwright's own Chromium build first; if it was never downloaded
// (`npx playwright install` skipped, or blocked by the network), fall back to
// an installed Google Chrome rather than failing.
let browser;
try {
  browser = await chromium.launch();
} catch {
  try {
    browser = await chromium.launch({ channel: "chrome" });
  } catch {
    console.error("No browser for Playwright: run `npx playwright install chromium`, or install Google Chrome.");
    process.exit(3);
  }
}
const results = [];
const report = (ok, name, detail) => results.push({ ok, name, detail });

async function trigger(page) {
  if (fill) {
    // Split on the last "=": attribute selectors like input[type=email] contain
    // one, typed text rarely does.
    const at = fill.lastIndexOf("=");
    await page.fill(fill.slice(0, at), fill.slice(at + 1));
  }
  if (click) await page.click(click);
}

// 1. No-JS first paint ------------------------------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  // Let first-paint CSS animations finish; with "backwards" fill they end visible.
  await page.waitForTimeout(1500);
  const hidden = await page.evaluate(() => {
    const out = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.top > innerHeight) continue;
      if (!el.textContent?.trim() || el.children.length > 3) continue;
      // opacity isn't inherited, so the element's own computed style misses a
      // hidden wrapper; checkVisibility also looks at every ancestor.
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) out.push(el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""));
    }
    return out.slice(0, 5);
  });
  report(hidden.length === 0, "first paint without JS shows content", hidden.length ? `hidden: ${hidden.join(", ")}` : "");
  await ctx.close();
}

// 2. Reduced motion ---------------------------------------------------------
{
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const running = () =>
    page.evaluate(() =>
      document
      .getAnimations()
      .filter((a) => a.playState === "running" && Number(a.effect?.getTiming().duration) > 0)
      // Infinite loops (skeleton shimmer, spinners) are judged by their own CSS
      // guard; this check is about one-shot moments.
      .filter((a) => a.effect?.getTiming().iterations !== Infinity)
      .filter((a) =>
        (a.effect?.getKeyframes() ?? []).some((k) => "transform" in k || "translate" in k || "scale" in k || "filter" in k),
      )
      .map((a) => a.animationName || a.transitionProperty || "script animation"),
    );
  // Sampled at three points: an entrance that plays on load is usually over
  // by networkidle (500 ms with no requests), so one sample after the trigger
  // would never see it.
  const moving = new Set();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  for (const name of await running()) moving.add(name);
  await page.waitForLoadState("load");
  for (const name of await running()) moving.add(name);
  await page.waitForLoadState("networkidle");
  await trigger(page);
  await page.waitForTimeout(100);
  for (const name of await running()) moving.add(name);
  report(moving.size === 0, "reduced motion stops movement", [...moving].join(", "));
  await ctx.close();
}

// 3 + 4. Layout shift and leftovers -----------------------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__cls = 0;
    // hadRecentInput is not filtered out, unlike real CLS: it marks every shift
    // in the 500 ms after a click, which is exactly when a --click moment plays.
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await trigger(page);
  await page.waitForTimeout(1500);
  const cls = await page.evaluate(() => window.__cls);
  report(cls < 0.1, "layout shift (CLS) under 0.1", `CLS ${cls.toFixed(3)}${cls >= 0.02 && cls < 0.1 ? " (noticeable, check it)" : ""}`);

  const leftovers = await page.evaluate(() => {
    const out = [];
    for (const el of document.body.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      // A finished animation that still fills ("forwards"/"both") is still
      // returned by getAnimations(); that is exactly the leftover we're after,
      // so only animations that are actually running excuse the transform.
      const running = el.getAnimations().some((a) => a.playState === "running");
      const held = (s.transform !== "none" || s.filter !== "none") && !running;
      // Only a problem when something fixed lives inside: the ancestor becomes
      // its containing block, and the fixed element stops being fixed.
      if (held && [...el.querySelectorAll("*")].some((d) => getComputedStyle(d).position === "fixed")) {
        out.push(el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""));
      }
    }
    return out.slice(0, 5);
  });
  report(leftovers.length === 0, "no transform/filter traps fixed elements", leftovers.join(", "));
  await ctx.close();
}

await browser.close();

for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
