# Pattern: theme sweep

**Moment:** switching light/dark, the new theme spreads as a soft-edged circle from the toggle until it covers the screen. A hero-grade state switch that costs one function and one CSS block.

## Why this shape

- **View Transition, not animated CSS variables.** Every colour token changes at once, and the circle reveals a snapshot of the *finished* new page. Nothing passes through half-light, half-dark colours, and there's no extra DOM.
- **Radial mask, not `clip-path`.** `clip-path` can only cut a hard edge. A mask with a gradient stop gives the soft edge.
- **CSS keyframes on a registered custom property**, not `element.animate()` on the pseudo-element. `@property` lets `--sweep-r` interpolate as a length; animating it from stylesheet keyframes is the more consistent path across browsers that support View Transitions.
- **Ease-in-out**, not the usual fast-out curve. Over a full screen a fast start reads as a jolt; easing in lets the circle gather before it spreads.
- **Fallback is the plain instant switch:** no View Transition support, or reduced motion.

## Function

```ts
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

// Width of the soft edge; must match the gradient in the CSS below.
const FEATHER = 48;

export function sweepTheme(next: Theme, setTheme: (t: Theme) => void, origin: { x: number; y: number }) {
  const doc = document as Document & {
    startViewTransition?: (update: () => void) => { finished: Promise<void> };
  };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTheme(next);
    return;
  }

  const root = document.documentElement;
  const { x, y } = origin;
  // Far enough that the inner end of the soft edge clears the farthest
  // corner, so the last frame is the plain new page.
  const end = Math.round(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + FEATHER;
  root.style.setProperty("--sweep-x", `${x}px`);
  root.style.setProperty("--sweep-y", `${y}px`);
  root.style.setProperty("--sweep-end", `${end}px`);

  const transition = doc.startViewTransition(() => {
    flushSync(() => setTheme(next));
    // Theme libraries that write the class in an effect (next-themes does)
    // can land after the browser takes the new snapshot. Writing the same
    // class here makes the snapshot right; the library's write is a no-op.
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
  });

  transition.finished.finally(() => {
    for (const p of ["--sweep-x", "--sweep-y", "--sweep-end"]) root.style.removeProperty(p);
  });
}
```

Call it from the toggle's click handler, with the toggle's centre as the origin:

```tsx nocheck
onClick={(e) => {
  const r = e.currentTarget.getBoundingClientRect();
  sweepTheme(next, setTheme, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
}}
```

## CSS

```css
@property --sweep-r {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@keyframes theme-sweep {
  from { --sweep-r: 0px; }
  to { --sweep-r: var(--sweep-end, 150vmax); }
}

/* No default cross-fade: the old snapshot sits underneath until covered. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation: theme-sweep 700ms cubic-bezier(0.45, 0, 0.2, 1) both;
  mask-image: radial-gradient(
    circle at var(--sweep-x, 50%) var(--sweep-y, 50%),
    #000 calc(var(--sweep-r) - 48px),
    transparent var(--sweep-r)
  );
}

/* The group's own animation is a no-op here (same root box), but its
   duration sets how long the transition lives, so match it. */
::view-transition-group(root) {
  animation-duration: 700ms;
}
```

## Gotchas

- If the app has other View Transitions, scope these rules (for example a `data-sweeping` attribute on `<html>` set for the duration), or route changes will sweep too.
- During a View Transition the page is a snapshot, so input is briefly ignored. Keep the duration at or under ~750ms.
