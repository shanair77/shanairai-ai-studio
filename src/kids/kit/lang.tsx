/**
 * Language support: every story can render in English or Spanish from the same code.
 * Scenes carry an optional `es` block (narration + captions); on-screen text drawn by
 * components goes through `useT()` with `{ en, es }` strings.
 */

import React from "react";

export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];

/** A plain string (same in every language) or one string per language. */
export type Localized = string | { en: string; es?: string };

const LangContext = React.createContext<Lang>("en");

export const LangProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => (
  <LangContext.Provider value={lang}>{children}</LangContext.Provider>
);

export const useLang = () => React.useContext(LangContext);

export const translate = (s: Localized, lang: Lang): string => (typeof s === "string" ? s : (s[lang] ?? s.en));

/** `const t = useT(); t({ en: "Run!", es: "¡Corre!" })` */
export const useT = () => {
  const lang = useLang();
  return (s: Localized) => translate(s, lang);
};
