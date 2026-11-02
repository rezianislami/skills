# Pattern: error feedback (shake once, grow in place)

**Moment:** an invalid submit. The field shakes once, and the error message opens in place, pushing content down smoothly instead of jumping. Micro tier. The motion says "no, look here", and nothing more.

## Why this shape

- **Shake on submit, never on keystroke.** Validation that shakes while someone is typing feels like being scolded.
- **Web Animations API for the shake, not a CSS class.** The shake has to replay on every failed submit. Re-triggering a class needs a forced reflow or a remount, and a remount would steal focus from the input. `el.animate()` just plays again, and with no fill mode it leaves no transform behind.
- **Small and fast:** ±4px, 200ms. Bigger reads as the layout breaking; longer delays the retry.
- **The message grows from zero height** with a `grid-template-rows: 0fr → 1fr` transition on one wrapper. It's a layout property, but on one small isolated box, which is the one case where that's fine. `@starting-style` gives the starting frame on mount; browsers without it show the message instantly.
- **`aria-invalid` and `aria-describedby`** carry the error for assistive tech. The motion is only for sighted users.

## Code

```tsx
"use client";

import * as React from "react";

export function shake(el: HTMLElement | null) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Cancel a shake still running from a rapid double submit, then replay.
  el.getAnimations().forEach((a) => a.cancel());
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 200, easing: "linear" },
  );
}

export function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <div className="error-slot">
      <p id={id} className="error-text">
        {message}
      </p>
    </div>
  );
}
```

Usage: call `shake(inputRef.current)` in the submit handler's invalid branch, and render `<FieldError id="email-error" message={error} />` under the field with `aria-describedby="email-error"` on the input.

```css
/* Any vertical spacing lives on the slot, so a collapsed (0fr) slot takes no
   room and growing it pushes the content below down smoothly. */
.error-slot { display: grid; grid-template-rows: 1fr; }
.error-text { margin: 0; min-height: 0; overflow: hidden; }

@media (prefers-reduced-motion: no-preference) {
  .error-slot {
    transition:
      grid-template-rows 200ms cubic-bezier(0.2, 0, 0, 1),
      opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    @starting-style {
      grid-template-rows: 0fr;
      opacity: 0;
    }
  }
}
```

## Gotchas

- If the error text sits in an element that's always rendered (a hint line that switches between helper text and error text), there's no mount to animate. Swap the text in place with [pattern-rolling-text.md](pattern-rolling-text.md) or a quick fade instead of growing.
- Don't shake the whole form or the button. Shake the field that's wrong.
- When the message *changes* (a different error on resubmit), shake again but don't re-grow. It's already open.
