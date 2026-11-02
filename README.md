# skills

**Agent skills for interfaces that feel designed, not generated.**

Built for Claude Code, Codex and any agent that reads the open [Agent Skills](https://agentskills.io/specification) format. Each skill is opinionated, small enough to read in one sitting, and tested on a real app before it ships.

<p align="center">
  <img src="assets/wow-moments-demo.gif" alt="Side by side: a plain landing page, and the same page after wow-moments added a hero entrance and an animated signup confirmation" width="100%">
</p>

## Install

```bash
# pick from the list
npx skills add rezianislami/skills

# or just one
npx skills add rezianislami/skills --skill wow-moments
```

No CLI? Copy a folder from [`skills/`](skills) into `~/.claude/skills/` (Claude Code) or `~/.agents/skills/` (Codex).

## Skills

### [wow-moments](skills/wow-moments)

> Your UI works. Now find the three moments worth animating, not the thirty.

Scans a built React / Next.js frontend for the moments that *mean* something: a first success, an empty list getting its first item, results arriving, a theme switch. It ranks them, caps them per screen, and hands you a menu. You pick; it builds only those, with reduced-motion, no-JS and accessibility guardrails, then verifies the result.

```text
You:    The page is done. Find wow moments in it.

Agent:  A1 ★  Signup succeeds: a check mark draws, the confirmation settles in place    hero        11
        A2 ★  Hero entrance: headline, subline, form fade in from a slight blur          transition   9
        A3    Invalid email: the input shakes once, the error changes in place           micro        8
        …     Reply with IDs.

You:    A1, A2

Agent:  implements both, then typechecks, builds and checks the reduced-motion path
```

Abridged from a real run on the [`landing-page`](examples/wow-moments/landing-page) fixture; the GIF above shows the result.

10 worked patterns · 11 moment types · a scoring rubric · an anti-slop list · motion-free test fixtures

## Repository layout

```
skills/<name>/      the skill itself: SKILL.md, references/, README.md
examples/<name>/    test fixtures (not installed with the skill)
assets/             images for these READMEs
```

## License

[MIT](LICENSE)
