# Changelog

All notable changes to wow-moments. The version lives in `metadata.version` in [SKILL.md](SKILL.md). Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **NOT VERIFIED** final verdict, for a build that passed but whose guardrail checks couldn't run (no Playwright, no browser). Each moment now gets exactly one of four labels: PASS, PASS checked by hand, FAIL, NOT VERIFIED. Before this, an agent without a browser had to invent its own wording.

### Changed
- The eval accepts the new label and still rejects made-up ones. Its cost note uses the measured $3.81 for a full `--pick` run.

## [0.4.0] - 2026-11-04

### Added
- **Interaction tier:** six non-motion moment types (optimistic UI, undo instead of confirm, keyboard flow, an empty state that starts the work, remembered state, fewer steps), with scoring, a per-screen cap of two, anti-slop entries and guardrails 12-15 (rollback, nothing lost on undo, shortcuts never fire while typing, a failure-path test).
- Three typechecked patterns with Vue versions: [optimistic update](references/pattern-optimistic-update.md), [undo instead of confirm](references/pattern-undo-remove.md), [keyboard shortcut](references/pattern-keyboard-shortcut.md).
- **Phase 4, verdict:** the picks are judged as a set (GO / GO with a note / SWAP) with a storyboard, plus a self-contained HTML preview on request. See [verdict-and-preview.md](references/verdict-and-preview.md).
- **Quiet-down:** the menu can list up to five existing generic animations to remove or soften. They're only touched if picked.

### Changed
- Build moves to Phase 5 and ends with a PASS/FAIL verdict per moment.
- The eval checks that the skill stops at the verdict without changing files, judges every pick, then builds on `go`.
- The README GIF is re-recorded on a Rezi UI signup form.

### Fixed
- Scoring examples that didn't match the formula (12 → 10).

## [0.3.0] - 2026-11-02

### Added
- **Vue / Nuxt** support: [implementation-vue.md](references/implementation-vue.md), with Vue versions of the core patterns checked in a browser on Vue 3.5.
- **Run memory:** a `.wow-moments.md` ledger of the motion language, built moments and declined ones. See [run-memory.md](references/run-memory.md).
- [`scripts/verify.mjs`](scripts/verify.mjs): a Playwright check for no-JS first paint, reduced motion, CLS and leftover transforms, with a system Chrome fallback.
- Patterns: [streaming answer](references/pattern-streaming-text.md) and [route transition](references/pattern-route-transition.md), verified on Next 16.4 / React 19.3, reduced motion included.
- An end-to-end eval with a real headless agent session, plus CI (`tools/` and GitHub Actions) for the free checks on every push.

### Changed
- The menu must cite full paths from the project root.

### Fixed (2026-11-04, no version bump)
- `verify.mjs --fill` split on the first `=`, so `input[type=email]=…` broke. It now splits on the last `=`.
- The no-JS check read each element's own opacity, which isn't inherited, so content inside a hidden wrapper passed. It now uses `checkVisibility`.
- CLS dropped shifts flagged `hadRecentInput`, which hid everything in the 500 ms after `--click`. They're counted now.
- The reduced-motion check sampled only after `networkidle`, when load-time entrances are already over. It also samples at `domcontentloaded` and `load` now.
- The eval diff only showed the names of new files, so its content checks never saw them.
- Each fix has a browser test in `tools/verify.test.mjs`.

## [0.2.0] - 2026-11-02

### Added
- Patterns for the moments agents kept improvising during evaluation: [success check](references/pattern-success-check.md), [error feedback](references/pattern-error-feedback.md), [list enter](references/pattern-list-enter.md), [skeleton reveal](references/pattern-skeleton-reveal.md).
- A motion-free `landing-page` fixture and `landing-page-after` (the same page after one run with A1 + A2 picked), plus a before/after demo GIF.

### Changed
- Rewrote the collection and skill READMEs.

## [0.1.0] - 2026-11-02

### Added
- First release. Scans a built React / Next.js frontend for moments that deserve motion, presents a scored menu with a per-screen budget, and builds only the picked moments with reduced-motion, first-paint and accessibility guardrails.
- Six patterns: scroll reveal, theme sweep, count-up, cursor preview, sliding indicator, rolling text.
- A motion-free Next.js fixture (`sample-next-app`) for evaluation.
