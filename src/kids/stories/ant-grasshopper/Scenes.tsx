/**
 * The Ant and the Grasshopper — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Placed } from "../../kit";
import { AC, Ant, Butterfly, Grasshopper, PhoneTripod, toScene, type Carry } from "./Characters";
import { Anthill, CosyRoom, FallingLeaves, Field, GROUND_Y, Snowfall } from "./Backgrounds";
import type { Scene } from "./story";

type SceneProps = { scene: Scene };

const useCue = (scene: Scene) => {
  const { fps } = useVideoConfig();
  return (p: string) => cueFrame(scene, p, fps);
};

/** Pop in at `a`, out at `b`. */
const inOut = (frame: number, a: number, b: number) => popAt(frame, a, 8) * interpolate(frame, [b - 6, b], [1, 0], clamp);

const GH_SIZE = 470;
const ANT_SIZE = 290;
const FEET = GROUND_Y + 10;

/** Where the grasshopper's head top is, for bubbles. */
const ghHead = (p: Placed) => toScene({ size: GH_SIZE, ...p }, { x: 222, y: 70 });
const antHead = (p: Placed) => toScene({ size: ANT_SIZE, ...p }, { x: 242, y: 90 });

/** Music notes floating up from (x, y). */
const MusicNotes: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const colors = [C.pinkDark, C.lavenderDark, C.leafDark, C.butterDark];
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + i * 22) % 88) / 88;
        return (
          <svg
            key={i}
            viewBox="0 0 40 50"
            width={54}
            height={66}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 6 + i) * 50 + i * 24,
              top: y - t * 260,
              opacity: opacity * interpolate(t, [0, 0.15, 0.8, 1], [0, 1, 1, 0]),
              rotate: `${Math.sin(t * 5 + i) * 15}deg`,
            }}
          >
            <ellipse cx={12} cy={40} rx={10} ry={8} fill={colors[i]} />
            <rect x={19} y={6} width={5} height={34} fill={colors[i]} />
            {i % 2 ? <path d="M 24 6 Q 38 10 34 24 Q 30 14 24 14 Z" fill={colors[i]} /> : null}
          </svg>
        );
      })}
    </>
  );
};

/** An empty little bowl, feet at (x, y). */
const EmptyBowl: React.FC<{ x: number; y: number; pop: number }> = ({ x, y, pop }) => (
  <svg viewBox="0 0 120 60" width={150} height={75} style={{ position: "absolute", left: x - 75, top: y - 75, scale: `${pop}`, transformOrigin: "50% 100%" }}>
    <path d="M 6 14 Q 60 90 114 14 Z" fill={C.lavender} />
    <ellipse cx={60} cy={14} rx={54} ry={10} fill={C.lavenderDark} />
    <ellipse cx={60} cy={14} rx={44} ry={6} fill={AC.snowShade} />
  </svg>
);

