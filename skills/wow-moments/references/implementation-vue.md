# Implementing in Vue / Nuxt

The scan, scoring, budget, guardrails and the CSS in every pattern file are framework-agnostic. This file covers what changes in Vue 3 and Nuxt: which mechanism to reach for, and the Vue shape of the patterns' components. Read the pattern for the *why* and the CSS, then use the Vue version here.

## Decision tree

1. **Can CSS do it?** Same as in React: state in the DOM (`:class`, `data-*`, `aria-*`) plus a CSS `transition`, `@keyframes` or `@starting-style`. Zero JS, and it works on server-rendered HTML.
2. **Something enters or leaves with `v-if` / `v-for`?** → the built-in **`<Transition>` / `<TransitionGroup>`**. They're Vue's equivalent of Motion's `AnimatePresence`: no dependency, and leaving elements stay in the DOM until their leave transition ends.
3. **Whole route changes?** → Nuxt's `experimental.viewTransition` (View Transitions), or `app.pageTransition` for a CSS page transition.
4. **A value that changes every frame?** (count-up, cursor follow) → `requestAnimationFrame` writing to a template ref, not to reactive state.
5. **Springs, gestures, drag** → `@vueuse/motion` or `motion-v`, only if already installed or the user approves adding it.

## Reduced motion

Put the `prefers-reduced-motion` guard in the CSS that `<Transition>` uses. When the media query removes the transition, Vue finds no duration and finishes the enter/leave immediately, so the end state is correct with no JS check.

For JS-driven motion (rAF, `el.animate()`, `startViewTransition`), check the preference first. Use `usePreferredReducedMotion()` from `@vueuse/core` if it's installed (it returns `'reduce'` or `'no-preference'`), or this composable:

```ts
import { onBeforeUnmount, onMounted, ref } from "vue";

// matchMedia only exists in the browser, so the value starts false on the
// server and is read on mount.
export function useReducedMotion() {
  const reduced = ref(false);
  let query: MediaQueryList | undefined;
  const update = () => (reduced.value = !!query?.matches);
  onMounted(() => {
    query = window.matchMedia("(prefers-reduced-motion: reduce)");
    update();
    query.addEventListener("change", update);
  });
  onBeforeUnmount(() => query?.removeEventListener("change", update));
  return reduced;
}
```

## SSR and hydration (Nuxt)

- **Don't use `appear` on server-rendered content.** On hydration, `appear` applies the enter-from state to content that is already visible, so it can blink out and fade back in. For first-paint entrances, use the CSS-only entrance from [pattern-scroll-reveal.md](pattern-scroll-reveal.md), which runs from the server HTML before hydration.
- `<TransitionGroup>` doesn't animate the items present on first render (`appear` is off by default). Only items added later animate, which is exactly the "only new keys" rule.
- Read `window` / `matchMedia` in `onMounted`, never in `setup` top level.
- `<ClientOnly>` is not a motion tool. Content wrapped in it is missing from the server HTML, which breaks the first-paint guardrail.

## List enter (`pattern-list-enter`)

```vue
<script setup lang="ts">
defineProps<{ items: { id: string; title: string }[] }>();
</script>

<template>
  <!-- tag="ul" renders a real list; leaving items get position:absolute in CSS
       so the rows below can start moving up immediately. -->
  <TransitionGroup tag="ul" name="row" class="item-list">
    <li v-for="item in items" :key="item.id" class="item-row">{{ item.title }}</li>
  </TransitionGroup>
</template>

<style>
.item-list { position: relative; }
@media (prefers-reduced-motion: no-preference) {
  .row-move,
  .row-enter-active { transition: opacity 300ms cubic-bezier(0.2, 0, 0, 1), translate 300ms cubic-bezier(0.2, 0, 0, 1); }
  .row-leave-active { transition: opacity 150ms ease-out; position: absolute; width: 100%; }
}
.row-enter-from { opacity: 0; translate: 0 8px; }
.row-leave-to { opacity: 0; }
</style>
```

`.row-move` is what makes the siblings glide (Vue measures before and after the change and animates the difference: FLIP). The `position: absolute` on leaving items is required for that, per the Vue docs.

## Success check (`pattern-success-check`)

```vue
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{ done: boolean }>();
const doneEl = ref<HTMLParagraphElement | null>(null);

// The form disappears on success; move focus to the confirmation so keyboard
// and screen-reader users keep their place.
watch(
  () => props.done,
  async (done) => {
    if (!done) return;
    await nextTick();
    doneEl.value?.focus();
  },
);
</script>

<template>
  <div class="success-slot" :data-state="done ? 'done' : 'idle'">
    <div class="success-entry"><slot name="form" /></div>
    <p v-if="done" ref="doneEl" tabindex="-1" class="success-done">
      <svg class="success-check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7" pathLength="1" />
      </svg>
      <slot name="message" />
    </p>
  </div>
</template>
```

The CSS is the one in [pattern-success-check.md](pattern-success-check.md), unchanged.

## Rolling text (`pattern-rolling-text`)

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ value: string }>();
const slot = ref<HTMLSpanElement | null>(null);
const width = ref<number>();

// Measure the incoming value after the DOM updates, so the slot's width can
// ease to it while both copies are on screen.
watch(
  () => props.value,
  () => {
    // The leaving copy is still mounted and carries roll-leave-active; skip it.
    const current = slot.value?.querySelector<HTMLElement>(":scope > span:not(.roll-leave-active)");
    if (current) width.value = current.offsetWidth;
  },
  { flush: "post" },
);
</script>

<template>
  <span ref="slot" class="rolling" :style="width ? { width: `${width}px` } : undefined">
    <!-- No mode: enter and leave run at the same time, in the same grid cell. -->
    <Transition name="roll">
      <span :key="value">{{ value }}</span>
    </Transition>
  </span>
