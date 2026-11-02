# wow-moments

**Your UI works. Now find the three moments worth animating, not the thirty.**

<p align="center">
  <img src="../../assets/wow-moments-demo.gif" alt="Side by side: a plain landing page, and the same page after wow-moments added a hero entrance and an animated signup confirmation" width="100%">
</p>

Most AI-built interfaces animate everything: every section fades up, every card lifts, every number scrambles. That's exactly what makes them look generated. This skill works the other way round. It reads your product's flows, finds the moments that *mean* something, ranks them, caps them per screen, and asks you before touching a line of code.

```bash
npx skills add rezianislami/skills --skill wow-moments
```

## How it works

```
 1. Intake    reads package.json and the motion you already have; asks at most two questions
      │
 2. Scan      every screen → its state changes → 11 moment types → scored and budgeted
      │
 3. Menu ⛔   ranked candidates with file:line, trigger, technique and reduced-motion behaviour
      │       … then it stops. Nothing changes until you pick.
      │
 4. Build     only your picks, lightest technique first; then typecheck, build and verify
```

## What makes it different

| | |
|---|---|
| **Moment-first** | It looks for state changes users care about (first success, empty → filled, results arriving), not dropdowns to polish. |
| **A budget, not a buffet** | At most one hero and three smaller moments per screen. "Nothing here" is a valid answer, and it tells you what it rejected and why. |
| **You choose** | The scan ends with a menu. Nothing is implemented until you reply with IDs. |
| **Built properly** | Reduced-motion path, correct first paint without JavaScript, no layout shift, screen-reader-safe, touch-aware, and comments that explain *why*. |
| **Uses what you have** | Plain CSS, Tailwind, Motion (`motion` / `framer-motion`) or View Transitions, whichever your project already uses. No surprise dependencies. |

## A real menu

Abridged, from a run on the [`landing-page`](../../examples/wow-moments/landing-page) fixture:

| ID | Moment | Tier | Score | Effort |
|---|---|---|---|---|
| A1 ★ | Signup succeeds: a check mark draws and the confirmation settles in place | hero | 11 | S |
| A2 ★ | Hero entrance: headline, subline, form fade in from a slight blur on first paint | transition | 9 | S |
| A3 | Invalid email: the input shakes once and the error changes in place | micro | 8 | S |

Picking `A1, A2` produced [`landing-page-after`](../../examples/wow-moments/landing-page-after), the right-hand side of the GIF above.

## Patterns included

| Pattern | Moment |
|---|---|
| Scroll reveal | Sections unfold on first paint or first scroll into view |
| Theme sweep | Theme switch spreads as a soft circle from the toggle |
| Count-up | Key numbers count up once when first seen |
| Cursor preview | Hovered list row shows a trailing image |
| Sliding indicator | Tabs or segmented control with one sliding pill |
| Rolling text | Text that changes in place rolls like an odometer |
| Success check | Confirmation takes the form's place, check draws, focus follows |
| Error feedback | Field shakes once, error grows in place |
| List enter | New item arrives, the rows below glide down |
| Skeleton reveal | Results replace a skeleton in the same box |

Every pattern explains *why* it's built that way, and its code is typechecked.

## Install

```bash
npx skills add rezianislami/skills --skill wow-moments
```

Or copy this folder into your agent's skills folder:

| Agent | Project | Personal |
|---|---|---|
| Claude Code | `.claude/skills/wow-moments/` | `~/.claude/skills/wow-moments/` |
| Codex | `.agents/skills/wow-moments/` | `~/.agents/skills/wow-moments/` |

Built for **React and Next.js** (App Router and Pages Router). Then, once your UI is built, ask:

> The UI is done. Find wow moments in it.

## Try it on a fixture

Motion-free fixtures live in [`examples/wow-moments`](../../examples/wow-moments):

- `landing-page`: a one-page marketing site.
- `sample-next-app`: a small app with an empty state, a long-running job, tabs and a theme toggle. Its README lists what a good scan should find, so copy the app elsewhere without that README before you test.

```bash
cd examples/wow-moments/landing-page
npm install && npm run dev
```

## License

[MIT](../../LICENSE)