/** A marching line of worker ants from -200 to `stopX`, looping. */
const AntLine: React.FC<{ stopX: number; n?: number; speed?: number; items?: Carry[]; y?: number; size?: number }> = ({
  stopX,
  n = 4,
  speed = 3.2,
  items = ["seed", "berry", "leaf", "seed"],
  y = FEET,
  size = ANT_SIZE * 0.85,
}) => {
  const frame = useCurrentFrame();
  const span = stopX + 260;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = -200 + ((frame * speed + (i * span) / n) % span);
        const fade = interpolate(x, [stopX - 80, stopX], [1, 0], clamp);
        return <Ant key={i} x={x} y={y} size={size} walk={1} carry={items[i % items.length]} seed={i * 3} opacity={fade} />;
      })}
    </>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Ant", es: "La Hormiga" }), t({ en: "and the", es: "y el" }), t({ en: "Grasshopper", es: "Saltamontes" })];
  return (
    <Field season="summer" trees={[1760]} sunflowers={[120, 250]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 280 }}>
        <div
          style={{
            background: C.cream,
            borderRadius: 64,
            padding: "46px 110px 56px",
            boxShadow: "0 16px 0 rgba(94,75,110,0.12)",
            textAlign: "center",
            scale: `${interpolate(frame, [0, 16], [0.6, 1], { ...clamp, easing: easeOut })}`,
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        >
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                fontSize: i === 1 ? 64 : 118,
                fontWeight: 700,
                color: i === 0 ? AC.antDark : i === 2 ? AC.ghDark : C.ink,
                lineHeight: 1.1,
                opacity: word(i),
                translate: `0px ${interpolate(word(i), [0, 1], [40, 0])}px`,
                rotate: `${Math.sin((frame + i * 20) / 18) * 1.5}deg`,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <MusicNotes x={520} y={560} />
      <Grasshopper x={420} y={FEET} size={GH_SIZE} guitar="play" strum={1} />
      <Ant x={1500} y={FEET} size={ANT_SIZE} leader flip wave={frame > 30} />
      <Ant x={1680} y={FEET} size={ANT_SIZE * 0.85} carry="berry" walk={0} seed={2} flip />
    </Field>
  );
};

/* ───────────────────────────── 2 · Summer songs ───────────────────────────── */

export const SummerScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const played = cue("Every day");
  const streamed = cue("streamed his songs");
  const la = cue("“La la la");
  const best = cue("Summer is the best");
  const G: Placed = { x: 780, y: FEET };
  const head = ghHead(G);
  return (
    <Camera from={1} to={1.06}>
      <Field season="summer" trees={[1640]} sunflowers={[170, 300, 1860]}>
        <Butterfly cx={420} cy={330} seed={1} />
        <Butterfly cx={1350} cy={260} color={C.pinkDark} seed={3} size={60} />
        <MusicNotes x={880} y={600} opacity={interpolate(frame, [played - 20, played], [0.4, 1], clamp)} />
        <Grasshopper {...G} size={GH_SIZE} guitar="play" strum={frame > played ? 1 : 0.4} bounce={frame > la ? 0.5 : 0} mouthOpen={frame > la ? 0.4 + Math.abs(Math.sin(frame / 4)) * 0.5 : 0} eyes={frame > la ? "happy" : "open"} />
        <PhoneTripod x={1180} y={FEET} size={240} screen="music" />
        {[0, 1, 2, 3].map((i) => {
          const tt = ((frame - streamed + i * 20) % 80) / 80;
          return frame > streamed ? (
            <Heart key={i} x={1200 + Math.sin(tt * 6 + i) * 40 + i * 20} y={640 - tt * 320} size={46} beat={0.15} color={i % 2 ? C.pink : C.pinkDark} />
          ) : null;
        })}
        <Bubble x={head.x - 40} y={head.y} tail="right" width={380} fontSize={60} color={C.butter} text={{ en: "La la la!", es: "¡La, la, la!" }} pop={inOut(frame, la, best)} />
        <Bubble x={head.x - 40} y={head.y} tail="right" width={520} fontSize={54} color={C.mint} text={{ en: "Summer is the best!", es: "¡El verano es lo mejor!" }} pop={popAt(frame, best, 8)} />
      </Field>
    </Camera>
  );
};

/* ───────────────────────────── 3 · The busy Ants ───────────────────────────── */

const HILL_X = 1580;

