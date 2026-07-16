/**
 * ThemeContext — the active theme, provided through React context.
 *
 * Lives in the `config` layer (the lowest) so any consumer can read the active theme with a
 * strictly downward import. `useTheme()` returns the theme supplied by the nearest
 * `<ThemeProvider>`, and falls back to the static default theme when no provider is present
 * — so a bare primitive renders exactly as it did before this context existed.
 *
 * The engine's brand layer wraps compositions in a provider (see BrandConfig); primitives
 * read colors/typography from here instead of importing the static theme directly, which is
 * what makes brand configuration actually recolor the output.
 */

import { createContext, createElement, useContext, type ReactElement, type ReactNode } from "react";
import { theme, type Theme } from "./Theme";

const ThemeContext = createContext<Theme>(theme);

/** Provide an active theme to everything rendered beneath it. */
export const ThemeProvider = ({ theme: value, children }: { theme: Theme; children?: ReactNode }): ReactElement =>
  createElement(ThemeContext.Provider, { value }, children);

/** Read the active theme. Falls back to the static default theme outside a provider. */
export const useTheme = (): Theme => useContext(ThemeContext);
