# Pattern: cursor-follow preview

**Moment:** hovering a row in a list of links (projects, articles, clients) shows a small image of the destination, trailing the cursor with a slight lag. Micro tier, fine pointers only.

## Why this shape

- **Three modes:** `off` (touch, or no hover) renders nothing; `follow` trails the cursor; `still` (reduced motion) sits beside the hovered row and never moves on its own.
- **Event delegation on the wrapper:** rows opt in with `data-preview="key"`, so the rows themselves stay Server Components.
- **Fixed to the viewport:** no layout shift, never clipped by an `overflow: hidden` column, and clamped so rows near an edge don't push it off screen.
- **Offset down-right of the cursor,** so the image never covers the row being read.
- **Lerp in rAF, writing `transform` directly:** each frame covers a share of the remaining distance (0.18 → settles in about a quarter second at 60fps). State updates would re-render the list every frame.
- **Hidden while scrolling:** it would drift away from its row.
- **Decorative:** `aria-hidden`, empty `alt`. The row's text already says what it links to.

## Component (condensed)

```tsx
"use client";

import * as React from "react";

type Mode = "off" | "follow" | "still";
const W = 288, H = 180, OFFSET = 20, GAP = 24;
const EASE = 0.18; // share of remaining distance per frame

function useMode(): Mode {
  const [mode, setMode] = React.useState<Mode>("off");
  React.useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMode(!fine.matches ? "off" : reduce.matches ? "still" : "follow");
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);
  return mode;
}

export function HoverPreview({ images, children }: { images: Record<string, string>; children: React.ReactNode }) {
  const mode = useMode();
  const [active, setActive] = React.useState<string | null>(null);
  const node = React.useRef<HTMLDivElement>(null);
  const target = React.useRef({ x: 0, y: 0 });
  const current = React.useRef({ x: 0, y: 0 });
  const frame = React.useRef(0);

  const paint = () => {
    if (node.current) node.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
  };
  const clamp = (x: number, y: number) => ({
    x: Math.max(16, Math.min(x, innerWidth - W - 16)),
    y: Math.max(16, Math.min(y, innerHeight - H - 16)),
  });
  function tick() {
    const c = current.current, t = target.current;
    c.x += (t.x - c.x) * EASE;
    c.y += (t.y - c.y) * EASE;
    paint();
    // Stop once within half a pixel.
    frame.current = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.5 ? requestAnimationFrame(tick) : 0;
  }

  function onOver(e: React.PointerEvent) {
    if (mode === "off") return;
    const row = (e.target as Element).closest<HTMLElement>("[data-preview]");
    const key = row?.dataset.preview;
    if (!row || !key || !(key in images)) return setActive(null);
    if (mode === "still") {
      const r = row.getBoundingClientRect();
      current.current = clamp(r.right + GAP, r.top + r.height / 2 - H / 2);
      paint();
    } else if (active === null) {
      // Entering the list: start at the cursor, don't glide in from the last spot.
      current.current = target.current = clamp(e.clientX + OFFSET, e.clientY + OFFSET);
      paint();
    }
    setActive(key);
  }

  function onMove(e: React.PointerEvent) {
    if (mode !== "follow") return;
    target.current = clamp(e.clientX + OFFSET, e.clientY + OFFSET);
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  }

  React.useEffect(() => {
    if (mode === "off") return;
    const hide = () => setActive(null);
    addEventListener("scroll", hide, { passive: true });
    return () => removeEventListener("scroll", hide);
  }, [mode]);
  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div onPointerOver={onOver} onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      {children}
      {mode !== "off" && (
        <div ref={node} aria-hidden="true" data-active={active ?? undefined} className="hover-preview">
          {Object.entries(images).map(([key, src]) => (
            // All images stay mounted and cross-fade, so switching rows never flashes empty.
            <img key={key} src={src} alt="" data-active={key === active || undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
```

```css
.hover-preview {
  position: fixed; top: 0; left: 0; z-index: 50;
  width: 288px; height: 180px; overflow: hidden; border-radius: 14px;
  pointer-events: none; opacity: 0; transition: opacity 150ms ease-out;
}
.hover-preview[data-active] { opacity: 1; }
.hover-preview img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: 0; transition: opacity 150ms ease-out;
}
.hover-preview img[data-active] { opacity: 1; }
```

## Gotchas

- An ancestor with a leftover `transform`/`filter` (for example from an entrance animation with `fill-mode: both`) breaks `position: fixed`. See guardrail 9.
- Preload the images (they're all mounted), or the first hover shows an empty frame.
