/**
 * assets/resolvers — source resolution (Correction 2: NOT called "provider").
 *
 * `LocalAssetResolver` resolves `public/`-relative paths deterministically via `staticFile()`.
 * `RemoteAssetResolver` passes valid http(s) URLs through. Both reject unsupported source kinds.
 * A bare string source is normalised: http(s) → remote, else → local.
 */

import { staticFile } from "remotion";
import { DomainError } from "../errors";
import {
  type AssetCategory,
  type AssetMetadata,
  type AssetSource,
  type AssetSourceResolver,
  type ResolvedAsset,
} from "./types";

const isUrl = (s: string): boolean => /^https?:\/\//.test(s);

/** Normalise a bare string source to a discriminated `AssetSource`. */
export const normaliseSource = (source: AssetSource | string): AssetSource =>
  typeof source === "string" ? (isUrl(source) ? { kind: "remote", url: source } : { kind: "local", path: source }) : source;

const file = (category: AssetCategory, src: string, metadata?: AssetMetadata): ResolvedAsset => ({
  kind: "file",
  category,
  src,
  metadata,
});

/** Resolves `public/`-relative local paths via `staticFile()`. */
export const LocalAssetResolver: AssetSourceResolver = {
  name: "local",
  supports: (source) => normaliseSource(source).kind === "local",
  resolve: (source, category, metadata) => {
    const s = normaliseSource(source);
    if (s.kind !== "local") {
      throw new Error(`LocalAssetResolver: unsupported source kind "${s.kind}".`);
    }
    return file(category, staticFile(s.path), metadata);
  },
};

/** Passes valid http(s) URLs through unchanged. */
export const RemoteAssetResolver: AssetSourceResolver = {
  name: "remote",
  supports: (source) => normaliseSource(source).kind === "remote",
  resolve: (source, category, metadata) => {
    const s = normaliseSource(source);
    if (s.kind !== "remote") {
      throw new Error(`RemoteAssetResolver: unsupported source kind "${s.kind}".`);
    }
    if (!isUrl(s.url)) {
      throw new DomainError({
        code: "invalid-asset-source",
        message: `RemoteAssetResolver: "${s.url}" is not a valid http(s) URL.`,
        actual: s.url,
      });
    }
    return file(category, s.url, metadata);
  },
};

/** Default resolver chain (local first, then remote). */
export const DEFAULT_RESOLVERS: AssetSourceResolver[] = [LocalAssetResolver, RemoteAssetResolver];
