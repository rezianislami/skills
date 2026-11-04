<div align="center">

# skills

**Agent skills for interfaces that feel designed, not generated.**

[![check](https://github.com/rezianislami/skills/actions/workflows/check.yml/badge.svg)](https://github.com/rezianislami/skills/actions/workflows/check.yml)
[![wow-moments](https://img.shields.io/badge/wow--moments-v0.4.0-0063d7?style=flat-square)](skills/wow-moments)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-555?style=flat-square)](https://agentskills.io/specification)
[![MIT license](https://img.shields.io/badge/license-MIT-f4c430?style=flat-square)](LICENSE)

[Install](#install) · [Skills](#skills) · [FAQ](#faq) · [Roadmap](#roadmap) · [Contributors](#contributors)

<code>npx skills add rezianislami/skills</code>

</div>

<p align="center">
  <img src="assets/wow-moments-demo.gif" alt="Side by side: a plain landing page, and the same page after wow-moments added a hero entrance and an animated signup confirmation" width="100%">
</p>

Built for Claude Code, Codex and any agent that reads the open [Agent Skills](https://agentskills.io/specification) format. Each skill is opinionated, small enough to read in one sitting, and tested on a real app before it ships.

## Install

```bash
# pick from the list
npx skills add rezianislami/skills

# or just one
npx skills add rezianislami/skills --skill wow-moments
```

No CLI? Copy a folder from [`skills/`](skills) into your agent's skills folder:

| Agent | This project | Every project |
|---|---|---|
| Claude Code | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` |
| Codex | `.agents/skills/<name>/` | `~/.agents/skills/<name>/` |

## Skills

### [wow-moments](skills/wow-moments)

> Your UI works. Now find the three moments worth animating, not the thirty.

Scans a built React / Next.js or Vue / Nuxt frontend, hand-written or vibe-coded, for the moments that *mean* something: a first success, an empty list getting its first item, results arriving, a theme switch. It also finds non-motion wins (a write that answers instantly, undo instead of "Are you sure?", keyboard shortcuts) and generic animations worth quieting down. It ranks them, caps them per screen, and hands you a menu. You pick, it gives a verdict and a storyboard (a live preview if you ask), and after you confirm it builds only those, with reduced-motion, no-JS, accessibility and failure-path guardrails, and reports PASS/FAIL per moment.

```text
You:    The page is done. Find wow moments in it.

Agent:  A1 ★  Signup succeeds: a check mark draws, the confirmation settles in place    hero        11
        A2 ★  Hero entrance: headline, subline, form fade in from a slight blur          transition   9
        A3    Invalid email: the input shakes once, the error changes in place           micro        8
        …     Reply with IDs.

You:    A1, A2

Agent:  A1 GO · A2 GO, with a note (second motion on the same form; keep it short)
        storyboards for both … reply `go`, or `preview A1`

You:    go

Agent:  builds both, typechecks, builds, runs verify.mjs → A1 PASS · A2 PASS
```

Abridged from a real run on the [`landing-page`](examples/wow-moments/landing-page) fixture; the GIF above shows the result.

12 worked patterns · React and Vue · remembers your motion language between runs · a guardrail checker · evaluated end to end with a real agent

**[Read the full wow-moments guide →](skills/wow-moments)**

## FAQ

**Will it change my code without asking?**
No. The scan ends with a menu and the agent stops there. Nothing is edited until you reply with the IDs you want, and then only the files those moments need.

**Will it add dependencies?**
Not without asking. It uses what your project already has: plain CSS, Tailwind, Motion, Vue's `<Transition>`, or View Transitions.

**Which frameworks does it support?**
React / Next.js (App Router and Pages Router) and Vue / Nuxt. The patterns' reasoning and CSS are framework-agnostic; the component code is written for React, with Vue versions in [`implementation-vue.md`](skills/wow-moments/references/implementation-vue.md).

**Which agents?**
Any agent that loads Agent Skills. It's developed and evaluated with Claude Code; Codex reads the same format from `.agents/skills/`.

**How much does a run cost?**
It depends on the size of the app and the model. On the `landing-page` fixture with Claude Code, a scan used about $0.60 of tokens, and a scan plus building two moments about $1.90.

**How is this different from a motion audit?**
An audit polishes the motion you already have, component by component. wow-moments looks for the places that deserve motion and don't have it yet, judged by what the moment means to the user, and deliberately proposes only a few.

**Does it remember my choices?**
Yes. A small `.wow-moments.md` in your project records the motion language, what was built and what you declined, so the next run stays consistent and doesn't pitch rejected ideas again. Delete the file to start fresh.

## Repository layout

```
skills/<name>/      the skill itself: SKILL.md, references/, README.md
examples/<name>/    test fixtures (not installed with the skill)
evals/<name>/       end-to-end agent evals (run by hand, cost tokens)
tools/              CI checks: skill format, links, typechecked code blocks, browser tests for skill scripts
assets/             images for these READMEs
```

## Roadmap

- [ ] A Nuxt fixture, so the Vue patterns are evaluated end to end with SSR, like the React ones
- [ ] A fixture with interaction opportunities (a confirm-to-delete, a slow toggle, filters that reset), so the interaction tier is evaluated end to end
- [ ] Svelte / SvelteKit implementation guide
- [ ] Public release on [skills.sh](https://skills.sh)
- [ ] More skills in this collection

## Contributors

Built by [Rezian Al Islami](https://github.com/rezianislami), with [Claude Code](https://claude.ai/claude-code).

Found a moment type the skill misses, a pattern that breaks in your stack, or a bug? Open an [issue](https://github.com/rezianislami/skills/issues).

<!-- When the repo is public, add the contributor grid:
<a href="https://github.com/rezianislami/skills/graphs/contributors"><img src="https://contrib.rocks/image?repo=rezianislami/skills" alt="Contributors" /></a>
-->

## License

[MIT](LICENSE)
