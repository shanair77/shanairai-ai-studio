/**
 * registry/ — generic registry kernel (see `registry.ts`).
 *
 * The reusable primitive every typed registry family builds on: scenes today; transitions,
 * assets, effects, brands, and templates later. See ADR-001.
 */

export { createRegistry, type Registry, type DefinitionMap } from "./registry";
