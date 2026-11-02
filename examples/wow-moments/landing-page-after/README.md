# landing-page-after

The `landing-page` fixture after one `wow-moments` run, with two picks implemented:

- **A1 ★ Signup success:** the confirmation settles into the form's place (no layout shift), a check draws itself 120ms later, and focus moves to the confirmation.
- **A2 ★ Hero entrance:** headline → subline → form rise out of a soft blur on first paint. Pure CSS, so it runs before hydration.

Everything else on the page was left alone on purpose. Compare it with [`../landing-page`](../landing-page) to see the diff the skill produced.

```bash
npm install
npm run dev
```
