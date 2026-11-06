import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import {
  INSTALL,
  MENU_ROWS,
  MENU_SECTION,
  MENU_TITLE,
  NEXT_STEP,
  NOT_RECOMMENDED,
  PICK,
  PROMPT,
  SCANNED,
  STORYBOARD,
  STORYBOARD_TITLE,
  VERDICTS,
} from "./data";

const { fontFamily: sans } = loadGeist("normal", { weights: ["400", "600"], subsets: ["latin"] });
const { fontFamily: mono } = loadGeistMono("normal", { weights: ["400", "600"], subsets: ["latin"] });

// Rezi UI tokens (light page, dark terminal), taken from the shared Pencil file
// so the video matches the README banner.
const C = {
  page: "#fbfbfb",
  pageText: "#0a0a0a",
  pageMuted: "#6f6f6f",
  term: "#0f0f0f",
  termBar: "#060606",
  hairline: "#262626",
  text: "#f5f5f5",
  muted: "#a1a1a1",
  keyword: "#79b8ff",
  runner: "#ffab70",
  success: "#00d492",
  primary: "#0063d7",
};

const FPS = 30;
// Scene boundaries in frames. Each scene owns the terminal body while it plays.
const T = { prompt: 0, menu: 90, pick: 390, verdict: 450, end: 690, total: 780 };

const out = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// Fades a scene in over its first 10 frames and out over its last 10, so scene
// swaps inside the terminal read as one continuous session.
const sceneOpacity = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], out);

const typed = (text: string, frame: number, start: number, cps = 32) =>
  text.slice(0, Math.max(0, Math.floor(((frame - start) / FPS) * cps)));

const Caret: React.FC<{ frame: number }> = ({ frame }) => (
  <span style={{ opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0, color: C.text }}>▍</span>
);

const PromptLine: React.FC<{ text: string; frame: number; start: number }> = ({ text, frame, start }) => {
  const shown = typed(text, frame, start);
  return (
    <div style={{ color: C.text }}>
      <span style={{ color: C.keyword }}>❯ </span>
      {shown}
      {shown.length < text.length ? <Caret frame={frame} /> : null}
    </div>
  );
};

const PromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = T.menu - T.prompt;
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration), padding: "28px 34px", gap: 14 }}>
      <PromptLine text={PROMPT} frame={frame} start={4} />
      <Interactive.Div
        name="Skill loaded"
        style={{ color: C.muted, opacity: interpolate(frame, [48, 58], [0, 1], { ...out, easing: easeOut }) }}
      >
        <span style={{ color: C.success }}>⏺ </span>Skill(wow-moments) · scanning{" "}
        {SCANNED.slice(0, Math.max(0, Math.floor((frame - 52) / 6))).join(" · ")}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const MenuScene: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = T.pick - T.menu;
  // After every row is in, the starred picks light up and the rest step back:
  // that contrast is the point of the scene (many found, few recommended).
  const focus = interpolate(frame, [120, 140], [0, 1], { ...out, easing: easeOut });
  const grid = { display: "grid", gridTemplateColumns: "70px 1fr 140px 60px", alignItems: "center" } as const;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration), padding: "26px 34px" }}>
      <div style={{ color: C.text, fontWeight: 600 }}>## {MENU_TITLE}</div>
      <div style={{ color: C.muted, marginTop: 8 }}>### {MENU_SECTION}</div>

      <div style={{ ...grid, color: C.muted, marginTop: 16, paddingBottom: 6, borderBottom: `1px solid ${C.hairline}` }}>
        <span>ID</span>
        <span>Moment</span>
        <span>Tier</span>
        <span style={{ textAlign: "right" }}>Score</span>
      </div>

      {MENU_ROWS.map((row, i) => {
        const enter = interpolate(frame, [14 + i * 5, 26 + i * 5], [0, 1], { ...out, easing: easeOut });
        return (
          <Interactive.Div
            key={row.id}
            name={`Row ${row.id}`}
            style={{
              ...grid,
              padding: "6px 10px",
              margin: "2px -10px",
              borderRadius: 8,
              color: C.text,
              opacity: enter * (row.star ? 1 : 1 - 0.55 * focus),
              translate: `0px ${(1 - enter) * 8}px`,
              backgroundColor: row.star ? `rgba(0, 99, 215, ${0.32 * focus})` : "transparent",
            }}
          >
            <span style={{ color: C.keyword }}>
              {row.id}
              {row.star ? " ★" : ""}
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16 }}>
              {row.moment}
            </span>
            <span style={{ color: row.star ? C.runner : C.muted }}>{row.tier}</span>
            <span style={{ textAlign: "right" }}>{row.score}</span>
          </Interactive.Div>
        );
      })}

      <Interactive.Div
        name="Considered, not recommended"
        style={{ marginTop: 22, color: C.muted, opacity: interpolate(frame, [150, 165], [0, 1], out) }}
      >
        <div style={{ color: C.text }}>### Considered, not recommended</div>
        {NOT_RECOMMENDED.map(([what, why]) => (
          <div key={what} style={{ marginTop: 6 }}>
            - {what}: {why}
          </div>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="Budget chip"
        style={{
          position: "absolute",
          top: 24,
          right: 30,
          fontFamily: sans,
          fontSize: 19,
          fontWeight: 600,
          color: "#ffffff",
          backgroundColor: C.primary,
          padding: "8px 16px",
          borderRadius: 999,
          opacity: interpolate(frame, [135, 150], [0, 1], { ...out, easing: easeOut }),
          scale: interpolate(frame, [135, 150], [0.92, 1], { ...out, easing: easeOut }),
        }}
      >
        7 found · 2 recommended
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const PickScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, T.verdict - T.pick), padding: "28px 34px" }}>
      <PromptLine text={PICK} frame={frame} start={8} />
    </AbsoluteFill>
  );
};

