import { isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { TransitionSeries } from "@remotion/transitions";
import { buildComposition, type BuiltComposition } from "../CompositionBuilder";

// Structural test: assemble a composition and inspect the produced React element tree
// (createElement returns plain objects) WITHOUT rendering — scene components are referenced,
// never invoked. Proves the config-driven TransitionSeries assembly.

const props = (el: ReactElement): { children?: unknown; [k: string]: unknown } =>
  el.props as { children?: unknown; [k: string]: unknown };

const findAll = (node: unknown, type: unknown, acc: ReactElement[] = []): ReactElement[] => {
  if (Array.isArray(node)) {
    node.forEach((n) => findAll(n, type, acc));
    return acc;
  }
  if (!isValidElement(node)) return acc;
  if (node.type === type) acc.push(node);
  findAll(props(node).children, type, acc);
  return acc;
};

const tree = (built: BuiltComposition): unknown => built.component({});

describe("TransitionSeries assembly", () => {
  it("interleaves TransitionSeries.Sequence and .Transition for a transition run", () => {
    const built = buildComposition({
      id: "x",
      format: "horizontal",
      transitions: { type: "fade", duration: 0.5 },
      scenes: [{ scene: "hero", duration: 1 }, { scene: "outro", duration: 1 }],
    });
    const root = tree(built);

    expect(findAll(root, TransitionSeries)).toHaveLength(1);
    expect(findAll(root, TransitionSeries.Sequence)).toHaveLength(2);
    expect(findAll(root, TransitionSeries.Transition)).toHaveLength(1);

    // The single TransitionSeries' children alternate Sequence, Transition, Sequence.
    const series = findAll(root, TransitionSeries)[0];
    const kids = props(series).children as ReactElement[];
    expect(kids.map((k) => k.type)).toEqual([
      TransitionSeries.Sequence,
      TransitionSeries.Transition,
      TransitionSeries.Sequence,
    ]);
  });

  it("splits into separate runs at a 'none' cut (no duration lost)", () => {
    const built = buildComposition({
      id: "x",
      format: "horizontal",
      transitions: { type: "fade", duration: 0.5 },
      scenes: [
        { scene: "hero", duration: 1 },
        { scene: "centered", duration: 1, transition: { type: "none" } }, // cut → new run
        { scene: "quote", duration: 1 },
      ],
    });
    const root = tree(built);

    // Two runs: [hero] and [centered—fade—quote].
    expect(findAll(root, TransitionSeries)).toHaveLength(1); // only the multi-scene run wraps a TransitionSeries
    expect(findAll(root, TransitionSeries.Sequence)).toHaveLength(2); // centered + quote
    expect(findAll(root, TransitionSeries.Transition)).toHaveLength(1); // the fade between them
  });

  it("emits no TransitionSeries when every boundary is a cut", () => {
    const built = buildComposition({
      id: "x",
      format: "horizontal",
      transitions: { type: "none" },
      scenes: [{ scene: "hero", duration: 1 }, { scene: "outro", duration: 1 }],
    });
    expect(findAll(tree(built), TransitionSeries)).toHaveLength(0);
  });
});
