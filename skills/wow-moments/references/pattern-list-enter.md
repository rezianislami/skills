# Pattern: list enter

**Moment:** an item is added to a list (a new project, a new comment, an optimistic insert). The new item arrives, the items below glide down to make room, and nothing else moves. Transition tier. The first item ever is the hero version ([pattern-success-check.md](pattern-success-check.md)).

## Why this shape

- **Only new keys animate.** Items present on first render, and items re-rendered by a refetch, stay still. Replaying an entrance on refresh is the most common list slop.
- **Mark new items explicitly** with `data-new`, set by the code that inserts them, rather than relying on "mounted = new". A first render mounts everything, so a mount-only animation would play on page load too.
- **Siblings glide with a height wrapper:** the new row's wrapper grows `grid-template-rows: 0fr → 1fr`, so rows below move continuously instead of jumping by one row height. That's pure CSS, with one isolated layout property on one box.
- **With Motion installed,** `AnimatePresence initial={false}` + `layout` does the same and handles removals too. Prefer it over the CSS version when the project already has Motion.

## CSS version

```tsx
"use client";

import * as React from "react";

type Item = { id: string; title: string };

export function ItemList({ items, newIds }: { items: Item[]; newIds: ReadonlySet<string> }) {
  return (
    <ul className="item-list">
      {items.map((item) => (
        <li key={item.id} className="item-row" data-new={newIds.has(item.id) || undefined}>
          <div className="item-body">{item.title}</div>
        </li>
      ))}
    </ul>
  );
}
```

```css
.item-row { display: grid; grid-template-rows: 1fr; }
.item-body { min-height: 0; overflow: hidden; }

@media (prefers-reduced-motion: no-preference) {
  .item-row[data-new] { animation: row-open 250ms cubic-bezier(0.2, 0, 0, 1) backwards; }
  .item-row[data-new] > .item-body { animation: row-in 300ms cubic-bezier(0.2, 0, 0, 1) backwards; }
}

@keyframes row-open { from { grid-template-rows: 0fr; } }
@keyframes row-in { from { opacity: 0; translate: 0 8px; } }
```

The insert handler adds the new id to `newIds`. Clear the set after the animation (~400ms), or keep it; `data-new` on an already-mounted row doesn't replay the keyframes.

## Motion version

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

export function MotionItemList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <ul className="item-list">
      {/* initial={false}: rows present on first render don't animate. */}
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout="position"
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

`layout="position"` animates position only. Plain `layout` also animates size, which stretches text inside grid or flex rows mid-animation.

## Gotchas

- **Keys must be stable and unique.** Duplicate or index keys make React reuse the wrong row, and the wrong item animates.
- **Lists with `gap`:** the gap snaps in when the row mounts. If that's visible, move the spacing into the row's padding.
- **Long lists:** only animate rows inside the viewport; off-screen inserts can just appear.
