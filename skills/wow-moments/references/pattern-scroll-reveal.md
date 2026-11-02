# Pattern: scroll reveal (first paint + first scroll)

**Moment:** sections unfold out of a soft blur: on first paint if they're on screen, otherwise the first time they scroll into view. Good as a page's **signature** motif. Use one reveal style per page, applied to content blocks only.

## Why this shape

- **First paint is CSS-only.** Blocks on the first screen animate from the static HTML, before hydration, so there's no blank frame waiting for JavaScript.
- **The server HTML shows everything.** No JavaScript or a crawler still gets a complete page. JavaScript only hides blocks that start *below* the fold, after mount, where the user can't see them disappear.
- **The block's parts move, not the block.** Heading, then body, each rising out of a blur a beat apart, so a section unfolds instead of arriving as one slab.
- **State lives in a `data-reveal` attribute**, written to the DOM, not React state. The reveal is one-way and needs no re-render.
- **Transitions exist only while revealing.** Afterwards the state becomes `done` and the transition and delays are gone, so the children's own hover transitions aren't slowed by leftover delays.

## CSS

```css
.reveal {
  /* First-paint entrance. "backwards" holds the start frame through the
     delay so nothing flashes before its turn, then lets go. Not "both": a
     transform/filter animation left applied makes this element the
     containing block for any position:fixed descendants. */
  animation: reveal-enter 600ms cubic-bezier(0.2, 0, 0, 1) backwards;
  animation-delay: var(--reveal-delay, 0ms);
}

@keyframes reveal-enter {
  from {
    opacity: 0;
    translate: 0 8px;
    filter: blur(4px);
  }
}

/* Once JavaScript takes over (below-the-fold blocks only), the first-paint
   animation is dropped: it would play unseen. */
.reveal[data-reveal] {
  animation: none;
}

.reveal[data-reveal="hidden"] > * {
  opacity: 0;
  translate: 0 24px;
  filter: blur(10px);
}

.reveal[data-reveal="shown"] > * {
  transition-property: opacity, translate, filter;
  transition-duration: 900ms;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal[data-reveal="shown"] > :nth-child(2) { transition-delay: 90ms; }
.reveal[data-reveal="shown"] > :nth-child(3) { transition-delay: 180ms; }
.reveal[data-reveal="shown"] > :nth-child(n + 4) { transition-delay: 270ms; }

@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; }
}
```

## Component

```tsx
"use client";

import * as React from "react";

// Longest part: the 270ms delay plus the 900ms transition, with slack.
const SETTLE_MS = 1300;

export function Reveal({ className = "", ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen: the CSS first-paint entrance handles it.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    let settle = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        el.dataset.reveal = "shown";
        settle = window.setTimeout(() => (el.dataset.reveal = "done"), SETTLE_MS);
      },
      // Start slightly before the block enters, so it is already moving when
      // it becomes visible instead of popping at the bottom edge.
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
    };
  }, []);

  return <div ref={ref} className={`reveal ${className}`} {...props} />;
}
```

## Usage

- Hero sequence: give headline, subline and CTA their own `Reveal` with `style={{ "--reveal-delay": "60ms" }}` steps (60–120ms apart).
- Wrap content blocks (section heading + body), not every card or line.

## Tuning

`SETTLE_MS` must cover the longest delay plus the duration. Offset (24px) and blur (10px) set the character. Lower both for a calmer page.
