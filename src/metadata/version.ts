/**
 * metadata/version — the descriptor-format version (ADR-009 §4.8).
 *
 * Metadata OWNS this constant (a different version line from `contracts`' request version). Bump it
 * when the shape of `FrameworkDescriptor` / any descriptor changes.
 */

export const SCHEMA_VERSION = "1";