const VerdictScene: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = T.end - T.verdict;
  const appear = (from: number) => interpolate(frame, [from, from + 12], [0, 1], { ...out, easing: easeOut });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration), padding: "26px 34px" }}>
      <div style={{ color: C.muted }}>
        <span style={{ color: C.keyword }}>❯ </span>
        {PICK}
      </div>
      <div style={{ color: C.text, fontWeight: 600, marginTop: 16 }}>## Verdict</div>

      {VERDICTS.map((v, i) => (
        <Interactive.Div
          key={v.id}
          name={`Verdict ${v.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "70px 210px 1fr",
            marginTop: 12,
            color: C.text,
            opacity: appear(12 + i * 14),
          }}
        >
          <span style={{ color: C.keyword }}>{v.id}</span>
          <span style={{ color: v.note ? C.runner : C.success, fontWeight: 600 }}>{v.verdict}</span>
          <span style={{ color: C.muted }}>{v.note}</span>
        </Interactive.Div>
      ))}

      <Interactive.Div name="Storyboard" style={{ marginTop: 22, opacity: appear(60) }}>
        <div style={{ color: C.text, fontWeight: 600 }}>{STORYBOARD_TITLE}</div>
        {STORYBOARD.map((line, i) => (
          <div key={line} style={{ color: C.muted, marginTop: 6, opacity: appear(66 + i * 8) }}>
            - {line}
          </div>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="Next step"
        style={{ marginTop: 24, color: C.text, opacity: appear(130), borderTop: `1px solid ${C.hairline}`, paddingTop: 14 }}
      >
        {NEXT_STEP}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const Terminal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Terminal"
      style={{
        position: "absolute",
        inset: 40,
        backgroundColor: C.term,
        borderRadius: 16,
        border: `1px solid ${C.hairline}`,
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.18)",
        overflow: "hidden",
        fontFamily: mono,
        fontSize: 18,
        lineHeight: 1.5,
        opacity: interpolate(frame, [T.end, T.end + 14], [1, 0], out),
        scale: interpolate(frame, [T.end, T.end + 14], [1, 0.97], { ...out, easing: easeOut }),
      }}
    >
      <div
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          backgroundColor: C.termBar,
          borderBottom: `1px solid ${C.hairline}`,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: c }} />
        ))}
        <span style={{ marginLeft: 12, color: C.muted, fontSize: 14 }}>landing-page — claude</span>
      </div>
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, bottom: 0 }}>{children}</div>
    </Interactive.Div>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [6, 22], [0, 1], { ...out, easing: easeOut });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22, opacity: appear }}>
      <div style={{ fontFamily: sans, fontSize: 64, fontWeight: 600, color: C.pageText, letterSpacing: -1.5 }}>
        wow-moments
      </div>
      <div style={{ fontFamily: sans, fontSize: 26, color: C.pageMuted }}>
        Finds the moments worth animating. You pick, then it builds.
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 22,
          color: C.text,
          backgroundColor: C.term,
          padding: "14px 22px",
          borderRadius: 12,
          marginTop: 10,
        }}
      >
        <span style={{ color: C.runner }}>$ </span>
        {INSTALL}
      </div>
      <div style={{ fontFamily: sans, fontSize: 17, color: C.pageMuted, marginTop: 18 }}>
        Real output from a run on the landing-page fixture, abridged. Build step not shown.
      </div>
    </AbsoluteFill>
  );
};

export const WowMomentsDemo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.page }}>
    <Terminal>
      <Sequence name="Prompt" from={T.prompt} durationInFrames={T.menu - T.prompt} layout="none">
        <PromptScene />
      </Sequence>
      <Sequence name="Menu" from={T.menu} durationInFrames={T.pick - T.menu} layout="none">
        <MenuScene />
      </Sequence>
      <Sequence name="Pick" from={T.pick} durationInFrames={T.verdict - T.pick} layout="none">
        <PickScene />
      </Sequence>
      <Sequence name="Verdict" from={T.verdict} durationInFrames={T.end - T.verdict} layout="none">
        <VerdictScene />
      </Sequence>
    </Terminal>
    <Sequence name="End card" from={T.end} durationInFrames={T.total - T.end} layout="none">
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Composition
    id="WowMomentsDemo"
    component={WowMomentsDemo}
    durationInFrames={T.total}
    fps={FPS}
    width={1280}
    height={720}
  />
);
