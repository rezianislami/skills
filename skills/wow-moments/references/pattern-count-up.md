# Pattern: count-up

**Moment:** headline numbers count up from zero the first time they scroll into view: `84.5`, `30%`, `16m 50s`. Micro tier. Only for numbers that are the point of the section.

## Why this shape

- **The server HTML has the final value.** JavaScript sets the start frame on mount, so without JavaScript (or under reduced motion) the real number is simply there.
- **Screen readers hear the value once.** The animated copy is `aria-hidden`, and a visually hidden copy carries the real value. Otherwise assistive tech may read the intermediate frames.
- **`tabular-nums`** keeps every digit the same width, so the text doesn't jitter while counting.
- **rAF writes `textContent` directly.** Going through state would re-render 60 times a second.
- **Every number in the string counts, keeping its decimals,** so units and mixed values ("16m 50s") work without configuration.

## Component

```tsx
"use client";

import * as React from "react";

const DURATION = 900;
// Splits text and numbers: "16m 50s" → ["", "16", "m ", "50", "s"].
const NUMBER = /(\d+(?:\.\d+)?)/;

function frameText(value: string, progress: number) {
  return value
    .split(NUMBER)
    .map((part, i) => {
      if (i % 2 === 0) return part; // odd indexes are the captured numbers
      const decimals = part.split(".")[1]?.length ?? 0;
      return (Number(part) * progress).toFixed(decimals);
    })
    .join("");
}

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = frameText(value, 0);

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        // Ease-out cubic: quick start, gentle landing on the final number.
        el.textContent = frameText(value, 1 - (1 - t) ** 3);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
```

## Gotchas

- A number that is above the fold at mount is reset to 0 for one frame before counting. That's acceptable because it's the first paint. If it isn't acceptable for a hero number, skip the reset when `getBoundingClientRect().top < innerHeight` and count from a CSS fade instead.
- Locale-formatted numbers ("1,234") contain separators the regex splits on. Format after interpolating, or extend the regex.
- Don't use it on values that update live. It should play once.
- `sr-only` must exist in the project (Tailwind ships it). Otherwise add the standard visually-hidden CSS.
