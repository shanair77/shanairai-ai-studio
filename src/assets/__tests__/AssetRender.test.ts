import { isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

// Renderers call useVideoConfig (Audio/Video) — provide a fixed config so they run outside a
// render context. Everything else in remotion (Img/Audio/OffthreadVideo/Video/staticFile) is real.
vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return { ...actual, useVideoConfig: () => ({ fps: 30, durationInFrames: 90, width: 1920, height: 1080 }) };
});

import { Audio, OffthreadVideo, Video } from "remotion";
import { createAssetDefinition } from "../definition";
import { createAssetKit } from "../AssetKit";

const kit = createAssetKit({
  img: createAssetDefinition({ category: "image", source: "https://cdn/i.jpg" }),
  badge: createAssetDefinition({ category: "svg", source: "https://cdn/b.svg" }),
  aud: createAssetDefinition({ category: "audio", source: "https://cdn/a.mp3" }),
  vid: createAssetDefinition({ category: "video", source: "https://cdn/v.mp4" }),
});

const props = (node: unknown): Record<string, unknown> => (node as ReactElement).props as Record<string, unknown>;

describe("asset renderers — structural assembly", () => {
  it("Image resolves to a boxed image with the resolved src", () => {
    const el = kit.Image({ name: "img", fit: "cover" });
    expect(isValidElement(el)).toBe(true);
    expect(props(el).src).toBe("https://cdn/i.jpg");
    expect(props(el).defaultFit).toBe("cover");
  });

  it("Svg and Logo default to contain fit", () => {
    expect(props(kit.Svg({ name: "badge" })).defaultFit).toBe("contain");
    expect(props(kit.Logo({ name: "badge" })).defaultFit).toBe("contain");
    expect(props(kit.Logo({ name: "badge" })).src).toBe("https://cdn/b.svg");
  });

  it("Audio resolves to a remotion <Audio> with the resolved src", () => {
    const el = kit.Audio({ name: "aud", volume: 0.5 });
    expect((el as ReactElement).type).toBe(Audio);
    expect(props(el).src).toBe("https://cdn/a.mp3");
    expect(props(el).loop).toBe(false);
  });

  it("Video uses OffthreadVideo by default and Video when looping", () => {
    const still = kit.Video({ name: "vid" });
    expect((still as ReactElement).type).toBe("div");
    expect((props(still).children as ReactElement).type).toBe(OffthreadVideo);
    expect(props(props(still).children).src).toBe("https://cdn/v.mp4");

    const looped = kit.Video({ name: "vid", loop: true });
    expect((props(looped).children as ReactElement).type).toBe(Video);
    expect(props(props(looped).children).loop).toBe(true);
  });
});
