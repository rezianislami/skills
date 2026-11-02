# sample-next-app

A deliberately motion-free Next.js app for evaluating the `wow-moments` skill. It contains one of each common moment, so you can check whether a scan finds them and whether the skill shows restraint:

| Where | Moment the scan should find |
|---|---|
| `/` hero | First impression (CSS entrance) |
| `/` stats | Numbers that matter (count-up) |
| `/projects` empty state → first project | First success / empty → filled |
| `/projects` scan status | Waiting with meaning (rolling step label) |
| `/projects` invalid name | Error feedback (single shake) |
| `/projects` → `/projects/[id]` | Navigation continuity |
| `/settings` billing tabs | State switch (sliding indicator, rolling price) |
| Header theme toggle | State switch (theme sweep) |

The feature cards on `/` are a restraint check: a good scan should *not* recommend hover lifts or fade-ups on them.

```bash
npm install
npm run build
```
