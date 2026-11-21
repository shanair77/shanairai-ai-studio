/**
 * The code-drawn scenes of a Postcards from Africa episode: the hook (a strait map, a
 * timeline, footprints, a moonbow, a river, dead trees or penguins), the title page, the traveler's notes, and the next-stop map or the season finale. The title and
 * next-stop maps draw the season's route so far. Everything animates from the local frame.
 */

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AFRICA_PATH, HAND, MARKER, MoroccoFlag, proj } from "../styletest/shared";
import type { Episode, FlagId, TimelinePoint } from "./types";

export const PAPER = "#efe6d2";
export const INK = "#2a2a3a";
export const RED = "#b0302a";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Paper with a soft vignette and faint grain. */
export const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(120,90,40,0.18) 100%)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.25 }}>
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.35 0" />
      </filter>
      <rect width={1080} height={1920} filter="url(#paper-grain)" />
    </svg>
    {children}
  </AbsoluteFill>
);

/** Egypt's flag, simplified: red, white and black bands with the gold eagle. */
const EgyptFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
    <rect width={60} height={40} fill="#ffffff" />
    <rect width={60} height={13.33} fill="#ce1126" />
    <rect y={26.67} width={60} height={13.33} fill="#000000" />
    <path d="M 30 14.5 L 33 17 L 36.5 16 L 34 20 L 33 25 L 30 23.5 L 27 25 L 26 20 L 23.5 16 L 27 17 Z" fill="#c09300" />
  </svg>
);

/** Tanzania's flag: green and blue triangles split by a black diagonal band edged in yellow. */
const TanzaniaFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
    <rect width={60} height={40} fill="#1eb53a" />
    <path d="M 60 0 L 60 40 L 0 40 Z" fill="#00a3dd" />
    <line x1={-4} y1={42.7} x2={64} y2={-2.7} stroke="#fcd116" strokeWidth={15} />
    <line x1={-4} y1={42.7} x2={64} y2={-2.7} stroke="#000000" strokeWidth={10} />
  </svg>
);

/** Zambia's flag, simplified: green field, the orange eagle over red, black and orange stripes at the fly. */
const ZambiaFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
    <rect width={60} height={40} fill="#198a00" />
    <rect x={43.3} y={16} width={5.6} height={24} fill="#de2010" />
    <rect x={48.9} y={16} width={5.6} height={24} fill="#000000" />
    <rect x={54.5} y={16} width={5.5} height={24} fill="#ef7d00" />
    <path d="M 43 8 Q 47 4 51.5 8.5 Q 56 4 60 8 Q 56 9.5 53 11 L 52.5 14 L 50.5 14 L 50 11 Q 47 9.5 43 8 Z" fill="#ef7d00" />
  </svg>
);

/** Zimbabwe's flag, simplified: seven bands with the white triangle, red star and gold bird at the hoist. */
const ZimbabweFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => {
  const bands = ["#006400", "#ffd200", "#d40000", "#000000", "#d40000", "#ffd200", "#006400"];
  return (
    <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
      {bands.map((c, i) => (
        <rect key={i} y={(i * 40) / 7} width={60} height={40 / 7 + 0.2} fill={c} />
      ))}
      <path d="M 0 0 L 23 20 L 0 40 Z" fill="#ffffff" stroke="#000000" strokeWidth={1.2} />
      <path d="M 9 13.5 L 10.5 17.8 L 15 17.8 L 11.4 20.4 L 12.8 24.8 L 9 22.1 L 5.2 24.8 L 6.6 20.4 L 3 17.8 L 7.5 17.8 Z" fill="#d40000" />
      <path d="M 7.6 17 L 10.4 17 L 10 22 L 8 22 Z" fill="#ffd200" />
    </svg>
  );
};

/** Botswana's flag: light blue with a black band edged in white. */
const BotswanaFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
    <rect width={60} height={40} fill="#75aadb" />
    <rect y={15} width={60} height={10} fill="#ffffff" />
    <rect y={16.67} width={60} height={6.66} fill="#000000" />
  </svg>
);

/** Namibia's flag: blue and green triangles split by a red diagonal edged in white, with a golden sun. */
const NamibiaFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const b = a + Math.PI / 12;
    const c = a - Math.PI / 12;
    return `M ${12 + Math.cos(a) * 8} ${11 + Math.sin(a) * 8} L ${12 + Math.cos(b) * 4} ${11 + Math.sin(b) * 4} L ${12 + Math.cos(c) * 4} ${11 + Math.sin(c) * 4} Z`;
  }).join(" ");
  return (
    <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
      <rect width={60} height={40} fill="#009543" />
      <path d="M 0 0 L 60 0 L 0 40 Z" fill="#003580" />
      <line x1={-4} y1={42.7} x2={64} y2={-2.7} stroke="#ffffff" strokeWidth={15} />
      <line x1={-4} y1={42.7} x2={64} y2={-2.7} stroke="#d21034" strokeWidth={10} />
      <path d={rays} fill="#ffce00" />
      <circle cx={12} cy={11} r={3.6} fill="#ffce00" stroke="#003580" strokeWidth={0.6} />
    </svg>
  );
};

