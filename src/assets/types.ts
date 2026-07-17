/**
 * assets/types — the asset engine's typed contracts (ADR-003, MVP).
 *
 * Categories, sources, definitions, the discriminated resolved-asset union, and the type-level
 * helpers (`CategoryOf`, `NamesOfCategory`) that give the asset kit compile-time, category-safe
 * literal names. File media (image/video/audio/svg) only in this MVP; other resolved kinds are
 * reserved in the union as extension points (not implemented).
 */

/** MVP media categories. Reserved (deferred): "gradient" | "caption" | "lottie". */
export type AssetCategory = "image" | "video" | "audio" | "svg";

/** How to obtain the bytes. A bare string is sugar: http(s) → remote, else → local. */
export type AssetSource =
  | { kind: "local"; path: string }
  | { kind: "remote"; url: string };
// Reserved (deferred): { kind: "gradient"; value } | { kind: "inline"; markup }.

/** Author-declared metadata (probing is deferred). */
export type AssetMetadata = {
  width?: number;
  height?: number;
  durationInSeconds?: number;
  transparent?: boolean;
  mime?: string;
};

/** Usage tags (convenience only — NOT a distinct definition type). */
export type AssetRole = "logo" | "icon" | "texture" | "overlay" | "mask" | "watermark" | "background";

/** One asset bound to its category, source, and optional metadata/roles. */
export type AssetDefinition<C extends AssetCategory = AssetCategory> = {
  category: C;
  source: AssetSource | string;
  metadata?: AssetMetadata;
  roles?: AssetRole[];
};

/** A map of asset name → definition. */
export type AssetMap = Record<string, AssetDefinition>;

/** Extract a definition's category. */
export type CategoryOf<D> = D extends AssetDefinition<infer C> ? C : never;

/** Names in `M` whose category is within `K` — the key to category-safe component names. */
export type NamesOfCategory<M extends AssetMap, K extends AssetCategory> = {
  [N in keyof M & string]: CategoryOf<M[N]> extends K ? N : never;
}[keyof M & string];

/**
 * Discriminated resolved asset (Correction 3). MVP resolvers produce only `file`; the other
 * kinds are reserved as extension points and are not implemented in Phase 15.
 */
export type ResolvedAsset =
  | { kind: "file"; category: AssetCategory; src: string; metadata?: AssetMetadata }
  // --- deferred kinds (type reserved; resolvers not implemented) ---
  | { kind: "inline-svg"; markup: string; metadata?: AssetMetadata }
  | { kind: "gradient"; value: string }
  | { kind: "caption"; format: "srt" | "vtt"; src: string };

/** A source resolver: turns an `AssetSource` (or string) into a `ResolvedAsset`. */
export type AssetSourceResolver = {
  name: string;
  supports(source: AssetSource | string): boolean;
  resolve(source: AssetSource | string, category: AssetCategory, metadata?: AssetMetadata): ResolvedAsset;
};

/**
 * The erased registry contract the builder/context depend on (satisfied by any asset
 * `Registry<M>`). Kept minimal so a concrete `Registry<{ … }>` is assignable regardless of its
 * exact map type.
 */
export type AssetRegistry = {
  require(name: string): AssetDefinition;
  has(name: string): boolean;
  keys(): string[];
};

/** Object-fit behaviour for image/video renderers. */
export type Fit = "cover" | "contain" | "fill" | "none";
