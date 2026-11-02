# wow-moments

An agent skill that finds the few places in your frontend that deserve a memorable animation, lets you pick, and builds the ones you chose properly.

Most AI-built interfaces animate everything: every section fades up, every card lifts, every number scrambles. That's what makes them look generated. This skill works the other way round. It reads your product's flows, finds the moments that *mean* something (the first success, an empty list getting its first item, results arriving, a theme switch), ranks them, caps them per screen, and asks you before touching code.

- **Moment-first, not component-first.** It looks for state changes users care about, not dropdowns to polish.
- **A budget, not a buffet.** At most one hero moment and three smaller ones per screen. "Nothing here" is a valid answer.
- **You choose.** The scan ends with a menu. Nothing is implemented until you reply with the IDs you want.
- **Built properly.** Reduced-motion paths, correct first paint without JavaScript, no layout shift, screen-reader-safe, touch-aware, and comments that explain why.

Built for **React and Next.js** (App Router and Pages Router). Works with plain CSS, Tailwind, Motion (`motion` / `framer-motion`) and View Transitions, and uses whatever your project already has.

## Install

With the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add rezianislami/skills --skill wow-moments
```

Or copy this folder (`skills/wow-moments/`) into your agent's skills folder:

| Agent | Project | Personal |
|---|---|---|
| Claude Code | `.claude/skills/wow-moments/` | `~/.claude/skills/wow-moments/` |
| Codex | `.agents/skills/wow-moments/` | `~/.agents/skills/wow-moments/` |

The skill follows the open [Agent Skills](https://agentskills.io/specification) format, so other compatible agents can load it too.

## Use

Build your UI first, then ask your agent something like:

> Find wow moments in this app.

> Where should we add micro-interactions? The UI is done.

You get a menu like this:

```markdown
### A. Projects (`/projects`)

| ID | Moment | Tier | Score | Effort |
|---|---|---|---|---|
| A1 ★ | First project scanned → card draws in, CTA takes focus | hero | 12 | M |
| A2 ★ | Scan status label rolls to each real step | micro | 9 | S |
| A3 | Invalid name → one short shake | micro | 7 | S |

### Considered, not recommended
- Hover lift on project cards: plays dozens of times a session, carries no information
```

Reply with `A1, A2` (or `recommended`) and the agent implements just those, then verifies the build, the reduced-motion path and first paint.

## What's inside

```
skills/wow-moments/
├── SKILL.md                     # workflow and hard rules
└── references/
    ├── moment-taxonomy.md       # 11 moment types and the code signals that reveal them
    ├── scoring.md               # meaning × rarity × visibility − cost, and tiers
    ├── budget.md                # how many moments, and where
    ├── anti-slop.md             # what not to propose, and why
    ├── candidate-format.md      # the menu
    ├── implementation-react.md  # CSS vs Motion vs View Transitions vs rAF
    ├── motion-scale.md          # durations, easings, stagger, distances
    ├── guardrails.md            # the checklist every moment must pass
    └── pattern-*.md             # six worked, production-tested patterns
```

Patterns: scroll reveal, theme sweep, count-up, cursor-follow preview, sliding indicator, rolling text.

## Try it on the fixture

[`examples/wow-moments/sample-next-app`](../../examples/wow-moments/sample-next-app) in the collection repo is a small Next.js app with no motion at all, built to contain one of each common moment, plus a restraint check:

```bash
cd examples/wow-moments/sample-next-app
npm install
npm run build
```

Then point your agent at that folder and ask for wow moments. The fixture's README lists what a good scan should find. Copy the app somewhere else without that README before you test, or the agent can read the answers.

## License

[MIT](../../LICENSE)