</template>

<style>
.rolling { display: inline-grid; overflow: hidden; vertical-align: bottom; }
.rolling > span { grid-area: 1 / 1; width: max-content; white-space: pre; }
@media (prefers-reduced-motion: no-preference) {
  .rolling { transition: width 200ms cubic-bezier(0.2, 0, 0, 1); }
  .roll-enter-active,
  .roll-leave-active { transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1), translate 200ms cubic-bezier(0.2, 0, 0, 1); }
}
.roll-enter-from { opacity: 0; translate: 0 100%; }
.roll-leave-to { opacity: 0; translate: 0 -100%; }
</style>
```

Vue keeps the leaving `<span>` mounted until its transition ends and marks it with `roll-leave-active`, which is how the measurement skips it. Under reduced motion there's no transition, so the old copy is removed at once. (Checked in Chromium with Vue 3.5: the leave classes are already on the old copy when the post-flush watcher runs.)

## Skeleton → content (`pattern-skeleton-reveal`)

With Nuxt's `useAsyncData` / `useFetch`, the `status` ref tells you when data is loading. Render the skeleton and the list in the same box, and set `data-reveal` only for the first load:

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ pending: boolean; rows: { id: string; title: string }[] }>();

// Only the first arrival is revealed; later refreshes swap content quietly.
const reveal = ref(false);
const seen = ref(!props.pending);
watch(
  () => props.pending,
  (pending) => {
    if (pending || seen.value) return;
    seen.value = true;
    reveal.value = true;
  },
);
</script>

<template>
  <ul v-if="pending" class="result-list" aria-busy="true" aria-label="Loading results">
    <li v-for="i in 5" :key="i" class="result-row skeleton" />
  </ul>
  <ul v-else class="result-list" :data-reveal="reveal || undefined">
    <li v-for="row in rows" :key="row.id" class="result-row">{{ row.title }}</li>
  </ul>
</template>
```

CSS as in [pattern-skeleton-reveal.md](pattern-skeleton-reveal.md).

## Optimistic update (`pattern-optimistic-update`)

Vue's reactivity is synchronous, so the React version's refs-beside-state split isn't needed: plain variables hold the confirmed value and the request counter.

```ts
import { shallowRef } from "vue";

export function useOptimisticValue<T>(initial: T, save: (next: T) => Promise<void>) {
  const value = shallowRef(initial);
  const error = shallowRef("");
  let confirmed = initial;
  let latest = 0;

  async function set(next: T) {
    const request = ++latest;
    value.value = next;
    error.value = "";
    try {
      await save(next);
      confirmed = next;
    } catch {
      // A newer request is in flight; its own result decides what to show.
      if (request !== latest) return;
      value.value = confirmed;
      error.value = "Couldn't save. It's back to how it was.";
    }
  }

  return { value, error, set };
}
```

Bind `:checked="value"` and `@change="set(!value)"`, and render `error` in an always-mounted `<p role="alert">`. With Pinia Colada or TanStack Vue Query, use their `onMutate` / `onError` rollback instead.

## Undo instead of confirm (`pattern-undo-remove`)

```ts
import { onBeforeUnmount, onMounted, shallowRef } from "vue";

// Long enough to read the toast and reach the button; paused on hover/focus.
const UNDO_MS = 6000;

export function useUndoableRemove<T>(commit: (item: T) => void) {
  const pending = shallowRef<T | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    clearTimeout(timer);
    const item = pending.value;
    pending.value = null;
    if (item !== null) commit(item);
  }

  function remove(item: T) {
    flush();
    pending.value = item;
    timer = setTimeout(flush, UNDO_MS);
  }

  function undo() {
    clearTimeout(timer);
    pending.value = null;
  }

  const pause = () => clearTimeout(timer);
  function resume() {
    clearTimeout(timer);
    if (pending.value !== null) timer = setTimeout(flush, UNDO_MS);
  }

  // Leaving the page or the component commits; only Undo cancels.
  onMounted(() => window.addEventListener("pagehide", flush));
  onBeforeUnmount(() => {
    window.removeEventListener("pagehide", flush);
    flush();
  });

  return { pending, remove, undo, pause, resume };
}
```

The toast markup and CSS are the ones in [pattern-undo-remove.md](pattern-undo-remove.md): an always-mounted `role="status"` region, `@mouseenter`/`@focusin` → `pause`, `@mouseleave`/`@focusout` → `resume`. In Nuxt, `<Teleport to="body">` keeps the fixed toast out of any transformed ancestor.

## Keyboard shortcut (`pattern-keyboard-shortcut`)

```ts
import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from "vue";

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

// `enabled` is read on every key press, so a user setting can turn
// single-key shortcuts off without re-registering anything.
export function useShortcut(key: string, run: () => void, enabled: MaybeRefOrGetter<boolean> = true) {
  const onKey = (e: KeyboardEvent) => {
    if (!toValue(enabled) || e.key !== key || e.repeat || e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
    e.preventDefault();
    run();
  };
  onMounted(() => document.addEventListener("keydown", onKey));
  onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
}
```

`Ctrl/⌘+Enter` in a textarea: `@keydown.enter.exact` won't match with a modifier, so use `@keydown.ctrl.enter` and `@keydown.meta.enter` calling `form.requestSubmit()`.

## Route transitions in Nuxt

```ts nocheck
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    // true respects prefers-reduced-motion; "always" would ignore it.
    viewTransition: true,
  },
});
```

Opt a page out with `definePageMeta({ viewTransition: false })`. The animation itself is CSS on `::view-transition-old/new`, the same as in [pattern-route-transition.md](pattern-route-transition.md).