export const AntsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const where = cue("“Where are you");
  const pantry = cue("“To our pantry");
  const solar = cue("Our solar panels");
  const saving = cue("We’re saving");
  const leaderX = interpolate(frame, [0, where - 10], [-200, 820], { ...clamp, easing: easeOut });
  const stopped = frame > where - 10;
  const L: Placed = { x: leaderX, y: FEET, flip: stopped };
  const lh = antHead({ ...L, size: ANT_SIZE });
  const G: Placed = { x: 330, y: FEET };
  const gh = ghHead(G);
  const shine = Math.max(0, Math.sin(((frame - solar) / 30) * Math.PI)) * (frame > solar && frame < solar + 90 ? 1 : 0);
  return (
    <Camera from={1.02} to={1.06}>
      <Field season="summer" sunflowers={[1880]}>
        <Anthill x={HILL_X} season="summer" door={0.7} shine={shine} />
        <AntLine stopX={HILL_X - 20} />
        <Grasshopper {...G} size={GH_SIZE} guitar="back" headTilt={frame > where && frame < pantry ? 6 : 0} mouthOpen={frame > where && frame < pantry ? 0.5 : 0} />
        <Ant {...L} size={ANT_SIZE} leader walk={stopped ? 0 : 1} carry={stopped ? null : "seed"} wave={frame > pantry && frame < solar} mouthOpen={frame > pantry && frame < saving + 50 ? Math.abs(Math.sin(frame / 3)) * 0.7 : 0} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={HILL_X - 150 + i * 90} y={GROUND_Y - 430 + (i % 2) * 30} size={50} t={(frame - solar - i * 6) / 8} color={C.cream} />
        ))}
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={480} fontSize={52} color={C.mint} text={{ en: "Where are you going?", es: "¿Adónde van?" }} pop={inOut(frame, where, pantry)} />
        <Bubble x={lh.x} y={lh.y} tail="left" width={440} fontSize={52} color={C.butter} text={{ en: "To our pantry!", es: "¡A nuestra despensa!" }} pop={inOut(frame, pantry, solar)} />
        <Bubble x={lh.x} y={lh.y} tail="left" width={470} fontSize={48} color={C.butter} text={{ en: "Solar panels keep it cosy!", es: "¡Los paneles solares la mantienen calentita!" }} pop={inOut(frame, solar, saving)} />
        <Bubble x={lh.x} y={lh.y} tail="left" width={470} fontSize={50} color={C.butter} text={{ en: "We’re saving food for winter.", es: "Guardamos comida para el invierno." }} pop={popAt(frame, saving, 8)} />
      </Field>
    </Camera>
  );
};

/* ───────────────────────────── 4 · Come and dance ───────────────────────────── */

export const InviteScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const dance = cue("“Come and dance");
  const smiled = cue("The little Ant smiled");
  const maybe = cue("“Maybe later");
  const work = cue("There’s work");
  const off = cue("And off she");
  const one = cue("one, two, one");
  const G: Placed = { x: 600, y: FEET };
  const gh = ghHead(G);
  const marching = frame > off;
  const antX = interpolate(frame, [off, off + 200], [1120, 1700], clamp);
  const L: Placed = { x: antX, y: FEET, flip: !marching };
  const lh = antHead({ ...L, size: ANT_SIZE });
  const laughing = frame < dance;
  return (
    <Camera from={1} to={1.05}>
      <Field season="summer" sunflowers={[150]}>
        <Anthill x={1760} season="summer" door={0.7} />
        <MusicNotes x={640} y={520} opacity={frame > dance ? 1 : 0} />
        <Grasshopper
          {...G}
          size={GH_SIZE}
          guitar={frame > dance ? "play" : "back"}
          strum={1}
          laugh={laughing}
          eyes={laughing ? "happy" : "open"}
          bounce={frame > dance && frame < smiled + 30 ? 0.7 : 0}
          mouthOpen={laughing || (frame > dance && frame < smiled) ? 0.4 + Math.abs(Math.sin(frame / 3)) * 0.5 : 0}
        />
        <Ant {...L} size={ANT_SIZE} leader carry={marching ? "berry" : null} walk={marching ? 1 : 0} eyes={frame > smiled && frame < off ? "happy" : "open"} mouthOpen={frame > maybe && frame < off ? Math.abs(Math.sin(frame / 3)) * 0.7 : 0} opacity={interpolate(antX, [1620, 1700], [1, 0], clamp)} />
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={540} fontSize={52} color={C.peach} text={{ en: "Winter? That’s ages away!", es: "¿El invierno? ¡Falta muchísimo!" }} pop={inOut(frame, 2, dance)} />
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={480} fontSize={54} color={C.mint} text={{ en: "Come and dance!", es: "¡Ven a bailar!" }} pop={inOut(frame, dance, smiled + 20)} />
        <Bubble x={lh.x - 40} y={lh.y} tail="right" width={380} fontSize={52} color={C.butter} text={{ en: "Maybe later.", es: "Quizás después." }} pop={inOut(frame, maybe, work)} />
        <Bubble x={lh.x - 40} y={lh.y} tail="right" width={440} fontSize={50} color={C.butter} text={{ en: "There’s work to do!", es: "¡Hay trabajo que hacer!" }} pop={inOut(frame, work, off + 10)} />
        {[0, 1].map((i) => (
          <Bubble key={i} x={lh.x - 60 - i * 40} y={lh.y - 10 - i * 70} tail="right" width={240} fontSize={52} color={[C.lavender, C.pink][i]} text={{ en: "One, two!", es: "¡Un, dos!" }} pop={inOut(frame, one + i * 18, one + 80 + i * 10)} />
        ))}
      </Field>
    </Camera>
  );
};

