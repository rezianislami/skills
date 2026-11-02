# Pattern: route transition (list → detail)

**Moment:** the user opens one item from a list, and the thing they clicked travels into its place on the detail page while the rest of the page slides in from the direction they're going. Back reverses it. Transition tier. Only for routes with a real spatial relationship (list → detail, step 1 → step 2), never for every navigation.

## Why this shape

- **View Transitions, not a JS animation library.** The browser snapshots the old and new pages and animates between them, so the server-rendered detail page needs no client-side choreography. Browsers without support just navigate.
- **Opt-in per navigation.** Links that should animate are tagged (`transitionTypes={["nav-forward"]}`), and everything untagged maps to `"none"`. A global page transition on every route is slop.
- **A shared name for the clicked thing.** The same `name` on the thumbnail in the list and on the image in the detail page makes the browser morph one into the other. That carries the user's eye, which is the whole point.
- **Direction from the navigation, not the URL.** Forward and back get mirrored slides, so "back" feels like going back.
- **Reduced motion:** the CSS below only animates inside `prefers-reduced-motion: no-preference`; otherwise the browser's default is replaced with no animation at all.

## Next.js App Router

Experimental in Next 16 (verified on 16.4 with React 19.3, where `ViewTransition` and `addTransitionType` are stable React exports):

```ts nocheck
// next.config.ts
const nextConfig = { experimental: { viewTransition: true } };
export default nextConfig;
```

```tsx
import Link from "next/link";
import { ViewTransition } from "react";

// List page: tag the navigation and name the thumbnail.
export function ProjectLink({ id, name }: { id: string; name: string }) {
  return (
    <Link href={`/projects/${id}`} transitionTypes={["nav-forward"]}>
      <ViewTransition name={`project-${id}`}>
        <span className="project-name">{name}</span>
      </ViewTransition>
    </Link>
  );
}

// Detail page: the same name morphs the clicked element into the heading;
// the page body slides in only for tagged navigations.
export function ProjectHeader({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "slide-in-forward", "nav-back": "slide-in-back", default: "none" }}
      exit={{ "nav-forward": "slide-out-forward", "nav-back": "slide-out-back", default: "none" }}
      default="none"
    >
      <div>
        <ViewTransition name={`project-${id}`}>
          <h1>{name}</h1>
        </ViewTransition>
        {children}
      </div>
    </ViewTransition>
  );
}
```

The back link on the detail page uses `transitionTypes={["nav-back"]}`.

```css
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(.slide-out-forward) { animation: 200ms cubic-bezier(0.2, 0, 0, 1) both vt-out-left; }
  ::view-transition-new(.slide-in-forward) { animation: 300ms cubic-bezier(0.2, 0, 0, 1) both vt-in-right; }
  ::view-transition-old(.slide-out-back) { animation: 200ms cubic-bezier(0.2, 0, 0, 1) both vt-out-right; }
  ::view-transition-new(.slide-in-back) { animation: 300ms cubic-bezier(0.2, 0, 0, 1) both vt-in-left; }
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}

@keyframes vt-out-left { to { opacity: 0; translate: -24px 0; } }
@keyframes vt-in-right { from { opacity: 0; translate: 24px 0; } }
@keyframes vt-out-right { to { opacity: 0; translate: 24px 0; } }
@keyframes vt-in-left { from { opacity: 0; translate: -24px 0; } }
```

`both` is safe here, unlike on page elements: these pseudo-elements only exist for the duration of the transition, so nothing is left behind.

## Nuxt

Set `experimental.viewTransition: true` in `nuxt.config.ts` (it respects reduced motion on its own), give the shared element the same CSS `view-transition-name` on both pages, and opt pages out with `definePageMeta({ viewTransition: false })`. See [implementation-vue.md](implementation-vue.md).

## Gotchas

- `name` must be unique on the page at the moment of the snapshot. Two list items with the same name abort the transition.
- During a View Transition the page is a snapshot and briefly ignores input. Keep durations at or under ~300ms for navigation.
- A slow server response delays the snapshot of the new page, so the transition can't hide latency. Fix slow routes first.
