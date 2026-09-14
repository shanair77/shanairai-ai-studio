/**
 * promo/PromoContext — provides the active variant's on-screen copy to the sections.
 *
 * Sections read copy through `useCopy()` instead of importing a fixed COPY object, so the same
 * section components render any variant. The assembler (ShanairCommercial) sets the provider and
 * owns the audio; footage in-points stay shared constants (both cuts use the same shots).
 */

import { createContext, createElement, useContext, type ReactNode } from "react";
import { variantA, type PromoCopy } from "./config";

const CopyContext = createContext<PromoCopy>(variantA.copy);

export const CopyProvider = ({ copy, children }: { copy: PromoCopy; children?: ReactNode }) =>
  createElement(CopyContext.Provider, { value: copy }, children);

/** The active variant's on-screen copy. */
export const useCopy = (): PromoCopy => useContext(CopyContext);
