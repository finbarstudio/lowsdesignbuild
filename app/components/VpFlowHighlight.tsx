"use client";

import type { ReactNode } from "react";

import { useProcessLanded } from "@/app/components/ProcessFlow";

/**
 * Tiny client wrapper around the ViewProjectsButton's markup. It reads the
 * shared "landed" signal (set by ProcessPath when the travelling dot reaches
 * the bottom of the line) and adds `vp--landed`, so the pill border + label go
 * gold and the button lifts — the line reading as flowing into it.
 *
 * Rendered outside a ProcessFlow provider (about / contact pages) the context
 * default is `false`, so this is inert and the button looks unchanged.
 */
export default function VpFlowHighlight({ children }: { children: ReactNode }) {
  const landed = useProcessLanded();
  return <div className={landed ? "vp-flow vp-flow--landed" : "vp-flow"}>{children}</div>;
}
