# Moment taxonomy

What to look for during the scan. Each type lists the code signals that reveal it, the usual tier, a technique that fits, and the trap to avoid.

Tiers (defined fully in [scoring.md](scoring.md)):
- **hero**: rare, big, the thing people remember.
- **transition**: explains a change of state or place.
- **micro**: small feedback on a frequent action.

## 1. First success

The first time the user achieves the thing the product exists for: first project created, first scan finished, onboarding completed, first payment.

- **Signals:** `onboarding`, `isFirst`, `firstRun`, `hasCompletedSetup`, a count going from 0 to 1, success routes like `/welcome` or `/done`, a create mutation followed by a redirect.
- **Tier:** hero.
- **Technique:** a short sequence. The check mark draws, the new item settles into its place, and the next action becomes the obvious focus. Keep it under ~1.2s total ([pattern-success-check.md](pattern-success-check.md)).
- **Trap:** celebrating on *every* create. Gate it to the first time, or to genuinely rare events.

## 2. Empty → filled

A list, board or inbox that was empty gets its first item, or new items appear.

- **Signals:** `items.length === 0` branches, an `EmptyState` component, optimistic inserts, `revalidate` after a mutation.
- **Tier:** transition.
- **Technique:** the new item enters (fade + small rise or scale from ~0.96), and siblings move with a layout animation instead of jumping. With Motion: `AnimatePresence` + `layout` ([pattern-list-enter.md](pattern-list-enter.md)).
- **Trap:** animating the whole list on every refetch. Animate only items whose keys are new.

## 3. Results arrive

Data replaces a loading state: search results, a report, an AI answer, a dashboard after a fetch.

- **Signals:** `isLoading`/`isPending`, `Suspense` fallbacks, `loading.tsx`, skeleton components, `useTransition`.
- **Tier:** transition.
- **Technique:** content takes over from the skeleton in the same box (no shift), fading in as the skeleton leaves. Stagger only the first ~5 items, 40–60ms apart ([pattern-skeleton-reveal.md](pattern-skeleton-reveal.md)).
- **Trap:** staggering 30 rows, or replaying the stagger on background refresh.

## 4. Waiting with meaning

Work takes more than a second: AI generating, a scan running, an upload processing.

- **Signals:** streaming responses, `status: "running"`, polling, progress events, job IDs.
- **Tier:** micro, or transition when the wait is long and central.
- **Technique:** a status line whose label rolls to the next real step ([pattern-rolling-text.md](pattern-rolling-text.md)), a subtle shimmer on the label, streaming text that appends without re-flowing what's above.
- **Trap:** fake progress bars, or delaying content to show off a loader.

## 5. Numbers that matter

Headline figures: totals, scores, savings, case-study metrics.

- **Signals:** stat cards, KPI rows, `formatNumber`, landing-page metrics.
- **Tier:** micro (hero only on a landing page whose story *is* the number).
- **Technique:** count up once, the first time the number scrolls into view ([pattern-count-up.md](pattern-count-up.md)).
- **Trap:** counting numbers the user is editing, or numbers that refresh every few seconds.

## 6. State switch

The same thing in a different mode: theme, monthly/yearly price, tabs, grid/list view, language.

- **Signals:** toggles, `Tabs`, segmented controls, `setTheme`, `billingPeriod`.
- **Tier:** micro. A theme switch can be a hero when the brand leans into it.
- **Technique:** one sliding indicator ([pattern-sliding-indicator.md](pattern-sliding-indicator.md)), rolling price text, a View Transition for the theme ([pattern-theme-sweep.md](pattern-theme-sweep.md)).
- **Trap:** a slow transition on something toggled many times a minute.

## 7. Navigation continuity

Moving between related places: list → detail, wizard step 1 → 2, gallery → photo.

- **Signals:** dynamic routes (`[id]`), step state, `router.push` after a selection.
- **Tier:** transition.
- **Technique:** View Transitions, with a shared element for the thing the user clicked and a directional slide for steps.
- **Trap:** animating every route change the same way. Only routes with a real spatial relationship earn it.

## 8. Direct manipulation & hover

Pointer-driven feedback: hover previews, drag to reorder, copy button, like.

- **Signals:** lists of links to rich content, `draggable`, dnd libraries, copy-to-clipboard handlers.
- **Tier:** micro.
- **Technique:** a trailing preview on fine pointers only ([pattern-cursor-preview.md](pattern-cursor-preview.md)), the copy icon swapping to a check, a dragged item lifting with a shadow.
- **Trap:** hover effects that hide content, or that fire on touch devices.

## 9. Error & destructive

Something went wrong, or is about to be removed.

- **Signals:** form validation, `onError`, delete confirmations, undo handlers.
- **Tier:** micro.
- **Technique:** one short shake on an invalid submit, an error message that grows in place ([pattern-error-feedback.md](pattern-error-feedback.md)), a removed item collapsing away with an undo toast.
- **Trap:** celebratory motion, or a shake on every keystroke.

## 10. First impression

The first screen of a landing page, portfolio or product home.

- **Signals:** `app/page.tsx` hero, marketing routes.
- **Tier:** hero.
- **Technique:** a CSS-only entrance that runs before hydration: a short blur-in stagger of headline → subline → CTA ([pattern-scroll-reveal.md](pattern-scroll-reveal.md)).
- **Trap:** scroll hijacking, scroll-scrubbed heroes, text scramble, anything that delays reading.

## 11. Milestone

Rare achievements: plan upgraded, goal reached, streak, 100%.

- **Signals:** checkout success, `progress === 100`, achievements.
- **Tier:** hero, and rare by definition.
- **Technique:** a one-time sequence tied to the brand motif. Confetti only when the brand is playful *and* the event is rare.
- **Trap:** milestone celebrations on routine actions.

## Scan checklist per screen

1. Which states can this screen be in? (loading, empty, filled, error, success)
2. What is the one action the screen exists for?
3. What happens visually right after that action today? Is the change *explained*, or does content just swap?
4. Is anything here seen for the first time, or achieved for the first time?
