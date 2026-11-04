# Scoring

Rank candidates with a small, explainable rubric rather than gut feel, so the user can see why one idea beat another.

## Axes (1–3 each)

| Axis | 1 | 2 | 3 |
|---|---|---|---|
| **Meaning**: does it explain a change, mark a real achievement, or remove real friction? | Decorative | Clarifies a change, or saves a small step | Marks something the user cares about, or removes a wait, a retype or a lost change |
| **Rarity**: how often does it play? | Many times a minute | A few times per session | Once, or once per milestone |
| **Visibility**: is it on the main path? | Edge screen or setting | Common screen | The screen the product exists for |
| **Cost**: effort plus risk | One file, CSS only | A client component, or a small library use | New dependency, cross-route, fragile measurement, or a change to how data is written |

**Rarity for interaction moments** is inverted: they earn their keep by being used often. Score an interaction moment's Rarity as 3 when the friction it removes happens many times a session, and 1 when it's rare. An undo that saves one lost item a month still matters, but it isn't a wow.

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
- **interaction**: a non-motion moment (types 12–17 in [moment-taxonomy.md](moment-taxonomy.md)). It may pair with a small motion, such as the undo toast sliding in, but the value is the behaviour.

**Frequency caps tier.** Anything with Rarity 1 is micro at most, whatever its meaning. A theme toggle used once is a fine hero; a tab switch used fifty times is not. This doesn't apply to interaction moments, whose Rarity is inverted.

## Worked example

| Candidate | M | R | V | C | Score | Tier |
|---|---|---|---|---|---|---|
| First scan finished → result card draws in | 3 | 3 | 3 | 2 | 10 | hero |
| Tabs indicator slides | 2 | 1 | 2 | 1 | 6 | micro |
| Every card lifts on hover | 1 | 1 | 2 | 1 | 4 | not recommended |
| Task checkbox saves instantly, rolls back on error | 3 | 3 | 3 | 3 | 9 | interaction |
| Delete confirm → undo toast | 3 | 2 | 2 | 3 | 7 | interaction |
