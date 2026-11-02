# Budget

Restraint is the feature. Motion that is everywhere stops meaning anything, and "everything animates" is the clearest sign that an AI built the UI.

## Per screen

- **At most one hero moment.** Never two heroes visible at the same time.
- **At most three** transition + micro moments recommended.
- **No visual twice.** If two candidates on one screen use the same effect (two count-ups, two blur reveals with different timing), keep the stronger one.
- **Zero is allowed.** Settings pages, forms and admin tables often need nothing beyond what the component library already does. Say so.

## Per app

- **One signature.** Pick at most one motif that repeats across the app as the brand's motion language (for example a soft blur-in on one easing curve). Everything else should be quieter than the signature.
- **One easing family.** New moments reuse the project's curves, or the defaults in [motion-scale.md](motion-scale.md). Don't mix five different curves.
- **Heroes are rare by design.** In most apps, two or three heroes in the entire product is plenty.

## When the user picks over budget

Implement what they chose. It's their call. Point out the conflict once ("A1 and A3 are both heroes on the dashboard; they'll compete") and suggest which one to soften.
