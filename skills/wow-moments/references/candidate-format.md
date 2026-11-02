# Candidate menu format

The menu is the product of the scan. It must let the user decide in under a minute, so keep every line concrete: where, when it triggers, what it looks like, and what it costs.

## Template

```markdown
## Wow moments: <app name>

Motion language found: <existing durations / easings / libraries, or "none yet">
Tone assumed: <calm | playful | premium | technical>

### A. <Screen name> (`<route>`)

| ID | Moment | Tier | Score | Effort |
|---|---|---|---|---|
| A1 ★ | First project created → card draws in, CTA takes focus | hero | 12 | M |
| A2 | Stats count up on first view | micro | 9 | S |

**A1 ★: First project created**
- Where: `app/projects/page.tsx:42` (`items.length === 0` branch), `components/project-card.tsx`
- Trigger: first successful `createProject`, never again
- What: check stroke draws (400ms), new card rises from 8px with blur (500ms, expo-out), siblings shift with layout animation
- How: Motion `AnimatePresence` + `layout` (Motion already installed)
- Reduced motion: card appears in place, check shown static
- Risk: `layout` inside a CSS grid with `gap` needs `layout="position"` to avoid stretched text

### Considered, not recommended
- Skipped, declined before (`.wow-moments.md`): price roll on billing toggle
- Hover lift on project cards: plays dozens of times a session and carries no information (score 4)
- Parallax on dashboard header: decoration, fails the remove test

---
Reply with IDs (`A1, A2`), `recommended`, or ask to tweak one.
```

## Rules

- ★ marks recommended picks only (score ≥ 9 and within budget).
- `file:line` must point to code that exists, written as the full path from the project root (`app/projects/page.tsx:42`), everywhere in the menu, including the not-recommended list and side notes. A bare `page.tsx` is ambiguous in any real app. Verify it, don't guess.
- Effort: **S** = CSS or one file, **M** = a client component or library use, **L** = cross-route, new dependency, or fragile measurement.
- Name the technique *and* whether the library it needs is already installed.
- Always include the reduced-motion behaviour. It's part of the design, not an afterthought.
- Order screens by product importance, not alphabetically.
