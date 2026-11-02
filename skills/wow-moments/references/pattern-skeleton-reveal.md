# Pattern: skeleton → content

**Moment:** results arrive: a dashboard after a fetch, search results, a report, an AI answer. The placeholder and the real content occupy the same box, and the content takes over with a short fade and a small stagger on the first few items. Transition tier.

## Why this shape

- **Same box, same size.** The skeleton mirrors the content's layout (row count and heights), so the swap doesn't shift the page. That matters more than the animation.
- **Content animates on mount; the skeleton just leaves.** Cross-fading both looks muddy, and the skeleton disappearing under arriving content reads cleanly. With `Suspense` / `loading.tsx` the content mounts fresh when it resolves, so a CSS mount animation needs no state at all.
- **Stagger the first ~5 items only,** 40–60ms apart. The rest arrive with the fifth. A 30-row cascade makes the user wait for the animation.
- **First load only.** Background refetches and filter changes swap content without the reveal; the user already saw this content arrive once.
- **The skeleton's shimmer is a linear loop,** and the only motion here that loops. It stops entirely under reduced motion: a static grey block is still a clear placeholder.

## Code

```tsx
// app/reports/loading.tsx: Next.js shows this while page.tsx suspends.
export default function Loading() {
  return (
    <ul className="result-list" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="result-row skeleton" />
      ))}
    </ul>
  );
}
```

```tsx
// The real list. data-reveal is set on the first load only.
export function ResultList({ rows, reveal }: { rows: { id: string; title: string }[]; reveal: boolean }) {
  return (
    <ul className="result-list" data-reveal={reveal || undefined}>
      {rows.map((row) => (
        <li key={row.id} className="result-row">
          {row.title}
        </li>
      ))}
    </ul>
  );
}
```

```css
/* Skeleton rows are the same height as real rows, so the swap doesn't shift anything. */
.result-row { min-height: 48px; }
.skeleton { border-radius: 8px; background: var(--skeleton, #ececec); }

@media (prefers-reduced-motion: no-preference) {
  .skeleton {
    background: linear-gradient(90deg, #ececec 0%, #f6f6f6 50%, #ececec 100%) 0 0 / 200% 100%;
    animation: shimmer 1.2s linear infinite;
  }

  .result-list[data-reveal] > .result-row { animation: result-in 300ms cubic-bezier(0.2, 0, 0, 1) backwards; }
  .result-list[data-reveal] > .result-row:nth-child(2) { animation-delay: 50ms; }
  .result-list[data-reveal] > .result-row:nth-child(3) { animation-delay: 100ms; }
  .result-list[data-reveal] > .result-row:nth-child(4) { animation-delay: 150ms; }
  .result-list[data-reveal] > .result-row:nth-child(n + 5) { animation-delay: 200ms; }
}

@keyframes shimmer { to { background-position: -200% 0; } }
@keyframes result-in { from { opacity: 0; translate: 0 6px; } }
```

## Streaming / AI answers

- Append text without re-flowing what's above: render streamed tokens into one growing text node, and don't animate each token.
- A status line above the answer ("Searching… → Reading 4 sources… → Writing") uses [pattern-rolling-text.md](pattern-rolling-text.md), with real steps only.
- When the stream ends, don't animate again. The content is already there.

## Gotchas

- **Fast responses:** if data usually arrives in under ~200ms, the skeleton only flashes. Either skip the skeleton for the first 200ms (show nothing), or skip the reveal when the data was already cached.
- `aria-busy` on the placeholder tells assistive tech the region is loading. The real list replaces it without it.
