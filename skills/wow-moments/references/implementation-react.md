# Implementing in React / Next.js

Choose the lightest technique that can do the job. Each step down the list adds JavaScript, hydration concerns or dependencies.

## Decision tree

1. **Can CSS do it?** State is already in the DOM (a class, `data-state`, `aria-expanded`, `:hover`, `:checked`), or the element enters on mount → use a CSS `transition`, `@keyframes`, or `@starting-style`.
   - Zero JS, works in Server Components, runs before hydration.
   - `@starting-style` gives a mount transition without keyframes. Browsers that don't support it skip the animation, which is an acceptable fallback.
2. **React-controlled enter/exit, layout reflow, gestures, springs?** → **Motion**, if it is installed (`motion` package, or the older `framer-motion`).
3. **Swapping a whole page or the whole document?** (route change, theme) → **View Transitions**.
4. **A value that changes every frame?** (count-up, cursor follow) → `requestAnimationFrame` writing to a DOM ref, not React state.
5. **Scroll choreography the user explicitly asked for** → GSAP / ScrollTrigger, only if it's already installed or the user approves adding it.

## CSS

```css
/* Fade a panel in when it mounts, without keyframes. */
.panel {
  transition: opacity 150ms cubic-bezier(0.2, 0, 0, 1);
  @starting-style {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; }
}
```

With Tailwind v4: `motion-safe:` and `motion-reduce:` variants, and `starting:` for `@starting-style`. If `tw-animate-css` is installed, its `animate-in fade-in slide-in-from-bottom-2` utilities cover most enters. Prefix them with `motion-safe:`.

## Motion (`motion/react`)

```tsx
"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";

// Once near the root: under reduced motion, Motion disables transform and
// layout animations but keeps opacity, so state changes still read.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function ItemList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <ul>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            {item.title}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

Notes:
- Any file that imports `motion` needs `"use client"`. Keep these components small leaves, and pass Server Component content in as `children`.
- `initial={false}` on `AnimatePresence` stops items that are already there from animating on first render, so only new keys enter.
- `AnimatePresence` tracks its **direct** children by `key`. Don't use array indexes as keys.
- `useReducedMotion()` returns a boolean for when you need a different animation rather than none.
- Existing `framer-motion` projects: same API, imported from `"framer-motion"`. Don't migrate packages as a side effect.

## View Transitions

**Same-document (theme, in-place swaps):** feature-detect `document.startViewTransition`, and run the state change inside it. See [pattern-theme-sweep.md](pattern-theme-sweep.md).

**Route transitions in the Next.js App Router** (experimental as of Next 16.x; check the project's version):

```ts
// next.config.ts
const nextConfig = { experimental: { viewTransition: true } };
export default nextConfig;
```

```tsx
import { ViewTransition } from "react";
import Link from "next/link";

// Tag the navigation, then map the tag to an animation in CSS
// (::view-transition-old/new) or via ViewTransition's enter/exit props.
<Link href={`/photos/${id}`} transitionTypes={["nav-forward"]}>…</Link>

<ViewTransition enter={{ "nav-forward": "nav-forward", default: "none" }} default="none">
  {children}
</ViewTransition>
```

Default to `"none"` so only tagged navigations animate.

## rAF-driven values

Write to the DOM node directly. Calling `setState` 60 times a second re-renders the subtree for nothing. See [pattern-count-up.md](pattern-count-up.md) and [pattern-cursor-preview.md](pattern-cursor-preview.md).

## Server/client boundaries

- Motion state that only exists in the browser (a "revealed" flag, a measured width) lives in `data-*` attributes or refs, not in props from the server.
- Never render content hidden on the server and reveal it with JavaScript. The server HTML must show the final state. JavaScript may *hide then reveal* only elements that are off-screen at mount ([pattern-scroll-reveal.md](pattern-scroll-reveal.md)).
- Read `matchMedia` inside `useEffect`. On the server it doesn't exist.