/** South Africa's flag: red and blue fields, a green Y edged in white, and a black triangle edged in gold at the hoist. */
const SouthAfricaFlag: React.FC<{ w?: number; border?: string }> = ({ w = 96, border = "transparent" }) => (
  <svg width={w} height={(w * 2) / 3} viewBox="0 0 60 40" style={{ borderRadius: 4, outline: `3px solid ${border}` }}>
    <rect width={60} height={20} fill="#e03c31" />
    <rect y={20} width={60} height={20} fill="#001489" />
    <path d="M -2 -1.6 L 25 20 L 62 20 M -2 41.6 L 25 20" fill="none" stroke="#ffffff" strokeWidth={13.3} />
    <path d="M -2 -1.6 L 25 20 L 62 20 M -2 41.6 L 25 20" fill="none" stroke="#007749" strokeWidth={8} />
    <path d="M 0 4.6 L 19.3 20 L 0 35.4 Z" fill="#000000" stroke="#ffb81c" strokeWidth={2.6} />
  </svg>
);

const OneFlag: React.FC<{ country: FlagId; w?: number; border?: string }> = ({ country, w, border }) =>
  country === "southafrica" ? (
    <SouthAfricaFlag w={w} border={border} />
  ) : country === "namibia" ? (
    <NamibiaFlag w={w} border={border} />
  ) : country === "botswana" ? (
    <BotswanaFlag w={w} border={border} />
  ) : country === "egypt" ? (
    <EgyptFlag w={w} border={border} />
  ) : country === "tanzania" ? (
    <TanzaniaFlag w={w} border={border} />
  ) : country === "zambia" ? (
    <ZambiaFlag w={w} border={border} />
  ) : country === "zimbabwe" ? (
    <ZimbabweFlag w={w} border={border} />
  ) : (
    <MoroccoFlag w={w} border={border} />
  );

/** One flag, or several side by side for a stop on a border. */
export const Flag: React.FC<{ country: Episode["flag"]; w?: number; border?: string }> = ({ country, w, border }) =>
  Array.isArray(country) ? (
    <div style={{ display: "flex", gap: 12 }}>
      {country.map((c) => (
        <OneFlag key={c} country={c} w={w} border={border} />
      ))}
    </div>
  ) : (
    <OneFlag country={country} w={w} border={border} />
  );

/** 0→1 draw-on progress for a stroke with pathLength={1}. */
const draw = (f: number, start: number, end: number) => interpolate(f, [start, end], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });

