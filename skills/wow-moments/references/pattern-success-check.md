# Pattern: success check

**Moment:** a form or action succeeds, and the confirmation replaces the form in the same spot: the line settles in, a check mark draws itself a beat later, and focus moves to the confirmation. Hero tier for a first success; transition tier for routine successes (drop the draw, keep the swap).

## Why this shape

- **Both states share one grid cell.** The form stays mounted but `visibility: hidden` after success, so the slot keeps the form's height at every width and nothing below jumps. A `min-height` would need a magic number that breaks when text wraps.
- **The form disappears instantly; only the confirmation animates.** Two texts cross-fading in one spot look broken in any mid-animation frame. `visibility: hidden` also removes the form from the tab order and the accessibility tree.
- **The check draws with `pathLength="1"`.** That normalises the path length, so the dash values are `1`/`0` regardless of the path's real length, with no measuring.
- **Order: line first, tick second** (~120ms later), so the eye lands on the text and then the confirmation mark.
- **Focus moves to the confirmation.** The input the user was typing in is gone, and focus would otherwise drop to `<body>`. A focused `tabIndex={-1}` element is read by screen readers more reliably than a live region inserted together with its text.

## Component

```tsx
"use client";

import * as React from "react";

export function SuccessSlot({
  done,
  form,
  message,
}: {
  done: boolean;
  form: React.ReactNode;
  message: React.ReactNode;
}) {
  const doneRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  return (
    <div className="success-slot" data-state={done ? "done" : "idle"}>
      <div className="success-entry">{form}</div>
      {done && (
        <p ref={doneRef} tabIndex={-1} className="success-done">
          <svg className="success-check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" pathLength={1} />
          </svg>
          {message}
        </p>
      )}
    </div>
  );
}
```

```css
.success-slot { display: grid; }
.success-slot > * { grid-area: 1 / 1; }
.success-slot[data-state="done"] > .success-entry { visibility: hidden; }

.success-done { display: flex; align-items: center; gap: 8px; align-self: start; margin: 0; }
/* Focused for keyboard and screen-reader users; it isn't a control. */
.success-done:focus { outline: none; }

.success-check { flex: none; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.success-check path { stroke-dasharray: 1; }

@media (prefers-reduced-motion: no-preference) {
  .success-done { animation: success-in 400ms cubic-bezier(0.2, 0, 0, 1) backwards; }
  .success-check path { animation: success-draw 400ms cubic-bezier(0.2, 0, 0, 1) 120ms backwards; }
}

@keyframes success-in { from { opacity: 0; translate: 0 8px; filter: blur(4px); } }
@keyframes success-draw { from { stroke-dashoffset: 1; } }
```

## Variants

- **New item as the success:** when the success is "the thing now exists" (first project, first invoice), animate the new item instead ([pattern-list-enter.md](pattern-list-enter.md)), with the check inside it.
- **Routine success** (save, update): keep the swap and focus, drop the draw and the blur.

## Gotchas

- `backwards` fill, not `both`: it holds the start frame during the 120ms delay, and leaves no `filter`/`translate` behind (see guardrail 9).
- Hold the success state until the user moves on. A confirmation that reverts to the form after a timeout leaves people wondering whether it worked.
