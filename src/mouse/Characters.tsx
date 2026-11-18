/**
 * Flat pastel characters and props, drawn as inline SVG. Every motion is driven by
 * `useCurrentFrame()` — nothing here uses CSS animation.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./story";
import { place, type Placed } from "../kids/kit/placement";

/* ───────────────────────────── Mouse ───────────────────────────── */

export type MouseProps = Placed & {
  kind: "country" | "city";
  /** 0 = still, 1 = full walking bounce. */
  walk?: number;
  /** Head tilt in degrees (negative = nose up). */
  headTilt?: number;
  /** Shiver amplitude in px. */
  shake?: number;
  /** 0..1 — opens a little smile into a happy "o". */
  mouthOpen?: number;
  /** Nibbling: head nods quickly. */
  nibble?: boolean;
  /** Raise the front paw in a wave. */
  wave?: boolean;
};

export const Mouse: React.FC<MouseProps> = (props) => {
  const frame = useCurrentFrame();
  const { kind, walk = 0, headTilt = 0, shake = 0, mouthOpen = 0, nibble, wave } = props;
  const fur = kind === "country" ? C.countryFur : C.cityFur;
  const belly = kind === "country" ? C.countryBelly : C.cityBelly;
  const seed = kind === "country" ? 0 : 17;

  const bob = walk * Math.abs(Math.sin((frame + seed) / 3.2)) * -14;
  const breathe = 1 + Math.sin((frame + seed) / 14) * 0.015;
  const shiver = shake ? Math.sin(frame * 2.7) * shake : 0;
  const tailSwing = Math.sin((frame + seed) / 9) * 10;
  const nod = nibble ? Math.sin(frame / 2.2) * 5 : 0;
  // blink every ~3.5s for 4 frames (offset so frame 0, used for thumbnails, is eyes-open)
  const blinking = (frame + seed * 7 + 40) % 105 < 4;
  const waveAngle = wave ? -40 + Math.sin(frame / 3) * 25 : 0;
  const stepA = walk * Math.sin((frame + seed) / 3.2) * 6;

  return (
    <div style={place(props)}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `${shiver}px ${bob}px` }}>
          {/* tail */}
          <path
            d={`M 52 160 C 20 165, 8 ${130 + tailSwing}, 18 ${108 + tailSwing}`}
            stroke={C.pinkDark}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          {/* feet */}
          <ellipse cx={78 + stepA} cy={190} rx={17} ry={7} fill={C.pinkDark} />
          <ellipse cx={122 - stepA} cy={190} rx={17} ry={7} fill={C.pinkDark} />
          {/* body */}
          <g style={{ scale: `1 ${breathe}`, transformOrigin: "100px 190px" }}>
            <ellipse cx={98} cy={146} rx={54} ry={46} fill={fur} />
            <ellipse cx={110} cy={156} rx={30} ry={28} fill={belly} />
            {kind === "city" ? (
              /* bow tie */
              <g>
                <path d="M 118 112 L 100 102 L 100 124 Z" fill={C.pinkDark} />
                <path d="M 118 112 L 136 102 L 136 124 Z" fill={C.pinkDark} />
                <circle cx={118} cy={113} r={5} fill={C.pink} />
              </g>
            ) : (
              /* little scarf */
              <path d="M 92 112 Q 120 124 146 108 L 140 120 Q 118 134 96 124 Z" fill={C.mint} />
            )}
            {/* arm */}
            <g style={{ rotate: `${waveAngle}deg`, transformOrigin: "118px 136px" }}>
              <ellipse cx={130} cy={144} rx={9} ry={16} fill={fur} style={{ rotate: "-25deg", transformOrigin: "130px 144px" }} />
            </g>
          </g>
          {/* head */}
          <g style={{ rotate: `${headTilt + nod}deg`, transformOrigin: "120px 110px" }}>
            <circle cx={106} cy={56} r={25} fill={fur} />
            <circle cx={106} cy={56} r={15} fill={C.pink} />
            <circle cx={156} cy={52} r={25} fill={fur} />
            <circle cx={156} cy={52} r={15} fill={C.pink} />
            <circle cx={132} cy={92} r={40} fill={fur} />
            <ellipse cx={166} cy={100} rx={22} ry={16} fill={fur} />
            <circle cx={186} cy={97} r={7} fill={C.pinkDark} />
            {/* eye */}
            {blinking ? (
              <path d="M 141 84 Q 148 88 155 84" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <circle cx={148} cy={83} r={6.5} fill={C.ink} />
                <circle cx={150} cy={80.5} r={2.2} fill="#fff" />
              </>
            )}
            {/* cheek */}
            <circle cx={146} cy={106} r={9} fill={C.pink} opacity={0.75} />
            {/* mouth */}
            {mouthOpen > 0.2 ? (
              <ellipse cx={170} cy={114} rx={5} ry={4 + mouthOpen * 4} fill={C.ink} />
            ) : (
              <path d="M 164 112 Q 170 117 176 112" stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            )}
            {/* whiskers */}
            <g stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" opacity={0.5}>
              <line x1={178} y1={104} x2={198} y2={100} />
              <line x1={178} y1={108} x2={198} y2={112} />
            </g>
            {/* hats */}
            {kind === "country" ? (
              <g style={{ rotate: "-12deg", transformOrigin: "128px 56px" }}>
                <ellipse cx={128} cy={62} rx={46} ry={9} fill={C.butterDark} />
                <path d="M 104 62 Q 106 30 128 30 Q 150 30 152 62 Z" fill={C.butter} />
                <rect x={104} y={52} width={48} height={7} fill={C.pinkDark} />
                <circle cx={146} cy={50} r={6} fill={C.pink} />
                <circle cx={146} cy={50} r={2.5} fill={C.butterDark} />
              </g>
            ) : (
              <g style={{ rotate: "10deg", transformOrigin: "132px 54px" }}>
                <ellipse cx={132} cy={56} rx={30} ry={6} fill={C.ink} />
                <rect x={116} y={16} width={32} height={40} rx={4} fill={C.ink} />
                <rect x={116} y={42} width={32} height={7} fill={C.pinkDark} />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Cat ───────────────────────────── */

export const Cat: React.FC<Placed & { creep?: number; pounce?: number }> = (props) => {
  const frame = useCurrentFrame();
  const { creep = 0, pounce = 0 } = props;
  const sway = Math.sin(frame / 10) * 12;
  const step = creep * Math.sin(frame / 5) * 8;
  return (
    <div style={place(props)}>
      <svg viewBox="0 -100 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${-pounce * 30}px` }}>
          <path
            d={`M 70 210 C 20 200, 10 ${120 + sway}, 40 ${80 + sway}`}
            stroke={C.catFur}
            strokeWidth={22}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={180} cy={205} rx={120} ry={62} fill={C.catFur} />
          <ellipse cx={200} cy={225} rx={70} ry={34} fill={C.cityBelly} />
          {/* legs */}
          <rect x={100 + step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={150 - step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={230 + step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          <rect x={270 - step} y={235} width={26} height={60} rx={13} fill={C.catFur} />
          {/* head */}
          <path d="M 268 108 L 282 48 L 318 92 Z" fill={C.catFur} />
          <path d="M 336 92 L 362 46 L 372 106 Z" fill={C.catFur} />
          <path d="M 280 96 L 286 66 L 304 90 Z" fill={C.pink} />
          <path d="M 344 92 L 360 64 L 364 100 Z" fill={C.pink} />
          <circle cx={322} cy={140} r={62} fill={C.catFur} />
          {/* sly eyes */}
          <ellipse cx={300} cy={130} rx={14} ry={9} fill={C.butter} />
          <ellipse cx={348} cy={130} rx={14} ry={9} fill={C.butter} />
          <ellipse cx={302} cy={130} rx={3.5} ry={8} fill={C.ink} />
          <ellipse cx={350} cy={130} rx={3.5} ry={8} fill={C.ink} />
          <path d="M 284 118 L 316 124" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M 364 118 L 332 124" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M 318 152 L 330 152 L 324 160 Z" fill={C.pinkDark} />
          <path d="M 310 166 Q 324 176 338 166" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          <g stroke={C.ink} strokeWidth={2} opacity={0.45} strokeLinecap="round">
            <line x1={280} y1={158} x2={240} y2={150} />
            <line x1={280} y1={166} x2={240} y2={170} />
            <line x1={368} y1={158} x2={398} y2={150} />
            <line x1={368} y1={166} x2={398} y2={170} />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* ───────────────────────────── Dog ───────────────────────────── */

export const Dog: React.FC<Placed & { bound?: number; bark?: boolean }> = (props) => {
  const frame = useCurrentFrame();
  const { bound = 0, bark } = props;
  const hop = bound * Math.abs(Math.sin(frame / 4)) * -40;
  const wag = Math.sin(frame / 2) * 18;
  const jaw = bark ? Math.max(0, Math.sin(frame / 3)) * 18 : 4;
  return (
    <div style={place(props)}>
      <svg viewBox="0 -80 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
        <g style={{ translate: `0px ${hop}px` }}>
          <g style={{ rotate: `${wag}deg`, transformOrigin: "70px 190px" }}>
            <path d="M 70 190 Q 30 150 40 110" stroke={C.dogFur} strokeWidth={22} fill="none" strokeLinecap="round" />
          </g>
          <ellipse cx={170} cy={205} rx={110} ry={68} fill={C.dogFur} />
          <ellipse cx={200} cy={228} rx={60} ry={34} fill={C.cream} />
          <rect x={95} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={150} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={215} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          <rect x={255} y={240} width={34} height={66} rx={16} fill={C.dogFur} />
          {/* collar */}
          <path d="M 250 160 Q 280 200 320 190" stroke={C.blue} strokeWidth={16} fill="none" strokeLinecap="round" />
          <circle cx={292} cy={202} r={10} fill={C.butterDark} />
          {/* head */}
          <circle cx={300} cy={122} r={66} fill={C.dogFur} />
          <ellipse cx={356} cy={150} rx={44} ry={30} fill={C.cream} />
          <ellipse cx={392} cy={138} rx={14} ry={11} fill={C.ink} />
          <path d={`M 340 170 Q 368 ${176 + jaw} 396 168`} stroke={C.ink} strokeWidth={4} fill={jaw > 8 ? C.pinkDark : "none"} strokeLinecap="round" />
          <circle cx={318} cy={104} r={8} fill={C.ink} />
          <circle cx={321} cy={101} r={2.6} fill="#fff" />
          {/* floppy ear */}
          <path d="M 262 70 Q 220 80 232 160 Q 262 150 280 92 Z" fill={C.trunkDark} />
          <circle cx={330} cy={132} r={10} fill={C.pink} opacity={0.7} />
        </g>
      </svg>
    </div>
  );
};