/* ------------------------------------------------------------------ hook: the Strait */
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const europe = "M -20 -20 L 1100 -20 L 1100 700 C 900 720, 720 790, 600 860 C 560 885, 520 900, 470 880 C 330 820, 160 760, -20 780 Z";
  const africa = "M -20 1940 L -20 1190 C 200 1160, 380 1100, 500 1030 C 530 1010, 560 1005, 600 1030 C 720 1110, 880 1150, 1100 1150 L 1100 1940 Z";
  const plane = interpolate(f, [40, 120], [-0.1, 1.1], clamp);
  const px = interpolate(plane, [0, 1], [-60, 1140]);
  const py = 950 + Math.sin(plane * Math.PI * 2) * 18;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <rect x={0} y={600} width={1080} height={650} fill="#9cc3d8" opacity={interpolate(f, [10, 40], [0, 0.45], clamp)} />
        <path d={europe} fill="#b9c79a" opacity={interpolate(f, [15, 45], [0, 0.75], clamp)} />
        <path d={africa} fill="#e2b874" opacity={interpolate(f, [15, 45], [0, 0.8], clamp)} />
        <path d={europe} fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 0, 35)} strokeLinejoin="round" />
        <path d={africa} fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 8, 43)} strokeLinejoin="round" />
        <g opacity={interpolate(f, [45, 60], [0, 1], clamp)}>
          <line x1={545} y1={898} x2={548} y2={1010} stroke={RED} strokeWidth={6} strokeLinecap="round" />
          <path d="M 530 915 L 545 893 L 560 915 M 533 993 L 548 1015 L 563 993" fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <text x={590} y={975} fontFamily={MARKER} fontSize={92} fill={RED}>14 km</text>
        </g>
        <text x={90} y={480} fontFamily={HAND} fontSize={84} fill={INK} opacity={interpolate(f, [25, 40], [0, 1], clamp)}>EUROPE</text>
        <text x={92} y={545} fontFamily={HAND} fontSize={48} fill={INK} opacity={interpolate(f, [30, 45], [0, 0.8], clamp)}>Spain</text>
        <text x={90} y={1420} fontFamily={HAND} fontSize={84} fill={INK} opacity={interpolate(f, [30, 45], [0, 1], clamp)}>AFRICA</text>
        <text x={92} y={1485} fontFamily={HAND} fontSize={48} fill={INK} opacity={interpolate(f, [35, 50], [0, 0.8], clamp)}>Morocco</text>
        <text x={640} y={780} fontFamily={HAND} fontSize={38} fill={INK} opacity={interpolate(f, [50, 65], [0, 0.7], clamp)}>Strait of Gibraltar</text>
        {plane > 0 && plane < 1 ? (
          <g>
            <path d={`M -60 950 Q ${px / 2} ${py + 30} ${px} ${py}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="10 12" opacity={0.5} />
            <path transform={`translate(${px} ${py}) rotate(${Math.cos(plane * Math.PI * 2) * 12})`} d="M 40 0 L -30 -22 L -14 0 L -30 22 Z M -14 0 L 40 0" fill="#fffbea" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
        ) : null}
      </svg>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: a timeline */
const TimelineIcon: React.FC<{ icon: TimelinePoint["icon"]; x: number; y: number }> = ({ icon, x, y }) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    {icon === "pyramid" ? (
      <>
        <path d="M -60 0 L 0 -90 L 60 0 Z" fill="#e2b874" />
        <path d="M 0 -90 L 12 0" fill="none" />
      </>
    ) : icon === "crown" ? (
      <path d="M -46 0 L -46 -50 L -24 -26 L 0 -62 L 24 -26 L 46 -50 L 46 0 Z" fill="#e8c35a" />
    ) : (
      <>
        <circle cx={0} cy={-46} r={42} fill="#f3ecd2" />
        <circle cx={-14} cy={-58} r={8} fill="none" />
        <circle cx={14} cy={-34} r={6} fill="none" />
        <path d="M 30 -10 L 52 -2 L 44 8" fill="none" />
      </>
    )}
  </g>
);

export const TimelineScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const tl = ep.timeline;
  if (!tl) return <Paper />;
  const years = tl.points.map((p) => p.year);
  const lo = Math.min(...years) - 120;
  const hi = Math.max(...years) + 60;
  const X0 = 130;
  const X1 = 950;
  const Y = 1000;
  const xOf = (yr: number) => X0 + ((yr - lo) / (hi - lo)) * (X1 - X0);
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <line x1={60} y1={Y} x2={1020} y2={Y} stroke={INK} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 0, 30)} />
        {tl.points.map((p, i) => {
          const x = xOf(p.year);
          const at = 30 + i * 16;
          const o = interpolate(f, [at, at + 10], [0, 1], clamp);
          const pop = interpolate(f, [at, at + 10], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
          const anchor = i === 0 ? "start" : i === tl.points.length - 1 ? "end" : "middle";
          const tx = i === 0 ? x - 70 : i === tl.points.length - 1 ? x + 70 : x;
          // Middle points sit on a lower row so neighbouring labels never collide.
          const lift = i === 0 || i === tl.points.length - 1 ? 0 : -150;
          return (
            <g key={p.label} opacity={o}>
              <g transform={`translate(${x} ${Y - 40}) scale(${pop * 1.6})`}>
                <TimelineIcon icon={p.icon} x={0} y={0} />
              </g>
              <circle cx={x} cy={Y} r={20} fill={RED} stroke={INK} strokeWidth={5} />
              <text x={tx} y={Y - 390 - lift} textAnchor={anchor} fontFamily={HAND} fontSize={64} fill={INK}>
                {p.label}
              </text>
              <text x={tx} y={Y - 460 - lift} textAnchor={anchor} fontFamily={MARKER} fontSize={58} fill={RED}>
                {p.sub}
              </text>
            </g>
          );
        })}
        {tl.gaps.map((g, i) => {
          const a = xOf(tl.points[i].year);
          const b = xOf(tl.points[i + 1].year);
          const at = 80 + i * 25;
          const d = `M ${a} ${Y + 60} L ${a} ${Y + 100} L ${b} ${Y + 100} L ${b} ${Y + 60}`;
          return (
            <g key={g}>
              <path d={d} fill="none" stroke={RED} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, at, at + 18)} />
              <text x={(a + b) / 2} y={Y + 190 + i * 90} textAnchor="middle" fontFamily={MARKER} fontSize={66} fill={RED} opacity={interpolate(f, [at + 12, at + 22], [0, 1], clamp)}>
                {g}
              </text>
            </g>
          );
        })}
      </svg>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: footprints */
/** One footprint pointing up (−y), heel at the origin's bottom; `left` mirrors it. */
const Footprint: React.FC<{ left: boolean }> = ({ left }) => (
  <g transform={left ? "scale(-1 1)" : undefined}>
    <path
      d="M 2 -38 C 15 -37 19 -20 15 -2 C 12 14 13 30 2 34 C -10 36 -13 22 -12 4 C -12 -14 -14 -38 2 -38 Z"
      fill="#7f7362"
      stroke="#5d5345"
      strokeWidth={2}
    />
    <ellipse cx={-6} cy={-48} rx={6.5} ry={7.5} fill="#7f7362" />
    <circle cx={4} cy={-49} r={4.2} fill="#7f7362" />
    <circle cx={11} cy={-45} r={3.6} fill="#7f7362" />
    <circle cx={16} cy={-39} r={3.2} fill="#7f7362" />
    <circle cx={19} cy={-32} r={2.8} fill="#7f7362" />
  </g>
);

/** Two trails of footprints pressed into a patch of ash one step at a time, then dated. */
export const FootprintsScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const STEPS = 9;
  const ash = "M 170 500 C 300 430, 520 470, 700 440 C 840 420, 960 470, 945 610 C 930 800, 990 1000, 950 1180 C 920 1330, 960 1420, 800 1430 C 620 1450, 420 1400, 250 1440 C 120 1450, 140 1300, 150 1150 C 160 980, 90 820, 130 680 C 150 590, 120 540, 170 500 Z";
  const trail = (dx: number, size: number, delay: number) =>
    Array.from({ length: STEPS }, (_, i) => {
      const t = i / (STEPS - 1);
      const y = 1320 - t * 760;
      const x = 540 + dx + Math.sin(t * Math.PI * 1.1) * 70;
      const heading = Math.atan2(Math.cos(t * Math.PI * 1.1) * 70 * Math.PI * 1.1, 780) * (180 / Math.PI);
      const left = i % 2 === 0;
      const side = (left ? -1 : 1) * 24 * size;
      const at = 14 + delay + i * 15;
      const press = interpolate(f, [at, at + 7], [1.35, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const o = interpolate(f, [at, at + 5], [0, 0.9], clamp);
      return (
        <g key={`${dx}-${i}`} opacity={o} transform={`translate(${x + side} ${y}) rotate(${heading}) scale(${size * press})`}>
          <Footprint left={left} />
        </g>
      );
    });
  const done = 14 + 6 + STEPS * 15;
  const labels = ep.footprints ?? { date: "", place: "" };
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <path d={ash} fill="#cfc5b4" opacity={interpolate(f, [0, 20], [0, 0.85], clamp)} />
        <path d={ash} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 0, 24)} />
        {trail(-110, 1.45, 0)}
        {trail(120, 1.1, 6)}
      </svg>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MARKER, fontSize: 92, color: RED, opacity: interpolate(f, [done, done + 12], [0, 1], clamp), translate: `0 ${interpolate(f, [done, done + 12], [20, 0], clamp)}px` }}>
          {labels.date}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK, opacity: interpolate(f, [done + 8, done + 20], [0, 1], clamp) }}>{labels.place}</div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: a moonbow */
/** Night falls on the page: the moon rises, spray climbs off the falls and a pale rainbow arcs through it. */
export const MoonbowScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const night = interpolate(f, [0, 25], [0, 1], clamp);
  const moonY = interpolate(f, [5, 70], [800, 560], { ...clamp, easing: Easing.out(Easing.cubic) });
  const arc = draw(f, 70, 125);
  const bands = ["#fff7e0", "#e9f0ff", "#f2e6ff", "#e6fff4"];
  const labels: { label: string; place: string; image?: string } = ep.moonbow ?? { label: "", place: "" };
  const done = 130;
  const stars = Array.from({ length: 34 }, (_, i) => ({ x: ((i * 197) % 1040) + 20, y: ((i * 131) % 620) + 160, r: 1.6 + ((i * 7) % 3) }));
  return (
    <Paper>
      <AbsoluteFill style={{ background: "linear-gradient(#141c3c 0%, #23305e 55%, #2e3b5e 100%)", opacity: night * 0.96 }} />
      {labels.image ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, bottom: 0, overflow: "hidden", opacity: night }}>
          <Img src={staticFile(labels.image)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%", filter: "brightness(0.5) saturate(0.45)" }} />
          <AbsoluteFill style={{ background: "#1c2a66", mixBlendMode: "multiply", opacity: 0.75 }} />
          <AbsoluteFill style={{ background: "linear-gradient(#23305e 0%, rgba(35,48,94,0) 22%)" }} />
        </div>
      ) : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        {stars.map((st, i) => (
          <circle
            key={i}
            cx={st.x}
            cy={st.y}
            r={st.r}
            fill="#fffbe8"
            opacity={interpolate(f, [10 + (i % 9) * 3, 25 + (i % 9) * 3], [0, 0.8], clamp) * (0.6 + 0.4 * Math.sin(f / 9 + i))}
          />
        ))}
        <circle cx={860} cy={moonY} r={78} fill="#fff6d8" opacity={night} />
        <circle cx={860} cy={moonY} r={130} fill="#fff6d8" opacity={night * 0.12} />
        <defs>
          <filter id="moonbow-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="moonbow-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* Spray rising from the gorge. */}
        {Array.from({ length: 9 }, (_, i) => {
          const rise = ((f * 1.6 + i * 60) % 520) / 520;
          return <ellipse key={i} cx={120 + i * 110} cy={1300 - rise * 420} rx={150 + rise * 90} ry={70 + rise * 40} fill="#dfe8ff" filter="url(#moonbow-soft)" opacity={night * 0.3 * (1 - rise)} />;
        })}
        {bands.map((c, i) => (
          <path
            key={c}
            d={`M ${110 + i * 16} 1250 A ${430 - i * 16} ${430 - i * 16} 0 0 1 ${970 - i * 16} 1250`}
            fill="none"
            stroke={c}
            strokeWidth={14}
            strokeLinecap="round"
            opacity={0.6}
            filter="url(#moonbow-glow)"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={arc}
          />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: MARKER,
            fontSize: 110,
            color: "#fff6d8",
            opacity: interpolate(f, [done, done + 12], [0, 1], clamp),
            translate: `0 ${interpolate(f, [done, done + 12], [20, 0], clamp)}px`,
          }}
        >
          {labels.label}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: "#dfe8ff", opacity: interpolate(f, [done + 8, done + 20], [0, 1], clamp) }}>{labels.place}</div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: a river into the desert */
/** A pen draws a river from rainy highlands down the page; it fans out into a delta and fades into the sand. */
export const RiverScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const labels = ep.river ?? { label: "", place: "", source: "", sink: "" };
  const main = "M 470 470 C 540 580, 400 660, 470 770 C 540 880, 450 940, 540 1010";
  const branches = [
    "M 540 1010 C 470 1100, 360 1180, 250 1260",
    "M 540 1010 C 500 1120, 430 1220, 380 1330",
    "M 540 1010 C 545 1130, 520 1240, 520 1360",
    "M 540 1010 C 590 1120, 640 1220, 670 1340",
    "M 540 1010 C 620 1090, 730 1160, 820 1250",
    "M 540 1010 C 640 1050, 780 1080, 900 1130",
  ];
  const islands = [
    [430, 1150],
    [470, 1250],
    [590, 1180],
    [640, 1280],
    [720, 1170],
    [350, 1230],
    [560, 1300],
  ];
  const sand = interpolate(f, [70, 110], [0, 1], clamp);
  const done = 130;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="river-fade" x1="0" y1="1010" x2="0" y2="1380" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4f8fc9" stopOpacity={1} />
            <stop offset="1" stopColor="#4f8fc9" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {/* The Kalahari: a wash of sand under the delta. */}
        <ellipse cx={560} cy={1260} rx={470} ry={250} fill="#e2c48e" opacity={sand * 0.7} />
        <text x={760} y={1470} fontFamily={HAND} fontSize={56} fill="#9a6b2f" opacity={sand}>
          {labels.sink}
        </text>
        {/* Rainy highlands where the river rises. */}
        <path d="M 250 470 Q 330 390 410 450 Q 470 380 560 440 Q 640 380 720 470 Z" fill="#9fb07a" opacity={interpolate(f, [0, 15], [0, 0.8], clamp)} />
        {Array.from({ length: 12 }, (_, i) => {
          const fall = ((f * 9 + i * 37) % 90) / 90;
          return <line key={i} x1={280 + i * 38} y1={300 + fall * 120} x2={274 + i * 38} y2={322 + fall * 120} stroke="#4f8fc9" strokeWidth={4} strokeLinecap="round" opacity={interpolate(f, [0, 15], [0, 0.7], clamp) * (1 - fall)} />;
        })}
        <text x={740} y={440} fontFamily={HAND} fontSize={56} fill={INK} opacity={interpolate(f, [5, 20], [0, 1], clamp)}>
          {labels.source}
        </text>
        <path d={main} fill="none" stroke="#4f8fc9" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 10, 60)} />
        {branches.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="url(#river-fade)" strokeWidth={11 - i * 0.6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 60 + i * 4, 105 + i * 4)} />
        ))}
        {islands.map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={22} ry={13} fill="#7fa65a" opacity={interpolate(f, [95 + i * 3, 105 + i * 3], [0, 0.85], clamp)} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MARKER, fontSize: 92, color: RED, opacity: interpolate(f, [done, done + 12], [0, 1], clamp), translate: `0 ${interpolate(f, [done, done + 12], [20, 0], clamp)}px` }}>
          {labels.label}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK, opacity: interpolate(f, [done + 8, done + 20], [0, 1], clamp) }}>{labels.place}</div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: dead trees on a clay pan */
/** A pen draws a white clay pan under a red dune, then black, bare trees; an age tag swings onto one. */
export const TreesScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const labels = ep.trees ?? { label: "", place: "", tag: "" };
  const wash = interpolate(f, [0, 25], [0, 1], clamp);
  const trees = [
    { x: 520, base: 1300, s: 1.75, at: 25 },
    { x: 190, base: 1215, s: 0.95, at: 40 },
    { x: 880, base: 1240, s: 1.05, at: 50 },
  ];
  const tree =
    "M 0 0 L -6 -120 L -40 -200 M -6 -120 L 18 -230 L -8 -310 M 18 -230 L 70 -290 M -40 -200 L -90 -235 M -40 -200 L -55 -260 M 70 -290 L 110 -300 M 70 -290 L 80 -340 M -8 -310 L 20 -360";
  const swing = interpolate(f, [95, 130], [-38, 0], { ...clamp, easing: Easing.out(Easing.elastic(1.2)) });
  const tagIn = interpolate(f, [90, 100], [0, 1], clamp);
  const done = 130;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <rect x={0} y={420} width={1080} height={520} fill="#2f5fb3" opacity={wash * 0.85} />
        <defs>
          <linearGradient id="dune-wash" x1="0" y1="520" x2="1080" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e88a45" />
            <stop offset="0.55" stopColor="#d36a32" />
            <stop offset="1" stopColor="#9c4a2b" />
          </linearGradient>
        </defs>
        <path d="M -40 1000 Q 200 600 420 520 Q 640 600 760 760 Q 900 700 1120 820 L 1120 1000 Z" fill="url(#dune-wash)" opacity={wash} />
        <path d="M 420 520 Q 560 700 640 1000" fill="none" stroke="#a5532a" strokeWidth={4} opacity={wash * 0.6} />
        <rect x={0} y={990} width={1080} height={420} fill="#f1ece1" opacity={wash} />
        {[[90, 1060, 260, 1110], [300, 1150, 480, 1100], [560, 1180, 760, 1140], [800, 1080, 1000, 1130], [180, 1290, 420, 1330], [620, 1300, 900, 1270]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M ${x1} ${y1} L ${(x1 + x2) / 2} ${y1 + 18} L ${x2} ${y2}`} fill="none" stroke="#c9bca5" strokeWidth={3} opacity={wash} />
        ))}
        {trees.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.base}) scale(${t.s})`}>
            <path d={tree} fill="none" stroke="#1d1a17" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, t.at, t.at + 35)} />
          </g>
        ))}
        {/* The age tag, hung from the big tree's branch on a string. */}
        <g transform={`translate(${520 + 70 * 1.75} ${1300 - 290 * 1.75}) rotate(${swing})`} opacity={tagIn}>
          <line x1={0} y1={0} x2={0} y2={60} stroke={INK} strokeWidth={4} />
          <path d="M -140 60 L 140 60 L 140 170 L -140 170 Z" fill="#fbf6ea" stroke={INK} strokeWidth={5} />
          <circle cx={0} cy={78} r={8} fill="none" stroke={INK} strokeWidth={4} />
          <text x={0} y={150} textAnchor="middle" fontFamily={MARKER} fontSize={60} fill={RED}>
            {labels.tag}
          </text>
        </g>
      </svg>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MARKER, fontSize: 100, color: RED, opacity: interpolate(f, [done, done + 12], [0, 1], clamp), translate: `0 ${interpolate(f, [done, done + 12], [20, 0], clamp)}px` }}>
          {labels.label}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK, opacity: interpolate(f, [done + 8, done + 20], [0, 1], clamp) }}>{labels.place}</div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ hook: penguins on an African beach */
export const PenguinsScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const labels = ep.penguins ?? { label: "", place: "", image: "" };
  const wash = interpolate(f, [0, 25], [0, 1], clamp);
  // Penguins waddle in from the left one by one: feet position, width and entry frame.
  const birds = [
    { x: 300, y: 1330, w: 175, at: 18 },
    { x: 520, y: 1265, w: 140, at: 34 },
    { x: 720, y: 1340, w: 165, at: 50 },
    { x: 890, y: 1255, w: 125, at: 66 },
  ];
  const walk = 42;
  const h = 1942 / 936;
  const quip = interpolate(f, [walk + 70, walk + 80], [0, 1], clamp);
  const done = 135;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <rect x={0} y={420} width={1080} height={330} fill="#8fc3e6" opacity={wash * 0.8} />
        <rect x={0} y={740} width={1080} height={260} fill="#2fb0b8" opacity={wash * 0.85} />
        {[[60, 800, 330], [420, 850, 700], [760, 790, 1020], [150, 930, 480], [600, 950, 900]].map(([x1, y, x2], i) => (
          <path key={i} d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 14} ${x2} ${y}`} fill="none" stroke="#e8f7f6" strokeWidth={4} strokeLinecap="round" opacity={wash * 0.8} />
        ))}
        <path d="M 0 990 Q 270 960 540 985 Q 810 1010 1080 975 L 1080 1410 L 0 1410 Z" fill="#f3e6c8" opacity={wash} />
        <path d="M 0 990 Q 270 960 540 985 Q 810 1010 1080 975" fill="none" stroke="#ffffff" strokeWidth={10} opacity={wash * 0.9} />
        <path d="M 0 990 Q 270 960 540 985 Q 810 1010 1080 975" fill="none" stroke={INK} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 4, 30)} />
        <line x1={0} y1={742} x2={1080} y2={742} stroke={INK} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 0, 24)} />
        {/* Granite boulders at both ends of the cove. */}
        {[
          "M -40 1010 Q -50 760 120 700 Q 260 660 300 820 Q 330 960 250 1015 Z",
          "M 180 1030 Q 200 900 300 900 Q 400 905 400 1000 Q 400 1040 330 1045 Z",
          "M 1120 1000 Q 1130 720 960 690 Q 820 680 790 830 Q 770 960 850 1005 Z",
          "M 700 1010 Q 700 930 770 925 Q 850 925 860 990 Q 860 1020 800 1025 Z",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="#b9b0a2" opacity={wash} />
            <path d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw(f, 8 + i * 6, 38 + i * 6)} />
          </g>
        ))}
      </svg>
      {birds.map((b, i) => {
        const t = interpolate(f, [b.at, b.at + walk], [0, 1], clamp);
        const x = interpolate(t, [0, 1], [-160 - i * 40, b.x], { easing: Easing.out(Easing.quad) });
        const moving = t > 0 && t < 1;
        const rot = moving ? Math.sin(f * 0.6 + i) * 8 : Math.sin(f * 0.12 + i * 2) * 2;
        const bob = moving ? -Math.abs(Math.sin(f * 0.6 + i)) * 10 : 0;
        return (
          <Img
            key={i}
            src={staticFile(labels.image)}
            style={{
              position: "absolute",
              left: x - b.w / 2,
              top: b.y - b.w * h + bob,
              width: b.w,
              rotate: `${rot}deg`,
              transformOrigin: "50% 100%",
              opacity: f >= b.at ? 1 : 0,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 600, top: 470, fontFamily: MARKER, fontSize: 104, color: RED, rotate: "-8deg", opacity: quip, scale: `${interpolate(quip, [0, 1], [1.4, 1])}` }}>
        Africa?!
      </div>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MARKER, fontSize: 100, color: RED, opacity: interpolate(f, [done, done + 12], [0, 1], clamp), translate: `0 ${interpolate(f, [done, done + 12], [20, 0], clamp)}px` }}>
          {labels.label}
        </div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK, opacity: interpolate(f, [done + 8, done + 20], [0, 1], clamp) }}>{labels.place}</div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ Africa map helpers */
