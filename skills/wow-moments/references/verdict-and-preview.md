# Verdict and preview

Between the pick and the build, the user gets one short look at what they chose as a set: what fits, what clashes, and what each moment will feel like. It costs one reply and saves building something they'd undo. The build itself ends with a second, final verdict based on what was actually checked.

## Verdict on the picks (Phase 4)

One line per pick, then a storyboard. Judge the picks *together*: two heroes on one screen, two moments with the same visual, or a quiet-down that removes motion a pick relies on only show up as a set.

| Verdict | When |
|---|---|
| **GO** | Fits the budget and the guardrails as described in the menu. |
| **GO, with a note** | Buildable, but something changes: over budget, a clash with another pick, a risk the menu understated, a test the project can't run. Say what, in one line. |
| **SWAP** | Don't build it as picked; offer the alternative. For example "B1 and B3 are both count-ups on the dashboard; keep B1, make B3 a static number", or an optimistic update on a payment, which should wait for the server. |

```markdown
## Verdict

| Pick | Verdict | Note |
|---|---|---|
| A1 | GO | |
| A2 | GO, with a note | No test runner in the project; rollback checked by hand |
| B3 | SWAP | Second count-up on the dashboard; suggest a static number |

**A1: storyboard**
- 0ms: form submits, button keeps its width, shows a spinner
- 400ms: confirmation settles in from 8px below with a 4px blur
- 520ms: check mark starts drawing (400ms)
- Reduced motion: confirmation appears in place, check static

**A2: storyboard**
- 0ms: box checks at once, save request goes out
- on failure: box unchecks, "Couldn't save, it's back to how it was" appears under the row

---
Reply `go` to build, `preview A1` to see one first, or change the picks.
```

Rules:

- A storyboard is two to five lines of time-stamped frames, using the timings the build will use. Interaction picks describe the success and the failure path instead of frames.
- If every verdict is **GO** and the user's pick already said to build ("A1, A2, build them"), skip the stop and build. Otherwise end the turn here.
- **SWAP** is a recommendation. If the user insists, build what they asked for and say the risk once.

## Preview on request

Only when the user asks (`preview A1`). Never for every pick by default; a preview costs about as much as a small component.

- One self-contained HTML file per moment at `.wow-moments-preview/<ID>.html` in the project root, outside the app's source. No build step, no project imports, and no network requests other than fonts the app already loads.
- Mock only the element the moment lives on, using the project's real copy, colours and font (read them from the CSS or theme). Don't rebuild the page.
- Use the same CSS and timings the build will use, taken from the pattern, so the preview is a promise, not an approximation.
- Add a **Replay** button and a **Reduced motion** checkbox that toggles a class applying the reduced-motion path. Interaction previews get a **Make it fail** checkbox instead, so the failure path can be clicked through.
- Tell the user the path and how to open it. Mention that the folder is disposable and can go into `.gitignore`. Don't edit `.gitignore` without asking.

## Final verdict (Phase 5)

After building, one line per moment, based only on what was actually run:

```markdown
| Moment | Verdict | Evidence |
|---|---|---|
| A1 | PASS | build ✓, verify.mjs 4/4 ✓, looked at it with reduced motion |
| A2 | PASS, checked by hand | build ✓; no test runner, rollback checked by blocking the request |
| B1 | FAIL | CLS 0.14: the number's width changes; fixed width next |
| C2 | NOT VERIFIED | build ✓; no Playwright and no browser here, so reduced motion, first paint and layout shift were not run |
```

Use exactly these four labels, so every run reports the same way:

- **PASS** only when the typecheck/build passed and the guardrail checks for that moment ran and passed.
- **PASS, checked by hand** when part of the evidence is a manual check. Say which part.
- **FAIL** with the failing check and the next step. Don't report a FAIL as done.
- **NOT VERIFIED** when the build passed but the guardrail checks couldn't run at all, neither `verify.mjs` nor by hand (no Playwright, no browser tool). List what wasn't run and how the user can check it. It is not a pass.
- A check that didn't run is listed as not run, never as passed.
