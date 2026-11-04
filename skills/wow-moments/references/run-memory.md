# Run memory: `.wow-moments.md`

Each run starts from zero unless something remembers the last one. Without memory, the second run re-proposes ideas the user already declined, and a new screen gets a different easing and a different signature from the rest of the app. That breaks the "one signature per app" rule in [budget.md](budget.md).

The memory is one small markdown file in the project root, `.wow-moments.md`. It's meant to be committed, so the motion language is shared by everyone (and every agent) working on the app.

## When to read and write it

- **Phase 1:** if `.wow-moments.md` exists, read it before scanning. Its motion language overrides the defaults in [motion-scale.md](motion-scale.md). Only the project's actual code wins over it; if they disagree, say so in the menu.
- **Phase 3:** don't re-propose anything under *Declined* unless the code it depended on has changed. List matches in one line at the end of the menu ("Skipped, declined before: hover lift on cards").
- **Phase 3:** don't list a quiet-down candidate the user already kept (under *Declined*), and don't re-propose motion you already removed (under *Quieted*).
- **Phase 5:** after building, create or update the file. Mention it in your report; the user can delete it if they don't want it.

Previews (`.wow-moments-preview/`) are throwaway and are never recorded here.

## Format

```markdown
# Wow moments

## Motion language
- Easing: standard-out cubic-bezier(0.2, 0, 0, 1); long-out cubic-bezier(0.16, 1, 0.3, 1)
- Durations: micro 150ms · transition 250ms · hero 600ms
- Signature: soft blur-in (8px rise, 4px blur), used for the landing hero only
- Tone: calm

## Built
- 2026-11-02 · Signup success: check draws, confirmation takes the form's place (`components/signup.tsx`)
- 2026-11-02 · Hero entrance, CSS only (`app/globals.css`, `.hero`)
- 2026-11-04 · Task checkbox saves instantly, rolls back on error (`components/task-row.tsx`), test in `components/task-row.test.tsx`

## Quieted
- 2026-11-04 · Hover lift on project cards removed, colour change kept (`components/project-card.tsx`)

## Declined
- 2026-11-02 · Monthly/yearly price roll: "price is read once, not worth it"
- 2026-11-02 · Hover lift on feature cards (not recommended by the scan)
```

## Rules

- Keep it short: one line per moment, newest last. It's a ledger, not documentation.
- Record what the user *declined* (offered but not picked) and, if they said why, their reason in their words. "Not recommended" items from the scan go there too, so they aren't re-scored every run.
- Never put secrets, URLs to internal systems or user data in it. It is likely to be committed.
- If the user removed a built moment later (the code is gone), move its line to *Declined* with "removed".
