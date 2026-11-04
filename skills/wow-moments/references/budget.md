# Budget

Restraint is the feature. Motion that is everywhere stops meaning anything, and "everything animates" is the clearest sign that an AI built the UI.

## Per screen

- **At most one hero moment.** Never two heroes visible at the same time.
- **At most three** transition + micro moments recommended.
- **No visual twice.** If two candidates on one screen use the same effect (two count-ups, two blur reveals with different timing), keep the stronger one.
- **At most two** interaction moments recommended. They don't compete for attention like motion does, but each one is behaviour someone has to maintain and test.
- **Zero is allowed.** Settings pages, forms and admin tables often need nothing beyond what the component library already does. Say so.

## Quiet down

Many apps, especially ones generated quickly, already animate everything: every card lifts, every section fades up. A new hero can't land on top of that. The menu may list **at most five** existing animations to remove or soften, as `Q` candidates:

- Only motion that fails a test in [anti-slop.md](anti-slop.md), or that plays on the same screen as a recommended hero and competes with it.
- Each with its full `file:line` and one line on why.
- Never touched unless the user picks it, like any other candidate. Quiet-down is not an audit: if more than five qualify, list the five that matter most and say how many more there are.

## Per app

- **One signature.** Pick at most one motif that repeats across the app as the brand's motion language (for example a soft blur-in on one easing curve). Everything else should be quieter than the signature.
- **One easing family.** New moments reuse the project's curves, or the defaults in [motion-scale.md](motion-scale.md). Don't mix five different curves.
- **Heroes are rare by design.** In most apps, two or three heroes in the entire product is plenty.

## When the user picks over budget

Implement what they chose. It's their call. Point out the conflict once ("A1 and A3 are both heroes on the dashboard; they'll compete") and suggest which one to soften.
