# Motion scale

Defaults for projects that have no motion language yet. **If the project already uses its own durations and curves, use those instead**: consistency beats these numbers.

## Durations

| Use | Duration | Why |
|---|---|---|
| Press feedback, hover colour, panel fade on a frequent switch | 100–150ms | Must feel instant; anything longer reads as lag on a repeated action |
| Sliding indicator, text swap, icon swap | 180–220ms | Long enough to follow the movement, short enough to stay out of the way |
| Popover / toast / list item enter | 250–350ms | The element travels a short distance and should settle visibly |
| Section reveal, page-level entrance | 600–900ms | Large surface, and plays rarely; a longer tail reads as calm rather than slow |
| Full-screen sweep (theme change) | 600–750ms | Covers the whole viewport; faster feels like a flash |
| Count-up | 800–1000ms | Long enough to register as counting, short enough to land before the eye moves on |

**Exits are shorter than entrances**, roughly 60–75% of the enter duration. The user already decided to dismiss, so don't make them wait.

**Distance scales duration.** A tooltip moving 4px and a drawer moving 400px shouldn't share a duration.

## Easings

| Name | Curve | Use |
|---|---|---|
| standard-out | `cubic-bezier(0.2, 0, 0, 1)` | Default for UI that enters or moves: fast start, soft landing |
| long-out | `cubic-bezier(0.16, 1, 0.3, 1)` | Long reveals (600ms+), where the slow tail is the point |
| sweep-in-out | `cubic-bezier(0.45, 0, 0.2, 1)` | Full-screen changes: easing *in* avoids a jolt at the start |
| linear | `linear` | Loops (shimmer, spinners) and anything scrubbed by input |
| ease-out cubic (JS) | `1 - (1 - t) ** 3` | rAF-driven values like count-ups |

Avoid `ease-in` for anything entering: it starts slow, so the UI feels unresponsive. Use overshoot/spring curves only on small playful elements (a toggle thumb, a like heart), never on panels or text.

## Stagger

- 40–90ms between items. Use larger gaps for fewer, bigger items.
- Cap the total stagger at about 300–400ms, or stagger only the first ~5 items and show the rest together.
- Stagger the first appearance only. Never re-stagger on refresh or filter.

## Distances and blur

- Enter offset: 8px for small elements, up to 24px for sections. Large offsets look like the layout broke.
- Blur-in: 4–10px. More than that reads as out of focus rather than arriving.
- Scale-in from 0.95–0.97, not from 0. Things don't grow out of nothing.
