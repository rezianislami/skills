# Scoring

Rank candidates with a small, explainable rubric rather than gut feel, so the user can see why one idea beat another.

## Axes (1–3 each)

| Axis | 1 | 2 | 3 |
|---|---|---|---|
| **Meaning**: does the motion explain a change or mark a real achievement? | Decorative | Clarifies a change | Marks something the user cares about |
| **Rarity**: how often does it play? | Many times a minute | A few times per session | Once, or once per milestone |
| **Visibility**: is it on the main path? | Edge screen or setting | Common screen | The screen the product exists for |
| **Cost**: effort plus risk | One file, CSS only | A client component, or a small library use | New dependency, cross-route, or fragile measurement |

**Score = 2 × Meaning + Rarity + Visibility − Cost** (range 1–13)

- **≥ 9** → recommend.
- **6–8** → offer, but don't mark as recommended.
- **≤ 5** → "considered, not recommended", with a reason.

Meaning is doubled because a moment that means nothing is slop no matter how polished it is.

## Tier

Assign the tier after scoring:

- **hero**: Meaning 3 *and* Rarity 3. Big gesture allowed (600–1200ms, sequence).
- **transition**: explains a change of state or place. 200–450ms.
- **micro**: frequent feedback. 100–250ms. Interruptible.

**Frequency caps tier.** Anything with Rarity 1 is micro at most, whatever its meaning. A theme toggle used once is a fine hero; a tab switch used fifty times is not.

## Worked example

| Candidate | M | R | V | C | Score | Tier |
|---|---|---|---|---|---|---|
| First scan finished → result card draws in | 3 | 3 | 3 | 2 | 12 | hero |
| Tabs indicator slides | 2 | 1 | 2 | 1 | 6 | micro |
| Every card lifts on hover | 1 | 1 | 2 | 1 | 4 | not recommended |
