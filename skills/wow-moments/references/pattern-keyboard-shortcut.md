# Pattern: keyboard shortcut

**Moment:** on a screen people use for a long time, the common move is one key away: `/` jumps to search, `j`/`k` move through a list, `Ctrl/⌘+Enter` sends. The key is visible in the UI, so people find it without a manual. Interaction tier.

## Why this shape

- **One listener on `document`, ignored while typing.** A shortcut that fires while someone writes "j" in a comment is a bug, not a feature. Inputs, textareas, selects and `contenteditable` are skipped.
- **Single keys can be turned off** (the `enabled` option, wired to a user setting). Speech-input users trigger single-character shortcuts by accident when they dictate; WCAG 2.1.4 requires that they can be disabled or remapped, or only work while their component has focus.
- **No modifiers of our own, except `Ctrl/⌘+Enter` inside a field.** `Ctrl`/`⌘`/`Alt` combinations belong to the browser, the OS and screen readers, and clash differently on every platform.
- **`e.repeat` is ignored**, so holding a key down doesn't fire the action thirty times.
- **The latest callback is read from a ref**, so callers can pass an inline function without re-subscribing the listener on every render.

## Hook

```tsx
"use client";

import * as React from "react";

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

export function useShortcut(key: string, run: () => void, { enabled = true }: { enabled?: boolean } = {}) {
  const runRef = React.useRef(run);
  React.useEffect(() => {
    runRef.current = run;
  });

  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== key || e.repeat || e.defaultPrevented) return;
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      runRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [key, enabled]);
}

// Ctrl+Enter / ⌘+Enter inside a textarea submits its form. Plain Enter keeps
// adding a new line, which is what a textarea is for.
export function submitOnModEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
}

export function SearchBox({ shortcutsEnabled }: { shortcutsEnabled: boolean }) {
  const input = React.useRef<HTMLInputElement>(null);
  useShortcut("/", () => input.current?.focus(), { enabled: shortcutsEnabled });

  return (
    <label className="search">
      <span className="sr-only">Search</span>
      <input ref={input} type="search" placeholder="Search" aria-keyshortcuts={shortcutsEnabled ? "/" : undefined} />
      {shortcutsEnabled && <kbd aria-hidden="true">/</kbd>}
    </label>
  );
}
```

```css
.search { position: relative; display: block; }
.search kbd {
  position: absolute; inset-block: 0; inset-inline-end: 8px; margin-block: auto; height: fit-content;
  padding: 0 6px; border: 1px solid currentColor; border-radius: 4px; font: inherit; font-size: 0.75em; opacity: 0.6;
}
/* The hint is noise on touch screens, where there's no keyboard to press it on. */
@media (hover: none) { .search kbd { display: none; } }
```

## Variants

- **List navigation (`j`/`k`):** keep the active index in state, move focus to the row (`row.focus()` with `tabIndex={-1}` rows, or a roving `tabIndex`), and scroll it into view with `block: "nearest"`. Focus, not just a highlight, so screen readers follow.
- **A `?` sheet** listing every shortcut once there are more than two or three, plus the setting to turn single-key shortcuts off.
- **Command palette:** only with roughly ten or more destinations or actions, and with the library the project already has (`cmdk`, the UI kit's `Command`).

## Gotchas

- `e.key` depends on the keyboard layout: `/` is `Shift+7` on a German layout and still arrives as `"/"`, which is what you want. Match on `e.key`, not `e.code`.
- `isComposing` guards IME input (Japanese, Chinese, Korean): `Enter` that confirms a composition must not submit.
- A shortcut that opens something must leave focus somewhere sensible when it closes (`Esc` returns focus to where it came from).
