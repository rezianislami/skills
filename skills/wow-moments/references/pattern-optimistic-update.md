# Pattern: optimistic update

**Moment:** a frequent, low-risk write (toggle, star, rename) shows its result immediately instead of waiting for the server. If the write fails, the UI goes back to what the server last confirmed and says so in words. Interaction tier.

## Why this shape

- **Roll back to the last *confirmed* value, not to "the value before this click".** With two quick clicks where both fail, "the value before" the second click is the first click's unconfirmed value, so the UI would end up showing something the server never saved.
- **Only the newest request may roll back.** If an older request fails after a newer one went out, its rollback would undo the user's latest choice.
- **Plain state, not React's `useOptimistic`.** `useOptimistic` drops back to the passthrough value as soon as the transition ends, so the parent has to have fresh data by then (Server Actions with `revalidatePath` do that; client fetching usually doesn't, and the box flickers back). Plain state works with any data layer. Use `useOptimistic` when the project already writes through Server Actions.
- **The error is text in an always-mounted `role="alert"` element.** The region exists before the message does, which screen readers announce reliably. A colour change alone says nothing to a screen reader, or to someone who didn't notice it.

## Component

```tsx
"use client";

import * as React from "react";

export function OptimisticToggle({
  label,
  initial,
  save,
}: {
  label: string;
  initial: boolean;
  save: (next: boolean) => Promise<void>;
}) {
  const [on, setOn] = React.useState(initial);
  const [error, setError] = React.useState("");
  const confirmed = React.useRef(initial);
  const latest = React.useRef(0);

  async function toggle() {
    const next = !on;
    const request = ++latest.current;
    setOn(next);
    setError("");
    try {
      await save(next);
      confirmed.current = next;
    } catch {
      // A newer request is in flight; its own result decides what to show.
      if (request !== latest.current) return;
      setOn(confirmed.current);
      setError(`Couldn't save "${label}". It's back to how it was.`);
    }
  }

  return (
    <div className="optimistic">
      <label>
        <input type="checkbox" checked={on} onChange={toggle} />
        {label}
      </label>
      <p role="alert" className="optimistic-error">
        {error}
      </p>
    </div>
  );
}
```

```css
.optimistic-error { margin: 4px 0 0; color: var(--danger, #b42318); font-size: 0.875em; }
/* Collapse when empty, but never display:none: a hidden region leaves the
   accessibility tree, and its first message is then often not announced. */
.optimistic-error:empty { margin: 0; }
```

## Variants

- **TanStack Query:** the same idea through `onMutate` (snapshot the cache and write the new value), `onError` (restore the snapshot) and `onSettled` (invalidate). Use it when the project already uses Query.
- **Rename / inline text:** keep the typed text in the field on failure, so the user can retry, rather than reverting it.
- **Pair with error feedback** ([pattern-error-feedback.md](pattern-error-feedback.md)) when the failure needs more weight than one line.

## Gotchas

- If the parent refetches after a successful save and passes a new `initial`, this component keeps its own state. Give it a `key` that changes with the server version (for example `updatedAt`) when outside changes must show up.
- Writes can reach the server out of order. If order matters (a counter, a position in a list), queue the writes instead of firing them in parallel.
- Test the failure path (guardrail 15): make `save` reject and assert that the box returns to the confirmed value and the message appears.
