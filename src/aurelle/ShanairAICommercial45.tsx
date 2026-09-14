/**
 * ShanairAICommercial45 — the two-voice vertical commercial (~68s).
 *
 * A believable AURELLE luxury campaign (Voice 1, an elegant narrator) → a hard freeze + silence
 * → the illusion breaks and the REAL creator's voice (Voice 2, the cloned Shanair voice) reveals
 * what you were watching, steps forward ("I built all of it"), pivots to real businesses, and
 * closes on Shanair.AI. Each beat is a named <Sequence> (windows in aurelle/config `S`); two
 * music movements + SFX + the two voice groups (aurelle/audio) score it, split by the hard cut
 * at the freeze. 1080×1920 · 30fps.
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { INK } from "../promo/palette";
import { S } from "./config";
import { MUSIC, MUSIC_SRC, SFX, VO, VO_GAIN, musicVolumeA, musicVolumeB } from "./audio";
import { FPS } from "./config";
import {
  ShotArrival,
  ShotClasp,
  ShotFragments,
  ShotGallery,
  ShotHero,
  ShotInterrupt,
  ShotMontage,
} from "./actsA";
import { ActDeconstruct, ActReveal } from "./actsB";
import { ActFinale, ActIndustries, ActOffer, ActProof } from "./actsC";

export const ShanairAICommercial45: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    {/* ── Act 1 · The AURELLE illusion ── */}
    <Sequence from={S.fragments.from} durationInFrames={S.fragments.len} name="1·1 Fragments">
      <ShotFragments />
    </Sequence>
    <Sequence from={S.arrival.from} durationInFrames={S.arrival.len} name="1·2 Arrival">
      <ShotArrival />
    </Sequence>
    <Sequence from={S.clasp.from} durationInFrames={S.clasp.len} name="1·3 Clasp">
      <ShotClasp />
    </Sequence>
    <Sequence from={S.gallery.from} durationInFrames={S.gallery.len} name="1·4 Gallery">
      <ShotGallery />
    </Sequence>
    <Sequence from={S.montage.from} durationInFrames={S.montage.len} name="1·5 Detail montage">
      <ShotMontage />
    </Sequence>
    <Sequence from={S.hero.from} durationInFrames={S.hero.len} name="1·6 Hero (calm)">
      <ShotHero />
    </Sequence>

    {/* ── Act 2 · The interruption ── */}
    <Sequence from={S.interrupt.from} durationInFrames={S.interrupt.len} name="2 · Interruption">
      <ShotInterrupt />
    </Sequence>

    {/* ── Act 3 · The deconstruction ── */}
    <Sequence from={S.deconstruct.from} durationInFrames={S.deconstruct.len} name="3 · Deconstruction">
      <ActDeconstruct />
    </Sequence>

    {/* ── Act 4 · The reveal ("doesn't exist") ── */}
    <Sequence from={S.reveal.from} durationInFrames={S.reveal.len} name="4 · Reveal">
      <ActReveal />
    </Sequence>

    {/* ── Act 5 · Proof + brand (Built with Shanair.AI) ── */}
    <Sequence from={S.proof.from} durationInFrames={S.proof.len} name="5 · Proof / Built with Shanair.AI">
      <ActProof />
    </Sequence>

    {/* ── Act 6 · The offer ── */}
    <Sequence from={S.offer.from} durationInFrames={S.offer.len} name="6 · Offer">
      <ActOffer />
    </Sequence>

    {/* ── Act 7 · The industries ── */}
    <Sequence from={S.industries.from} durationInFrames={S.industries.len} name="7 · Industries">
      <ActIndustries />
    </Sequence>

    {/* ── Act 8 · Shanair.AI + CTA ── */}
    <Sequence from={S.finale.from} durationInFrames={S.finale.len} name="8 · Shanair.AI">
      <ActFinale />
    </Sequence>

    {/* ── Score ── two movements of one bed, split by the hard cut at the freeze ── */}
    <Audio src={staticFile(MUSIC_SRC)} trimBefore={Math.round(MUSIC.a.startAt * FPS)} volume={musicVolumeA} name="Music · movement A" />
    <Audio src={staticFile(MUSIC_SRC)} trimBefore={Math.round(MUSIC.b.startAt * FPS)} volume={musicVolumeB} name="Music · movement B" />

    {/* ── SFX one-shots (dedicated palette — scripts/aurelle-sfx.sh) ── */}
    {SFX.map((s, i) => (
      <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={s.durFrames ?? 45} name={`sfx · ${s.note}`}>
        <Audio src={staticFile(s.src)} volume={() => s.gain} />
      </Sequence>
    ))}

    {/* ── Voiceover (Shanair's cloned voice) — enters after the freeze; music ducks under it ── */}
    {VO.map((v, i) => (
      <Sequence key={`vo-${i}`} from={v.at} durationInFrames={v.len + 16} name={`vo · ${v.line}`}>
        <Audio src={staticFile(v.src)} volume={() => VO_GAIN} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
