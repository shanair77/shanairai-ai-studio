/**
 * promo/ShanairCommercial — the assembled 30s film, parameterized by variant.
 *
 * Wraps the tree in the Shanair.AI brand (theme + fonts) and the variant's copy provider, lays
 * the six sections back-to-back in named <Sequence>s, and mixes the audio: the variant's music
 * bed with a frame-driven envelope that ducks under the (drop-in) voiceover, subtle SFX at the
 * big turns, and the cloned-voice narration locked to the beats.
 *
 * Everything that differs between cuts arrives via the `variant` prop (see config.variantA/B).
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BrandProvider, resolveBrand } from "../brand";
import { shanairAI } from "../shanairai/brand";
import { FPS, SECTIONS, type PromoVariant } from "./config";
import { CopyProvider } from "./PromoContext";
import { INK } from "./palette";
import { Hook, Reveal, ClaudeCode, RemotionSection, Result, CTASection } from "./sections";

const brand = resolveBrand(shanairAI);

/** Build the music-bed volume envelope for a variant: fade in, hold, duck under VO, fade out. */
const makeMusicVolume = (variant: PromoVariant) => {
  const windows: Array<[number, number]> = variant.voiceover.enabled
    ? variant.voiceover.clips.map((c) => [c.at, c.at + c.len])
    : [];
  // Pull the bed well down while narration plays so the voice clearly leads (floor ≈ 0.30).
  const duck = (frame: number): number => {
    let d = 1;
    for (const [s, e] of windows) {
      if (frame >= s - 10 && frame <= e + 10) {
        const edge = Math.max(0, Math.min(1, (frame - (s - 10)) / 10, (e + 10 - frame) / 10));
        d = Math.min(d, 1 - 0.7 * edge);
      }
    }
    return d;
  };
  return (frame: number): number => {
    const fadeIn = Math.min(1, frame / 18);
    const fadeOut = Math.min(1, (900 - frame) / 40);
    return variant.music.gain * fadeIn * fadeOut * duck(frame);
  };
};

export const ShanairCommercial: React.FC<{ variant: PromoVariant }> = ({ variant }) => {
  const musicVolume = makeMusicVolume(variant);
  return (
    <BrandProvider brand={brand}>
      <CopyProvider copy={variant.copy}>
        <AbsoluteFill style={{ backgroundColor: INK }}>
          {/* ── picture ── */}
          <Sequence from={SECTIONS.hook.from} durationInFrames={SECTIONS.hook.len} name="1 · Hook">
            <Hook />
          </Sequence>
          <Sequence from={SECTIONS.reveal.from} durationInFrames={SECTIONS.reveal.len} name="2 · Reveal">
            <Reveal />
          </Sequence>
          <Sequence from={SECTIONS.claude.from} durationInFrames={SECTIONS.claude.len} name="3 · Claude Code">
            <ClaudeCode />
          </Sequence>
          <Sequence from={SECTIONS.remotion.from} durationInFrames={SECTIONS.remotion.len} name="4 · Remotion">
            <RemotionSection />
          </Sequence>
          <Sequence from={SECTIONS.result.from} durationInFrames={SECTIONS.result.len} name="5 · Result">
            <Result />
          </Sequence>
          <Sequence from={SECTIONS.cta.from} durationInFrames={SECTIONS.cta.len} name="6 · CTA">
            <CTASection />
          </Sequence>

          {/* ── sound ── */}
          <Audio
            src={staticFile(variant.music.src)}
            trimBefore={Math.round(variant.music.startAt * FPS)}
            volume={musicVolume}
            name="Music bed"
          />
          {variant.sfx.map((s, i) => (
            <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={45} name={`SFX ${i + 1}`}>
              <Audio src={staticFile(s.src)} volume={() => s.gain} />
            </Sequence>
          ))}
          {variant.voiceover.enabled
            ? variant.voiceover.clips.map((c, i) => (
                <Sequence key={i} from={c.at} durationInFrames={c.len + 4} name={`VO ${i + 1}`}>
                  <Audio src={staticFile(c.src)} volume={() => variant.voiceover.gain} />
                </Sequence>
              ))
            : null}
        </AbsoluteFill>
      </CopyProvider>
    </BrandProvider>
  );
};
