import { describe, expect, it } from "vitest";
import { audioVolume } from "../audio";

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
