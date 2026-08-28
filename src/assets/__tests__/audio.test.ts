import { describe, expect, it } from "vitest";
import { audioVolume, duckAmount, duckedVolume, mergeDuckWindows } from "../audio";

describe("audioVolume", () => {
  it("returns a constant when no fades are requested", () => {
    expect(audioVolume(0.8, 0, 0, 300)).toBe(0.8);
  });

  it("fades in linearly over the first fadeInFrames", () => {
    const v = audioVolume(1, 10, 0, 300);
    expect(typeof v).toBe("function");
    const fn = v as (frame: number) => number;
    expect(fn(0)).toBeCloseTo(0);
    expect(fn(5)).toBeCloseTo(0.5);
    expect(fn(10)).toBeCloseTo(1);
    expect(fn(50)).toBeCloseTo(1);
  });

  it("fades out linearly over the last fadeOutFrames", () => {
    const fn = audioVolume(1, 0, 10, 100) as (frame: number) => number;
    expect(fn(0)).toBeCloseTo(1);
    expect(fn(90)).toBeCloseTo(1);
    expect(fn(95)).toBeCloseTo(0.5);
    expect(fn(100)).toBeCloseTo(0);
  });

  it("composes fade-in and fade-out with the base volume", () => {
    const fn = audioVolume(0.6, 10, 10, 100) as (frame: number) => number;
    expect(fn(5)).toBeCloseTo(0.3); // 0.6 * 0.5 (fading in)
    expect(fn(95)).toBeCloseTo(0.3); // 0.6 * 0.5 (fading out)
    expect(fn(50)).toBeCloseTo(0.6);
  });
});

describe("duckAmount", () => {
  const w = [{ start: 100, end: 200 }];

  it("is 0 well outside any window", () => {
    expect(duckAmount(0, w, 10)).toBe(0);
    expect(duckAmount(500, w, 10)).toBe(0);
  });

  it("is 1 across the whole window", () => {
    expect(duckAmount(100, w, 10)).toBe(1);
    expect(duckAmount(150, w, 10)).toBe(1);
    expect(duckAmount(200, w, 10)).toBe(1);
  });

  it("ramps in BEFORE the window starts, so the duck is in place on the first word", () => {
    expect(duckAmount(90, w, 10)).toBeCloseTo(0);
    expect(duckAmount(95, w, 10)).toBeCloseTo(0.5);
    expect(duckAmount(99, w, 10)).toBeCloseTo(0.9);
  });

  it("ramps out after the window ends", () => {
    expect(duckAmount(205, w, 10)).toBeCloseTo(0.5);
    expect(duckAmount(210, w, 10)).toBeCloseTo(0);
  });

  it("takes the deepest of overlapping windows", () => {
    const two = [{ start: 100, end: 200 }, { start: 150, end: 260 }];
    expect(duckAmount(205, two, 10)).toBe(1);
  });

  it("ignores zero-length and inverted windows", () => {
    expect(duckAmount(100, [{ start: 100, end: 100 }], 10)).toBe(0);
    expect(duckAmount(100, [{ start: 200, end: 100 }], 10)).toBe(0);
  });
});

describe("mergeDuckWindows", () => {
  it("sorts and merges windows closer together than the gap", () => {
    expect(mergeDuckWindows([{ start: 160, end: 200 }, { start: 100, end: 150 }], 20))
      .toEqual([{ start: 100, end: 200 }]);
  });

  it("leaves windows further apart than the gap alone", () => {
    expect(mergeDuckWindows([{ start: 100, end: 150 }, { start: 200, end: 260 }], 20))
      .toEqual([{ start: 100, end: 150 }, { start: 200, end: 260 }]);
  });

  it("absorbs a window fully contained in another", () => {
    expect(mergeDuckWindows([{ start: 100, end: 300 }, { start: 150, end: 200 }], 0))
      .toEqual([{ start: 100, end: 300 }]);
  });

  it("drops zero-length and inverted windows", () => {
    expect(mergeDuckWindows([{ start: 100, end: 100 }, { start: 200, end: 100 }], 10)).toEqual([]);
  });
});

describe("duckedVolume", () => {
  it("stays fully ducked through a gap too short to ramp back up (no pumping)", () => {
    // Two lines 10 frames apart with a 10-frame ramp: the hole is unrampable, so it stays closed.
    const fn = duckedVolume(0.6, 0, 0, 400, [{ start: 100, end: 150 }, { start: 160, end: 200 }], 0.2, 10) as (f: number) => number;
    expect(fn(155)).toBeCloseTo(0.2);
    expect(fn(175)).toBeCloseTo(0.2);
  });

  it("does lift back to base across a gap wide enough to ramp", () => {
    const fn = duckedVolume(0.6, 0, 0, 400, [{ start: 100, end: 150 }, { start: 260, end: 300 }], 0.2, 10) as (f: number) => number;
    expect(fn(200)).toBeCloseTo(0.6);
  });

  it("falls back to the plain envelope when there is nothing to duck", () => {
    expect(duckedVolume(0.8, 0, 0, 300, [], 0.2, 10)).toBe(0.8);
  });

  it("holds the base level outside the window and the duck level inside it", () => {
    const fn = duckedVolume(0.55, 0, 0, 300, [{ start: 100, end: 200 }], 0.28, 10) as (f: number) => number;
    expect(fn(0)).toBeCloseTo(0.55);
    expect(fn(150)).toBeCloseTo(0.28);
    expect(fn(290)).toBeCloseTo(0.55);
  });

  it("ramps smoothly between base and duck level", () => {
    const fn = duckedVolume(0.6, 0, 0, 300, [{ start: 100, end: 200 }], 0.2, 10) as (f: number) => number;
    expect(fn(95)).toBeCloseTo(0.4); // halfway between 0.6 and 0.2
  });

  it("composes ducking with the head fade", () => {
    const fn = duckedVolume(0.6, 20, 0, 300, [{ start: 100, end: 200 }], 0.2, 10) as (f: number) => number;
    expect(fn(10)).toBeCloseTo(0.3); // 0.6 base * 0.5 fade-in, no duck yet
    expect(fn(150)).toBeCloseTo(0.2); // fully ducked, fade complete
  });

  it("never returns a negative volume", () => {
    const fn = duckedVolume(0.5, 0, 10, 100, [{ start: 10, end: 20 }], 0.1, 5) as (f: number) => number;
    for (let i = 0; i <= 100; i++) expect(fn(i)).toBeGreaterThanOrEqual(0);
  });
});
