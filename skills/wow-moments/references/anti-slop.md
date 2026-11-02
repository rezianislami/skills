# Anti-slop

Patterns that make an interface read as generated rather than designed. Don't propose them. If the user asks for one, build it and note the risk once.

The first group comes from real design reviews, where each was tried on a production portfolio and reverted for being "an effect for its own sake". The second group is the common generic set.

## Tried and reverted in real reviews

| Pattern | Why it failed |
|---|---|
| Frosted / liquid-glass top bar | Decoration with no job; a solid bar read cleaner and more confident |
| Vignette or glow layer behind the header | Muddied the content edge; nobody could say what it was for |
| "Living" / kinetic type (letters that wobble, breathe or follow the cursor) | Makes text harder to read, which is the one thing text has to do |
| Magnetic buttons and custom cursors | Fights the user's pointer; feels like a demo, not a product |
| Easter eggs (Konami codes, secret modes) | Charm nobody finds; code everyone maintains |
| Scroll-scrubbed hero | Takes the scroll away from the reader; hostile on trackpads and to reduced-motion users |
| "Decode" / scramble number and text effects | Unreadable for its whole duration; reads as a hacker-movie cliché |
| Live local-time-on-hover widgets | Novelty with no information the visitor needs |

## Common generic slop

- Fade-up on **every** section as you scroll. Pick one reveal style for the page, apply it to content blocks, and leave small elements alone.
- Infinite floating blobs, pulsing gradient glows, animated mesh backgrounds behind text.
- Bounce or elastic easing on everything. Overshoot belongs to small playful elements, not panels.
- Parallax that doesn't reveal anything.
- Typewriter headlines. They delay the one sentence the visitor came to read.
- Confetti on routine actions (save, update, login).
- Hover scale/lift on every card in a grid.
- Staggering long lists (more than ~5 items) or replaying the stagger on refresh.
- Loaders that are kept on screen to show off, delaying ready content.
- Animated counters on numbers that aren't the point.
- Page transitions on every route, including ones with no spatial relationship.
- Scroll hijacking / smooth-scroll libraries that change scroll speed, unless the user explicitly wants them.

## Test before proposing

1. **Remove test:** if the moment disappeared, would anyone miss the *information* it carried? If not, it's decoration. Decoration is allowed only as the one signature motif.
2. **Tenth-time test:** is it still pleasant the tenth time it plays today? If not, make it shorter or rarer.
3. **Screenshot test:** does a still frame mid-animation look broken (half-blurred text, overlapping layers)? If yes, shorten it.
