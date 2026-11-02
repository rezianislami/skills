# Pattern: sliding indicator

**Moment:** in tabs, segmented controls or nav pills, the "selected" pill is one shared element that slides and resizes to the active item, instead of each item painting its own background. Micro tier: it plays often, so it must be short and interruptible.

## Why this shape

- **One element, measured.** The indicator reads the active item's `offsetLeft`/`offsetWidth` and moves with `transform` + `width`. That's one small isolated box, so animating `width` is fine here.
- **No frame without a selection.** Until the indicator has been measured (server render, before hydration), the active item paints the pill itself. Once measured, the list gets `data-indicator="ready"` and the item hands the pill over.
- **Interruptible CSS transition (200ms)**, not keyframes. Rapid clicks retarget from wherever the pill currently is.
- **Re-measure on change.** A `MutationObserver` catches the active state flipping; a `ResizeObserver` catches labels changing width (fonts loading, translations).
- **RTL-safe.** `offsetLeft` is physical in both directions, so a physical `left: 0` plus `translateX` is correct in RTL too.
- **Reduced motion:** the pill still moves, just without transitioning.

## Component

Works with any list where the active item is identifiable by a selector. Radix Tabs uses `[data-state="active"]`; ARIA tabs use `[aria-selected="true"]`.

```tsx
"use client";

import * as React from "react";

type Box = { x: number; width: number };

export function IndicatorList({
  activeSelector = '[aria-selected="true"]',
  className = "",
  children,
  ...props
}: React.ComponentProps<"div"> & { activeSelector?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<Box | null>(null);

  React.useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>(activeSelector);
      setBox(active ? { x: active.offsetLeft, width: active.offsetWidth } : null);
    };
    measure();
    const mutations = new MutationObserver(measure);
    // Only the attributes that mark the active item: watching every attribute
    // would also fire on the list's own data-indicator write.
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ["aria-selected", "data-state"] });
    const resizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizes?.observe(list);
    for (const child of list.children) resizes?.observe(child);
    return () => {
      mutations.disconnect();
      resizes?.disconnect();
    };
  }, [activeSelector]);

  return (
    <div ref={ref} data-indicator={box ? "ready" : undefined} className={`indicator-list ${className}`} {...props}>
      {box && (
        <span
          aria-hidden="true"
          className="indicator"
          style={{ width: box.width, transform: `translateX(${box.x}px)` }}
        />
      )}
      {children}
    </div>
  );
}
```

```css
.indicator-list { position: relative; display: inline-flex; }
.indicator {
  position: absolute; inset-block: 3px; left: 0;
  border-radius: 999px; background: var(--card);
  pointer-events: none;
}
@media (prefers-reduced-motion: no-preference) {
  .indicator { transition: transform 200ms cubic-bezier(0.2, 0, 0, 1), width 200ms cubic-bezier(0.2, 0, 0, 1); }
}
/* Items sit above the indicator. Before measurement the active item paints
   the pill; afterwards the indicator does. */
.indicator-list > :not(.indicator) { position: relative; }
.indicator-list > [aria-selected="true"] { background: var(--card); border-radius: 999px; }
.indicator-list[data-indicator="ready"] > [aria-selected="true"] { background: transparent; }
```

## Gotchas

- If the library marks the active item with a different attribute (`data-selected`, `data-active`), add it to `attributeFilter` and `activeSelector`, or the indicator never moves.
- The panel switch that accompanies tabs should be a quick fade (~150ms, `@starting-style`), never a slide. It plays as often as the indicator.
