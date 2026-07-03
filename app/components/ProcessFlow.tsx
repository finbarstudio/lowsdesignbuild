"use client";

import { createContext, useContext } from "react";

/**
 * Shared "landed" signal for the View projects button: true once the process
 * end-sequence has assembled (ProcessConverge provides it), which fires the
 * button's gold outline trace (read by VpFlowHighlight). Rendered without a
 * provider (about / contact pages) the default is simply `false`, so nothing
 * highlights and the button is a plain ink pill.
 */
export const LandedContext = createContext(false);

export const useProcessLanded = () => useContext(LandedContext);
