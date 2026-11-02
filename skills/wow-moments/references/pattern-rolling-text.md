# Pattern: rolling text

**Moment:** text that changes in place, like a price switching monthly/yearly, a package-manager command, an AI status step or a counter label, rolls like an odometer. The old value slides up and out, the new one comes up from below, and the slot's width eases to fit, so the text after it glides instead of jumping. Micro tier.

## Why this shape

- **Both values share one grid cell.** The slot clips them vertically, and they overlap without absolute positioning.
- **Width is measured and transitioned** on the slot only. It's one small isolated box, and it keeps the rest of the line from jumping.
- **Derive "leaving" during render,** React's recommended pattern for state derived from props, instead of syncing in an effect (which would render one frame with the wrong value).
- **Reduced motion:** nothing animates, and the leaving value is hidden outright, because `animationend` would never fire to remove it.
- **The leaving copy is `aria-hidden`.** Screen readers hear only the new value.

## Component

```tsx
"use client";

import * as React from "react";

export function RollingText({ value }: { value: string }) {
  const [shown, setShown] = React.useState(value);
  const [leaving, setLeaving] = React.useState<string | null>(null);
  const [width, setWidth] = React.useState<number>();
  const current = React.useRef<HTMLSpanElement>(null);

  if (value !== shown) {
    setLeaving(shown);
    setShown(value);
  }

  React.useLayoutEffect(() => {
    if (current.current?.offsetWidth) setWidth(current.current.offsetWidth);
  }, [shown]);

  return (
    <span className="rolling" style={width ? { width } : undefined}>
      <span key={shown} ref={current} className="rolling-in">
        {shown}
      </span>
      {leaving !== null && (
        <span key={`out-${leaving}-${shown}`} aria-hidden="true" className="rolling-out" onAnimationEnd={() => setLeaving(null)}>
          {leaving}
        </span>
      )}
    </span>
  );
}
```

```css
.rolling {
  position: relative;
  display: inline-grid;
  overflow: hidden;
  vertical-align: bottom;
}
/* Measured above, so each copy must be as wide as its own text, not
   stretched to the slot (which would lock the slot at its widest value). */
.rolling > span {
  grid-area: 1 / 1;
  width: max-content;
  justify-self: start;
  white-space: pre;
}

@media (prefers-reduced-motion: no-preference) {
  .rolling { transition: width 200ms cubic-bezier(0.2, 0, 0, 1); }
  .rolling-in { animation: roll-in 200ms cubic-bezier(0.2, 0, 0, 1); }
  .rolling-out { animation: roll-out 200ms cubic-bezier(0.2, 0, 0, 1) forwards; }
}
@media (prefers-reduced-motion: reduce) {
  .rolling-out { display: none; }
}

@keyframes roll-in { from { opacity: 0; translate: 0 100%; } }
@keyframes roll-out { to { opacity: 0; translate: 0 -100%; } }
```

## Self-playing variant

To demo several values on a landing page (for example cycling through example items once):
- Start when the block is ~60% in view, play once, and settle on a sensible value.
- Keep the total under 5 seconds, so no pause control is needed (WCAG 2.2.2). Three swaps ~1.1s apart fits.
- Stop on any pointer enter or focus inside the block, so the text never changes under someone's cursor.
- Skip it entirely under reduced motion.
