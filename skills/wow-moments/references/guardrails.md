# Guardrails

Every implemented moment must pass all of these. They are what separates a crafted moment from a demo effect.

## Checklist

1. **Reduced motion.** Under `prefers-reduced-motion: reduce`, the moment is skipped or reduced to an opacity change, and the end state is identical. Check both the CSS path (`@media`, `motion-safe:`) and the JS path (`matchMedia` checks before starting rAF loops, timers or View Transitions).
2. **First paint without JavaScript.** The server HTML shows the final content. Nothing is `opacity: 0` in the server HTML waiting for hydration, so crawlers, slow devices and JS failures still get a complete page.
3. **No flash, no jump.** Elements that animate in hold their start frame through any delay (`animation-fill-mode: backwards`), and nothing visible at mount is hidden and then re-shown.
4. **Never blocks input.** The user can click, type and scroll during the animation. Exits don't hold focus hostage. Frequent interactions (tabs, toggles) use interruptible CSS transitions, not keyframes that must finish.
5. **No layout shift.** Animate `transform`/`opacity`/`filter`. Elements that change size (rolling text, indicators) animate one isolated box, and neighbours move with it smoothly instead of jumping.
6. **Screen readers hear the truth once.** Intermediate frames (counting digits, rolling words) are `aria-hidden`, and the real value sits in a screen-reader-only copy. Decorative layers are `aria-hidden`.
7. **Touch and pointer.** Hover-driven moments are gated on `(hover: hover) and (pointer: fine)`. Touch users get the plain experience, never a stuck hover state.
8. **Clean up.** Every observer, timer and animation frame is cancelled on unmount. Transition classes or delays that only matter during the moment are removed afterwards, so they don't slow later hover transitions.
9. **No leftover containing blocks.** An element left with a `transform` or `filter` (for example `animation-fill-mode: both` on a transform animation) becomes the containing block for `position: fixed` descendants and breaks them. Prefer `backwards`, or clear the property once the animation has finished.
10. **Moving content has an end.** Anything that moves on its own for more than 5 seconds needs a pause control (WCAG 2.2.2). Prefer moments that play once and settle.
11. **Comments explain the why.** Magic numbers (durations, offsets, thresholds) say what they're for. Non-obvious technique choices say why the obvious alternative wasn't used.

## Verify

[`scripts/verify.mjs`](../scripts/verify.mjs) automates checks 1, 2, 5 and 9 on a running app (`node scripts/verify.mjs <url> --click "<selector>"`). Do the rest by hand:

- Run the project's typecheck and build.
- Emulate reduced motion (DevTools rendering panel, or `page.emulateMedia({ reducedMotion: "reduce" })` in Playwright) and trigger the moment.
- Disable JavaScript and load the page: everything is visible.
- Throttle the CPU 4× and trigger the moment: no long frames or input lag.
