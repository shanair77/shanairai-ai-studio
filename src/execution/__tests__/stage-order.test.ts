/**
 * stage-order — binds the implementation's real trace to the canonical stage list.
 *
 * `EXECUTION_STAGES` declares the vocabulary and order once; `execute()` is an imperative sequencer
 * (ADR-007 amendment) whose statement order is the actual behaviour. Nothing in the type system ties
 * those together, so these tests do: a successful run must emit every stage, in order, and a failed
 * run must mark exactly the later stages skipped. Catches both an OMITTED stage (shorter trace) and
 * a REORDERED stage (mismatched sequence).
 */

import { describe, expect, it } from "vitest";
import { createRegistry } from "../../registry";
import { createTemplateDefinition } from "../../templates";
import { execute } from "../execute";
import { EXECUTION_STAGES } from "../stages";

type P = { title: string };

const templates = createRegistry({
  // Declares BOTH a parameter schema and a validate hook, so no stage is conditionally skipped.
  full: createTemplateDefinition({
    name: "full",
    parameters: { parameters: [{ key: "title", type: "string", required: true }] },
    validate: (p: P) => {
      if (!p.title) throw new Error("title required");
    },
    build: (p: P) => ({
      scenes: [
        { scene: "hero", duration: 1, props: { title: p.title } },
        { scene: "outro", duration: 1, props: {} },
      ],
    }),
  }),
  // Throws inside build() → halts at `run-template`.
  boom: createTemplateDefinition({
    name: "boom",
    build: () => {
      throw new Error("boom");
    },
  }),
});

const stagesOf = (trace: readonly { stage: string }[]): string[] => trace.map((s) => s.stage);

describe("stage order (single source: EXECUTION_STAGES)", () => {
  it("a successful execution traces every canonical stage, in order", () => {
    const result = execute({ id: "S", template: "full", params: { title: "Hi" } }, { registries: { templates } });
    expect(result.ok).toBe(true);
    expect(stagesOf(result.report.trace)).toEqual([...EXECUTION_STAGES]);
  });

  it("marks every later stage skipped when a stage fails, per the same list", () => {
    const result = execute({ id: "F", template: "boom", params: {} }, { registries: { templates } });
    expect(result.ok).toBe(false);

    // The whole vocabulary is still accounted for, in canonical order.
    expect(stagesOf(result.report.trace)).toEqual([...EXECUTION_STAGES]);

    const failedAt = EXECUTION_STAGES.indexOf("run-template");
    const halted = result.report.trace.filter((s) => s.status === "skipped" && s.note === "halted").map((s) => s.stage);
    expect(halted).toEqual([...EXECUTION_STAGES.slice(failedAt + 1)]);
  });

  it("keeps the report's stage vocabulary within the canonical list", () => {
    const result = execute({ id: "F", template: "boom", params: {} }, { registries: { templates } });
    const known = new Set<string>(EXECUTION_STAGES);
    for (const entry of [...result.report.trace, ...result.report.issues, ...result.report.warnings]) {
      expect(known.has(entry.stage)).toBe(true);
    }
  });
});