/* ───────────────────────────── 5 · Autumn leaves ───────────────────────────── */

export const AutumnScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const leaves = cue("The leaves");
  const filled = cue("The Ants filled");
  const top = cue("all the way");
  const but = cue("But the Grasshopper");
  const more = cue("“One more song");
  const G: Placed = { x: 330, y: FEET };
  const gh = ghHead(G);
  const pantry = interpolate(frame, [filled - 30, top + 30], [0.25, 1], clamp);
  return (
    <Camera from={1.0} to={1.06}>
      <Field season="autumn" trees={[760]}>
        <Anthill x={1460} season="autumn" door={0.7} window pantry={pantry} />
        <AntLine stopX={1450} n={3} items={["jar", "seed", "jar"]} speed={3.6} />
        <MusicNotes x={420} y={560} opacity={frame > but - 20 ? 1 : 0.5} />
        <Grasshopper {...G} size={GH_SIZE} guitar="play" strum={frame > but ? 1 : 0.5} mouthOpen={frame > more ? 0.5 + Math.abs(Math.sin(frame / 4)) * 0.4 : 0} eyes={frame > more ? "happy" : "open"} />
        <PhoneTripod x={620} y={FEET} size={200} screen={frame > but ? "low" : "music"} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={1240 + i * 90} y={600 - (i % 2) * 40} size={44} t={(frame - top - i * 6) / 8} />
        ))}
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={480} fontSize={56} color={C.butter} text={{ en: "One more song!", es: "¡Una canción más!" }} pop={popAt(frame, more, 8)} />
      </Field>
      <FallingLeaves from={leaves - 30} />
    </Camera>
  );
};

/* ───────────────────────────── 6 · Snow ───────────────────────────── */

export const WinterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const brrr = cue("“Brrr");
  const battery = cue("His phone battery");
  const nothing = cue("nothing to eat");
  const ohDear = cue("“Oh dear");
  const should = cue("“I should have");
  const G: Placed = { x: 860, y: FEET };
  const gh = ghHead(G);
  return (
    <Camera from={1.04} to={1.0}>
      <Field season="winter" trees={[1560]}>
        <Grasshopper {...G} size={GH_SIZE} guitar="back" shiver={frame > brrr - 10} eyes={frame > ohDear ? "sad" : frame > brrr ? "wide" : "open"} sad={frame > battery} mouthOpen={frame > brrr && frame < brrr + 30 ? 0.6 : 0} headTilt={frame > ohDear ? -6 : 0} />
        <PhoneTripod x={1200} y={FEET} size={220} screen="empty" />
        <EmptyBowl x={560} y={FEET} pop={interpolate(popAt(frame, nothing - 6, 12), [0, 0.7, 1], [0, 1.1, 1])} />
        <Bubble x={gh.x - 40} y={gh.y} tail="right" width={300} fontSize={64} color={C.blue} text={{ en: "Brrr!", es: "¡Brrr!" }} pop={inOut(frame, brrr, battery + 20)} />
        <Bubble x={1220} y={GROUND_Y - 240} tail="left" width={300} fontSize={46} color={C.pink} text={{ en: "Battery empty!", es: "¡Sin batería!" }} pop={inOut(frame, battery + 6, ohDear)} />
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={340} fontSize={56} color={C.lavender} text={{ en: "Oh dear…", es: "Ay, ay, ay…" }} pop={inOut(frame, ohDear, should)} />
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={500} fontSize={50} color={C.lavender} text={{ en: "I should have got ready.", es: "Debí prepararme." }} pop={popAt(frame, should, 8)} />
      </Field>
      <Snowfall />
    </Camera>
  );
};

