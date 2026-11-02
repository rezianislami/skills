# Pattern: streaming answer (AI working → AI done)

**Moment:** an AI answer, a report or a log streams in. The user sees real progress (which step is running), the text grows without anything above it jumping, the view follows the text only while they're at the bottom, and the end of the stream is marked quietly. Transition tier for the overall experience. Each piece is micro.

## Why this shape

- **No per-token animation.** Text arriving *is* the motion. Fading or sliding each token makes the answer shimmer and slows reading. Real streaming is fine; a fake typewriter on text that's already loaded is slop.
- **A status line with real steps** ("Searching" → "Reading 4 sources" → "Writing"), rolled with [pattern-rolling-text.md](pattern-rolling-text.md). It answers "is it stuck?" without a spinner. Don't invent steps the backend doesn't report.
- **Stick to the bottom, but only if the user is there.** Auto-scrolling while someone scrolls up to reread is hostile. Follow the stream while they're within a few pixels of the bottom; stop the moment they scroll away.
- **Done is quiet.** The status line leaves, actions (copy, retry) appear. No celebration: an answer finishing is routine.
- **Screen readers:** don't make the streaming text a live region (it would read fragments mid-word). Announce "Answer ready" once when the stream ends.

## Code

```tsx
"use client";

import * as React from "react";

// Pixels from the bottom that still count as "at the bottom".
const STICK_THRESHOLD = 32;

// Keeps a scroll container pinned to its end while content grows, but only
// while the user is already near the end.
export function useStickToBottom<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const stuck = React.useRef(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      stuck.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
    };
    // ResizeObserver on the content, not a scroll on every token: it fires
    // once per layout change, after the new text is laid out.
    const content = el.firstElementChild;
    const resize = new ResizeObserver(() => {
      if (stuck.current) el.scrollTop = el.scrollHeight;
    });
    if (content) resize.observe(content);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resize.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return ref;
}

export function StreamingAnswer({ text, status, done }: { text: string; status: string | null; done: boolean }) {
  const scroller = useStickToBottom<HTMLDivElement>();

  return (
    <div className="answer" data-done={done || undefined}>
      <div ref={scroller} className="answer-scroll">
        <div>
          <p className="answer-text">{text}</p>
        </div>
      </div>
      {!done && status && (
        <p className="answer-status" aria-hidden="true">
          {status}…
        </p>
      )}
      {/* Announced once, when the stream ends. */}
      <p className="sr-only" role="status">
        {done ? "Answer ready" : ""}
      </p>
      {done && (
        <div className="answer-actions">
          <button type="button">Copy</button>
          <button type="button">Retry</button>
        </div>
      )}
    </div>
  );
}
```

```css
.answer-scroll { max-height: 60vh; overflow-y: auto; overscroll-behavior: contain; }
.answer-text { white-space: pre-wrap; margin: 0; }
.answer-status { color: var(--muted, #666); }

@media (prefers-reduced-motion: no-preference) {
  /* The status text shimmers while work is happening: a linear loop, the one
     motion here that repeats, and only while the stream is open. */
  .answer-status {
    background: linear-gradient(90deg, currentColor 40%, #bbb 50%, currentColor 60%) 0 0 / 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: status-shimmer 1.6s linear infinite;
  }
  .answer-actions { animation: actions-in 200ms cubic-bezier(0.2, 0, 0, 1) backwards; }
}

@keyframes status-shimmer { to { background-position: -300% 0; } }
@keyframes actions-in { from { opacity: 0; translate: 0 4px; } }
```

## Gotchas

- Markdown that re-renders on every token (re-parsing the whole answer) causes jank on long answers. Parse incrementally, or throttle rendering to animation frames.
- The shimmer runs for as long as the stream does. A stream that takes more than ~5 seconds is moving content that needs a stop control anyway (WCAG 2.2.2), and a "Stop generating" button covers it.
- Keep the composer (input) enabled during streaming if your product allows queuing the next prompt. Motion must never block input.
