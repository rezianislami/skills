# Contributing

Thanks for helping. Bug reports, missed moment types and patterns that break in your stack are all welcome as [issues](https://github.com/rezianislami/skills/issues). This page is for changes to the skills themselves.

## How a skill is laid out

Every skill follows the open [Agent Skills](https://agentskills.io/specification) format, so any agent that reads it can load it. Only the folder under `skills/` gets installed; everything else in the repo exists to test it.

```
skills/<name>/
├── SKILL.md         for the agent: frontmatter + the workflow. Read first, every run
├── README.md        for people: what it does, install, examples
├── CHANGELOG.md     one entry per version
├── references/      for the agent, loaded on demand from SKILL.md
└── scripts/         executables the skill runs (optional)

examples/<name>/     fixtures: small apps to run the skill on (not installed)
evals/<name>/        end-to-end agent evals (not installed, cost tokens)
```

Keep `SKILL.md` short and push detail into `references/`. The agent reads `SKILL.md` on every run but opens a reference only when a phase needs it, so detail in `SKILL.md` costs context on every run, needed or not.

## Rules CI enforces

`tools/check-skills.mjs` and `tools/check-snippets.mjs` run on every push and pull request (`.github/workflows/check.yml`). Don't merge a pull request with a red check.

### Frontmatter

`SKILL.md` must open with a YAML block:

```yaml
---
name: wow-moments          # lowercase letters, digits, single hyphens; max 64; must equal the folder name
description: Finds ...     # required, max 1024 chars; say what it does AND when to use it
license: MIT
metadata:
  version: "0.4.0"         # metadata values must be strings, so quote numbers
---
```

The `description` is how an agent decides whether to load the skill, so put the trigger phrases users actually say in it, and say what it is *not* for. `compatibility`, if present, is capped at 500 chars.

### Size and links

- `SKILL.md` stays under 500 lines.
- Every relative link in any `.md` under `skills/<name>/` must resolve. Renaming a reference means updating every file that links to it.

### Code blocks typecheck

Every ` ```tsx ` and ` ```ts ` block in a skill is compiled with `tsc` against React and Motion, and every ` ```vue ` block with `vue-tsc`. A deliberate fragment (a JSX excerpt, a one-line usage) opts out with a word after the language:

````markdown
```tsx nocheck
<SuccessCheck show={done} />
```
````

Use `nocheck` only for fragments. A complete component that doesn't compile is a bug in the skill.

### Fixtures stay motion-free

CI fails if `examples/wow-moments/landing-page` or `sample-next-app` contain `@keyframes`, `animation` or `transition`. They're useful only while there's nothing to find in them yet.

## Before you open a pull request

```bash
cd tools && npm ci
node check-skills.mjs
node check-snippets.mjs
npx playwright install chromium && npm test    # only if you touched a script
```

Then:

1. **Try it on a real app.** Run the skill on a fixture (or your own app) with an agent and check it does what the README says. For wow-moments, the eval does this end to end: `node evals/wow-moments/run.mjs landing-page`. It costs tokens, so run it before a release, not on every commit.
2. **Bump the version** in `metadata.version` for any change to how the skill behaves, and add an entry to the skill's `CHANGELOG.md`. Typo and docs-only fixes don't need a bump.
3. **Update the READMEs**: the skill's own, and the version badge and summary in the root [README](README.md) if they changed.
4. **Branch from `main` and open a pull request** instead of pushing to `main`, so CI runs before the change lands.

## Adding a pattern to wow-moments

A pattern is one file, `skills/wow-moments/references/pattern-<name>.md`. Copy the shape of an existing one, e.g. [pattern-success-check.md](skills/wow-moments/references/pattern-success-check.md):

- `**Moment:**` the state change it's for, and its tier (hero, transition, micro or interaction).
- `## Why this shape`: why it's built that way, including the alternative you rejected.
- `## Component`: code that typechecks, with the reduced-motion path and the no-JS first paint handled.
- `## Variants` and `## Gotchas` where they apply.
- A Vue version in [implementation-vue.md](skills/wow-moments/references/implementation-vue.md) when the React one depends on React-specific APIs.

Then link it from the reference map in `SKILL.md` and from [moment-taxonomy.md](skills/wow-moments/references/moment-taxonomy.md), and add a row to "Patterns included" in the skill's README.

## Adding a new skill

1. Create `skills/<name>/` with `SKILL.md` and `README.md` as above.
2. Add a fixture under `examples/<name>/` that has something real for the skill to do.
3. Add a section for it under [Skills](README.md#skills) in the root README.
4. If the skill has typechecked code in a language `check-snippets.mjs` doesn't know yet, extend the tool in the same pull request.

## Writing style

- **SKILL.md and references** speak to the agent: short imperatives, the reason next to the rule, concrete code signals over vague advice.
- **READMEs** speak to people: what it does, a real example, how to install it. Show output from real runs, never invented output.
- Plain English, no hype. If a claim can be measured, give the measured number.