/* ───────────────────────────── 7 · Knock, knock ───────────────────────────── */

export const KnockScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const knock = cue("Knock, knock");
  const hello = cue("“Hello");
  const help = cue("Could you help");
  const opened = cue("The little Ant opened");
  const course = cue("“Of course");
  const gx = interpolate(frame, [0, knock - 6], [-220, 1020], { ...clamp, easing: easeInOut });
  const arrived = frame > knock - 6;
  const G: Placed = { x: gx, y: FEET };
  const gh = ghHead(G);
  const door = interpolate(frame, [opened, opened + 18], [0, 1], { ...clamp, easing: easeOut });
  const L: Placed = { x: 1400, y: GROUND_Y + 20, flip: true, opacity: interpolate(frame, [opened + 6, opened + 18], [0, 1], clamp) };
  const lh = antHead({ ...L, size: 240 });
  return (
    <Camera from={1} to={1.05}>
      <Field season="winter">
        <Anthill x={1400} season="winter" door={door} glow />
        <Ant {...L} size={240} leader wave={frame > course} eyes={frame > course ? "happy" : "open"} mouthOpen={frame > course && frame < course + 40 ? Math.abs(Math.sin(frame / 3)) * 0.8 : 0} />
        <Grasshopper
          {...G}
          size={GH_SIZE}
          guitar="back"
          walk={arrived ? 0 : 1}
          shiver={arrived && frame < course}
          knock={frame > knock && frame < hello}
          eyes={frame > course ? "happy" : "sad"}
          sad={frame < course}
          mouthOpen={frame > hello && frame < opened ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0}
        />
        {[0, 1].map((i) => (
          <Bubble key={i} x={1250 - i * 30} y={GROUND_Y - 300 - i * 90} tail="left" width={250} fontSize={50} color={[C.butter, C.peach][i]} text={{ en: "Knock!", es: "¡Toc!" }} pop={inOut(frame, knock + i * 14, hello + 10)} />
        ))}
        <Bubble x={gh.x - 40} y={gh.y} tail="right" width={480} fontSize={48} color={C.lavender} text={{ en: "Could you help me, please?", es: "¿Me pueden ayudar, por favor?" }} pop={inOut(frame, help - 20, opened + 10)} />
        <Bubble x={lh.x + 30} y={lh.y} tail="left" width={420} fontSize={52} color={C.butter} text={{ en: "Of course! Come inside!", es: "¡Claro que sí! ¡Pasa!" }} pop={popAt(frame, course, 8)} />
        {frame > course
          ? [0, 1, 2].map((i) => <Heart key={i} x={1250 + i * 70} y={560 - ((frame * 1.4 + i * 50) % 140)} size={48} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />)
          : null}
      </Field>
      <Snowfall amount={0.7} />
    </Camera>
  );
};

/* ───────────────────────────── 8 · Winter party ───────────────────────────── */

const DANCERS = [1300, 1480, 1660];