const MapAfrica: React.FC<{ x: number; y: number; scale: number; drawStart?: number; children?: React.ReactNode }> = ({
  x,
  y,
  scale,
  drawStart = 0,
  children,
}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={AFRICA_PATH} fill="#e2b874" opacity={interpolate(f, [drawStart + 20, drawStart + 45], [0, 0.65], clamp)} />
      <path
        d={AFRICA_PATH}
        fill="none"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw(f, drawStart, drawStart + 40)}
      />
      {children}
    </g>
  );
};

const Pin: React.FC<{ lonLat: [number, number]; appear: number; color?: string }> = ({ lonLat, appear, color = RED }) => {
  const f = useCurrentFrame();
  const p = proj(lonLat[0], lonLat[1]);
  const pulse = ((f - appear) % 40) / 40;
  const o = interpolate(f, [appear, appear + 8], [0, 1], clamp);
  return (
    <g opacity={o}>
      <circle cx={p.x} cy={p.y} r={4 + pulse * 10} fill="none" stroke={color} strokeWidth={1.4} opacity={f > appear ? 1 - pulse : 0} />
      <circle cx={p.x} cy={p.y} r={4.5} fill={color} stroke={INK} strokeWidth={1.2} />
    </g>
  );
};

/** The season so far: dashed line through every earlier stop and grey pins on each. */
const SeasonRoute: React.FC<{ stops: [number, number][] }> = ({ stops }) => {
  if (stops.length < 2) return stops.length === 1 ? <Pin lonLat={stops[0]} appear={0} color="#7a7a7a" /> : null;
  const pts = stops.map(([lo, la]) => proj(lo, la));
  const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(pts[i - 1].x + p.x) / 2} ${Math.min(pts[i - 1].y, p.y) - 26} ${p.x} ${p.y}`)).join(" ");
  return (
    <>
      <path d={d} fill="none" stroke="#7a7a7a" strokeWidth={1.4} strokeDasharray="4 3" />
      {stops.slice(0, -1).map((s, i) => (
        <Pin key={i} lonLat={s} appear={0} color="#7a7a7a" />
      ))}
    </>
  );
};

/** The passport stamp, slamming down at `at` frames. */
export const Stamp: React.FC<{ at: number; line1: string; line2: string; line3: string; x: number; y: number; rotate?: number; line2Size?: number }> = ({
  at,
  line2Size,
  line1,
  line2,
  line3,
  x,
  y,
  rotate = -12,
}) => {
  const f = useCurrentFrame();
  const slam = interpolate(f, [at, at + 8], [2.3, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const o = interpolate(f, [at, at + 5], [0, 0.92], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 300,
        height: 300,
        borderRadius: "50%",
        border: `10px double ${RED}`,
        color: RED,
        fontFamily: MARKER,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        lineHeight: 1,
        rotate: `${rotate}deg`,
        scale: `${slam}`,
        opacity: o,
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 3 }}>{line1}</div>
      <div style={{ fontSize: line2Size ?? (line2.length > 9 ? Math.round((56 * 9) / line2.length) : 56), margin: "12px 0" }}>{line2}</div>
      <div style={{ fontSize: 26, letterSpacing: 2 }}>{line3}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ title */
export const TitleScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = interpolate(f, [35, 55], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const stop = String(ep.number).padStart(2, "0");
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <MapAfrica x={190} y={560} scale={3.5}>
          <SeasonRoute stops={[...ep.route, ep.pin]} />
          <Pin lonLat={ep.pin} appear={45} />
        </MapAfrica>
      </svg>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", opacity: titleIn, translate: `0 ${(1 - titleIn) * 30}px` }}>
        <div style={{ fontFamily: MARKER, fontSize: 92, color: INK, lineHeight: 1.05 }}>Postcards</div>
        <div style={{ fontFamily: HAND, fontSize: 64, color: RED }}>from Africa</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1400,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          opacity: interpolate(f, [55, 70], [0, 1], clamp),
        }}
      >
        <Flag country={ep.flag} w={Array.isArray(ep.flag) ? 80 : 96} border={INK} />
        <div style={{ fontFamily: HAND, fontSize: ep.country.length > 10 ? 62 : 76, color: INK }}>
          Stop {stop} · {ep.country}
        </div>
      </div>
      <Stamp at={Math.round(4.4 * fps)} line1="★ STAMPED ★" line2={ep.country.toUpperCase()} line3={`STOP ${stop} · AFRICA`} x={700} y={1540} />
    </Paper>
  );
};

/* ------------------------------------------------------------------ traveler's notes */
export const NotesScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineGap = 64;
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "190px 70px 120px" }}>
        <div
          style={{
            position: "relative",
            height: "100%",
            background: `repeating-linear-gradient(#fbf6ea 0px, #fbf6ea ${lineGap - 2}px, #c9d6e8 ${lineGap - 2}px, #c9d6e8 ${lineGap}px)`,
            boxShadow: "6px 10px 26px rgba(0,0,0,0.22)",
            padding: "70px 60px 60px 110px",
            rotate: "-0.8deg",
          }}
        >
          <div style={{ position: "absolute", left: 80, top: 0, bottom: 0, width: 3, background: "#e3a6a6" }} />
          <div style={{ fontFamily: MARKER, fontSize: 54, color: RED, marginBottom: 40 }}>{ep.notes.title}</div>
          {ep.notes.items.map(([k, v], i) => {
            const at = Math.round((0.8 + i * 1.15) * fps);
            const o = interpolate(f, [at, at + 10], [0, 1], clamp);
            const tick = draw(f, at, at + 8);
            return (
              <div key={k} style={{ display: "flex", gap: 22, marginBottom: 46, opacity: o, translate: `${(1 - o) * -20}px 0` }}>
                <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0, marginTop: 4 }}>
                  <path d="M 8 30 L 22 44 L 48 10" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={tick} />
                </svg>
                <div style={{ fontFamily: HAND, fontSize: 52, color: INK, lineHeight: 1.18 }}>
                  <span style={{ color: RED }}>{k}:</span> {v}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

/* ------------------------------------------------------------------ next stop */
export const NextScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!ep.next) return <FinaleScene ep={ep} />;
  const a = proj(ep.pin[0], ep.pin[1]);
  const b = proj(ep.next.pin[0], ep.next.pin[1]);
  const route = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 26} ${b.x} ${b.y}`;
  const routeDraw = draw(f, 10, 55);
  const next = String(ep.number + 1).padStart(2, "0");
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <MapAfrica x={190} y={560} scale={3.5} drawStart={-60}>
          <SeasonRoute stops={[...ep.route, ep.pin]} />
          <path d={route} fill="none" stroke={RED} strokeWidth={1.6} strokeDasharray="4 3" opacity={0.9} />
          <path d={route} fill="none" stroke={PAPER} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={routeDraw - 1} />
          <Pin lonLat={ep.pin} appear={0} color="#7a7a7a" />
          <Pin lonLat={ep.next.pin} appear={52} />
          <g transform={`translate(${ep.next.doodle === "waterfall" ? b.x - 34 : b.x + 4} ${ep.next.doodle === "waterfall" ? b.y - 20 : b.y - 22})`} opacity={interpolate(f, [55, 70], [0, 1], clamp)}>
            {ep.next.doodle === "pyramids" ? (
              <path d="M 0 14 L 9 0 L 18 14 Z M 12 14 L 19 4 L 26 14 Z" fill="#e2b874" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
            ) : ep.next.doodle === "tablemountain" ? (
              <path d="M 0 16 L 5 6 L 19 6 L 24 16 Z" fill="#8a9a6a" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
            ) : ep.next.doodle === "dunes" ? (
              <path d="M 0 16 Q 6 4 12 10 Q 17 2 24 16 Z" fill="#d9773b" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
            ) : ep.next.doodle === "delta" ? (
              <>
                <path d="M 2 2 Q 8 6 10 10 M 10 10 Q 6 14 1 16 M 10 10 Q 12 15 10 19 M 10 10 Q 16 13 22 14 M 10 10 Q 15 7 21 6" fill="none" stroke="#5b9bd5" strokeWidth={1.4} strokeLinecap="round" />
                <path d="M 15 18 L 15 12 M 17 18 L 18 11 M 19 18 L 21 13" stroke="#5f8f3a" strokeWidth={0.9} strokeLinecap="round" />
              </>
            ) : ep.next.doodle === "waterfall" ? (
              <>
                <path d="M 7 2 L 17 2 L 17 14 L 7 14 Z" fill="#9cc3d8" stroke={INK} strokeWidth={0.6} />
                <path d="M 9.5 3.5 L 9.5 12.5 M 12 3.5 L 12 12.5 M 14.5 3.5 L 14.5 12.5" stroke="#ffffff" strokeWidth={0.8} strokeLinecap="round" />
                <path d="M 0 16 L 0 2 L 7 2 L 7 16 Z M 17 16 L 17 2 L 24 2 L 24 16 Z" fill="#9a8a7a" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
                <ellipse cx={12} cy={14.5} rx={6.5} ry={2.4} fill="#ffffff" stroke={INK} strokeWidth={0.5} />
              </>
            ) : (
              <>
                <path d="M 0 16 L 12 0 L 24 16 Z" fill="#9a8a7a" stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
                <path d="M 8.2 5 L 12 0 L 15.8 5 L 13.5 4 L 12 6 L 10.5 4 Z" fill="#ffffff" stroke={INK} strokeWidth={0.6} strokeLinejoin="round" />
              </>
            )}
          </g>
        </MapAfrica>
      </svg>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [5, 20], [0, 1], clamp) }}>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK }}>Next stop</div>
        <div style={{ fontFamily: MARKER, fontSize: 120, color: RED, lineHeight: 1.05 }}>{ep.next.country}</div>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 56, color: INK, opacity: interpolate(f, [60, 75], [0, 1], clamp) }}>
        {ep.series} · Stop {next}
      </div>
      <Stamp at={Math.round(3.2 * fps)} line1="★ VISITED ★" line2={ep.country.toUpperCase()} line3={`STOP ${String(ep.number).padStart(2, "0")} · AFRICA`} x={390} y={1530} rotate={10} />
    </Paper>
  );
};

/* ------------------------------------------------------------------ season finale */
/** A season's last page: the whole route draws stop by stop, every pin lights up, and the season is stamped complete. */
export const FinaleScene: React.FC<{ ep: Episode }> = ({ ep }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stops = [...ep.route, ep.pin];
  const pts = stops.map(([lo, la]) => proj(lo, la));
  const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(pts[i - 1].x + p.x) / 2} ${Math.min(pts[i - 1].y, p.y) - 26} ${p.x} ${p.y}`)).join(" ");
  const start = 20;
  const step = 16;
  const end = start + (stops.length - 1) * step;
  const season = ep.finale?.season ?? 1;
  return (
    <Paper>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <MapAfrica x={190} y={560} scale={3.5} drawStart={-60}>
          <path d={d} fill="none" stroke={RED} strokeWidth={1.8} strokeDasharray="4 3" />
          <path d={d} fill="none" stroke={PAPER} strokeWidth={3.4} pathLength={1} strokeDasharray={1} strokeDashoffset={interpolate(f, [start, end], [0, -1], clamp)} />
          {stops.map((s, i) => (
            <Pin key={i} lonLat={s} appear={start + i * step} />
          ))}
        </MapAfrica>
      </svg>
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center", opacity: interpolate(f, [5, 20], [0, 1], clamp) }}>
        <div style={{ fontFamily: HAND, fontSize: 64, color: INK }}>That's a wrap on</div>
        <div style={{ fontFamily: MARKER, fontSize: 120, color: RED, lineHeight: 1.05 }}>Season {season}</div>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, textAlign: "center", fontFamily: HAND, fontSize: 56, color: INK, opacity: interpolate(f, [end, end + 15], [0, 1], clamp) }}>
        {stops.length} stops across Africa
      </div>
      <Stamp at={Math.round(5.2 * fps)} line1={`★ SEASON ${season} ★`} line2="COMPLETE" line2Size={44} line3={`${stops.length} STOPS · AFRICA`} x={390} y={1530} rotate={-8} />
    </Paper>
  );
};
