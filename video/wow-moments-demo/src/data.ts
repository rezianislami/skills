// Every line here is copied from a real headless run of the skill on
// examples/wow-moments/landing-page (scan, then "A1, A2"). A line too long
// for one row keeps its opening words and is cut with "…"; nothing is
// reworded or invented. The build phase was not run, so the video stops at the verdict
// instead of showing a PASS that never happened.

export const PROMPT = "The page is done. Find wow moments in it.";
export const PICK = "A1, A2";

// The files the menu cites, shown while the scan "runs".
export const SCANNED = ["app/page.tsx", "components/signup.tsx", "components/pricing.tsx", "app/globals.css"];

export type Row = { id: string; star: boolean; moment: string; tier: string; score: number };

export const MENU_TITLE = "Wow moments: Tally (landing page)";
export const MENU_SECTION = "A. Home (/)";
export const MENU_ROWS: Row[] = [
  { id: "A1", star: true, moment: "Signup succeeds → confirmation settles in where the form was…", tier: "hero", score: 10 },
  { id: "A2", star: true, moment: "Bottom \"Get started free\" scrolls to the hero signup…", tier: "interaction", score: 9 },
  { id: "A3", star: false, moment: "Invalid email → the field shakes once, the hint text swaps…", tier: "micro", score: 8 },
  { id: "A4", star: false, moment: "Monthly/Yearly → prices roll like an odometer", tier: "micro", score: 7 },
  { id: "A5", star: false, moment: "Monthly/Yearly → one pill slides between the two options", tier: "micro", score: 7 },
  { id: "A6", star: false, moment: "Headline → subline → signup blur in on first paint", tier: "transition", score: 7 },
  { id: "A7", star: false, moment: "Stats count up once when scrolled into view", tier: "micro", score: 7 },
];

export const NOT_RECOMMENDED = [
  ["Scroll reveal on every section", "this is the \"fade-up everything\" pattern…"],
  ["Hover lift on feature/plan cards", "slop, plays constantly."],
] as const;

export type Verdict = { id: string; verdict: string; note: string };
export const VERDICTS: Verdict[] = [
  { id: "A1", verdict: "GO", note: "" },
  {
    id: "A2",
    verdict: "GO, with a note",
    note: "It interacts with A1: once someone has signed up, the email input is `visibility: hidden` and can't take focus. In that state, A2 will scroll to the confirmation and focus it instead.",
  },
];

export const STORYBOARD_TITLE = "A1: storyboard";
export const STORYBOARD = [
  "0ms: a valid submit. The form and hint disappear instantly…",
  "0–400ms: \"You're in. Check {email}…\" rises from 8px below out of a 4px blur.",
  "120–520ms: the check mark draws itself.",
  "Reduced motion: the confirmation and check appear in place, with no motion…",
];

export const NEXT_STEP = "Reply `go` to build, `preview A1` to see it first, or change the picks.";

export const INSTALL = "npx skills add rezianislami/skills --skill wow-moments";
