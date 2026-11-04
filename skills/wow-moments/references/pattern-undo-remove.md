# Pattern: undo instead of confirm

**Moment:** deleting no longer asks "Are you sure?". The item leaves at once, a toast offers **Undo** for a few seconds, and nothing is lost either way. Interaction tier, with a small transition for the toast.

## Why this shape

- **Prefer the API's restore if there is one.** If the backend soft-deletes or has a restore endpoint, delete immediately and make Undo call restore. Nothing has to survive a closed tab. This pattern is for the common case where there's only `DELETE`.
- **The delete is deferred, then committed** when the undo window closes, when another item is removed, when the page is hidden, or when the component unmounts. Leaving is not the same as undoing.
- **`pagehide`, not `beforeunload`.** It fires on mobile and when the page enters the back/forward cache, where `beforeunload` often doesn't. The commit must use `fetch(…, { keepalive: true })`, or the browser cancels the request with the page.
- **One pending removal at a time.** Removing a second item commits the first. Stacking several undo toasts makes it unclear what Undo will bring back.
- **The timer pauses while the toast is hovered or focused**, so keyboard and screen-reader users can reach the button before it disappears (WCAG 2.2.1).
- **The toast region is always mounted** with `role="status"`, so the "Deleted …" text is announced when it appears, and focus stays where the user was working.

## Hook and toast

```tsx
"use client";

import * as React from "react";

// Long enough to read the toast and reach the button; the timer also pauses
// while the toast is hovered or focused.
const UNDO_MS = 6000;

export function useUndoableRemove<T>(commit: (item: T) => void) {
  const [pending, setPending] = React.useState<T | null>(null);
  const pendingRef = React.useRef<T | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commitRef = React.useRef(commit);
  React.useEffect(() => {
    commitRef.current = commit;
  });

  const flush = React.useCallback(() => {
    clearTimeout(timer.current);
    const item = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    if (item !== null) commitRef.current(item);
  }, []);

  const remove = React.useCallback(
    (item: T) => {
      flush();
      pendingRef.current = item;
      setPending(item);
      timer.current = setTimeout(flush, UNDO_MS);
    },
    [flush],
  );

  const undo = React.useCallback(() => {
    clearTimeout(timer.current);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const pause = React.useCallback(() => clearTimeout(timer.current), []);
  const resume = React.useCallback(() => {
    clearTimeout(timer.current);
    if (pendingRef.current !== null) timer.current = setTimeout(flush, UNDO_MS);
  }, [flush]);

  React.useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return { pending, remove, undo, pause, resume };
}

export function UndoToast({
  message,
  onUndo,
  onPause,
  onResume,
}: {
  message: string | null;
  onUndo: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  return (
    <div role="status" className="undo-region">
      {message && (
        <div className="undo-toast" onMouseEnter={onPause} onMouseLeave={onResume} onFocus={onPause} onBlur={onResume}>
          <span>{message}</span>
          <button type="button" onClick={onUndo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
```

Usage: hide the pending item from the list, and commit with `keepalive`:

```tsx nocheck
const { pending, remove, undo, pause, resume } = useUndoableRemove<Task>((task) => {
  void fetch(`/api/tasks/${task.id}`, { method: "DELETE", keepalive: true });
});
const visible = tasks.filter((t) => t.id !== pending?.id);
// …
<UndoToast message={pending && `Deleted "${pending.title}"`} onUndo={undo} onPause={pause} onResume={resume} />
```

```css
.undo-region { position: fixed; inset: auto 16px 16px; display: grid; justify-items: center; pointer-events: none; }
.undo-toast {
  pointer-events: auto; display: flex; gap: 12px; align-items: center;
  padding: 10px 14px; border-radius: 8px; background: var(--toast-bg, #1f2328); color: var(--toast-fg, #fff);
}
@media (prefers-reduced-motion: no-preference) {
  .undo-toast { animation: undo-in 250ms cubic-bezier(0.2, 0, 0, 1) backwards; }
}
@keyframes undo-in { from { opacity: 0; translate: 0 8px; } }
```

## Gotchas

- `keepalive` requests are limited to about 64 KB of body in total. A `DELETE` by ID is far below that; a bulk delete with a large body is not.
- If the commit fails, the item is already gone from the list. Put it back and say so, the same way as [pattern-optimistic-update.md](pattern-optimistic-update.md).
- Pressing Undo unmounts the toast and its focused button, so focus falls to `<body>`. Move focus to the restored item (or the control that deleted it) after `undo()`.
- Keep the confirmation dialog for effects that can't be taken back by the client: sending, paying, notifying other people.
- Test the failure paths (guardrail 15): Undo leaves the item and sends nothing; unmounting with a pending item sends the delete.