export const PartyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const shared = cue("The Ants shared");
  const played = cue("and the Grasshopper played");
  const danced = cue("Everyone danced");
  const next = cue("“Next summer");
  const G: Placed = { x: 560, y: FEET };
  const gh = ghHead(G);
  const servingX = interpolate(frame, [shared - 20, shared + 50], [1300, 1000], { ...clamp, easing: easeInOut });
  return (
    <Camera from={1} to={1.05}>
      <CosyRoom>
        <PhoneTripod x={170} y={FEET} size={170} screen="charging" />
        <MusicNotes x={640} y={560} opacity={frame > played ? 1 : 0} />
        <Grasshopper {...G} size={GH_SIZE} scarf guitar={frame > played ? "play" : "back"} strum={1} bounce={frame > danced ? 0.4 : 0} eyes={frame > played ? "happy" : "open"} mouthOpen={frame > next ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} />
        <Ant x={servingX} y={FEET} size={ANT_SIZE} flip leader carry={frame < danced ? "berry" : null} walk={frame > shared - 20 && frame < shared + 50 ? 1 : 0} dance={frame > danced} />
        {DANCERS.slice(1).map((x, i) => (
          <Ant key={x} x={x} y={FEET} size={ANT_SIZE * 0.9} flip={i % 2 === 0} dance={frame > danced} seed={i * 5 + 2} eyes={frame > danced ? "happy" : "open"} />
        ))}
        <Bubble x={gh.x + 40} y={gh.y} tail="left" width={560} fontSize={48} color={C.mint} text={{ en: "Next summer, I’ll help you fill the pantry!", es: "¡El próximo verano les ayudaré a llenar la despensa!" }} pop={popAt(frame, next, 8)} />
        {frame > danced
          ? [0, 1, 2, 3].map((i) => <Heart key={i} x={1300 + i * 110} y={520 - ((frame * 1.3 + i * 40) % 160)} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />)
          : null}
      </CosyRoom>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("work today"), cue("work today") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("Play and share"), cue("Play and share") + 16], [0, 1], clamp);
  const kind = interpolate(frame, [cue("And when friends"), cue("And when friends") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#DCE4F4" }}>
      <Snowfall amount={0.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 150 }}>
        <div
          style={{
            width: 1360,
            background: C.cream,
            borderRadius: 64,
            padding: "50px 90px",
            textAlign: "center",
            boxShadow: "0 16px 0 rgba(94,75,110,0.14)",
            scale: `${interpolate(card, [0, 1], [0.7, 1])}`,
            opacity: card,
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 700, color: AC.ghDark, marginBottom: 20 }}>
            {t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}
          </div>
          <div style={{ fontSize: 68, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            {t({ en: "Work today, and you’ll be ready for tomorrow.", es: "Trabaja hoy, y estarás listo para mañana." })}
          </div>
          <div style={{ marginTop: 20, fontSize: 46, fontWeight: 500, color: C.lavenderDark, lineHeight: 1.25, opacity: echo }}>
            {t({ en: "Play and share your songs, but get ready too.", es: "Juega y comparte tus canciones, pero prepárate también." })}
          </div>
          <div style={{ marginTop: 12, fontSize: 46, fontWeight: 500, color: AC.antDark, lineHeight: 1.25, opacity: kind }}>
            {t({ en: "And when friends need help, share.", es: "Y cuando un amigo necesita ayuda, comparte." })}
          </div>
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 124,
            fontWeight: 700,
            color: C.pinkDark,
            scale: `${interpolate(end, [0, 0.7, 1], [0, 1.15, 1])}`,
            rotate: `${Math.sin(frame / 12) * 3}deg`,
            textShadow: `0 8px 0 ${C.cream}`,
          }}
        >
          {t({ en: "The End", es: "Fin" })}
        </div>
      </AbsoluteFill>
      <Grasshopper x={220} y={1070} size={360} scarf guitar="play" strum={end > 0 ? 1 : 0.4} eyes={end > 0 ? "happy" : "open"} />
      <Ant x={1720} y={1070} size={240} leader flip wave={end > 0} />
    </AbsoluteFill>
  );
};
