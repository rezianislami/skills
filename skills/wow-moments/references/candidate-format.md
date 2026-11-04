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
| A1 ★ | First project created → card draws in, CTA takes focus | hero | 10 | M |
| A2 ★ | Task checkbox saves instantly, rolls back on error | interaction | 9 | L |
| A3 | Stats count up on first view | micro | 7 | S |

**A1 ★: First project created**
- Where: `app/projects/page.tsx:42` (`items.length === 0` branch), `components/project-card.tsx`
- Trigger: first successful `createProject`, never again
- What: check stroke draws (400ms), new card rises from 8px with blur (500ms, expo-out), siblings shift with layout animation
- How: Motion `AnimatePresence` + `layout` (Motion already installed)
- Reduced motion: card appears in place, check shown static
- Risk: `layout` inside a CSS grid with `gap` needs `layout="position"` to avoid stretched text

**A2 ★: Instant task checkbox**
- Where: `components/task-row.tsx:18` (`await updateTask` before the checkbox re-enables)
- Trigger: every toggle
- What: the box checks at once; if the write fails it unchecks and says "Couldn't save, it's back to how it was"
- How: local state + rollback to the last confirmed value (optimistic-update pattern)
- Failure path: rollback + message; test added for it
- Risk: the list refetches after save; the row must not flicker back while the refetch is in flight

### Q. Quiet down (existing motion)

| ID | What | Where | Why |
|---|---|---|---|
| Q1 | Hover lift on every project card | `components/project-card.tsx:9` | Plays dozens of times a session, competes with A1 |
| Q2 | Fade-up on every dashboard section | `app/globals.css:120` | Fails the remove test; delays reading |

### Considered, not recommended
- Skipped, declined before (`.wow-moments.md`): price roll on billing toggle
- Parallax on dashboard header: decoration, fails the remove test
- Command palette: the app has four pages

---
Reply with IDs (`A1, Q1`), `recommended`, or ask to tweak one. I'll give a short verdict on your picks before building anything.
```

## Rules

- ★ marks recommended picks only (score ≥ 9 and within budget).
- `file:line` must point to code that exists, written as the full path from the project root (`app/projects/page.tsx:42`), everywhere in the menu, including the quiet-down table, the not-recommended list and side notes. A bare `page.tsx` is ambiguous in any real app. Verify it, don't guess.
- Effort: **S** = CSS or one file, **M** = a client component or library use, **L** = cross-route, new dependency, fragile measurement, or a change to how data is written. Effort and the Cost axis in [scoring.md](scoring.md) must agree: an **M** item can't score above 10.
- Name the technique *and* whether the library it needs is already installed.
- Motion candidates always include the reduced-motion behaviour. Interaction candidates always include the failure path (what the user sees when the write fails, or when they undo). Both are part of the design, not an afterthought.
- The `Q` section appears only when something qualifies (see [budget.md](budget.md)), with at most five rows.
- Order screens by product importance, not alphabetically.
