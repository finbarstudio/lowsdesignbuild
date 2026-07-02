"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import ProcessPath from "@/app/components/ProcessPath";

type Step = { n: string; title: string; text: string };

/**
 * Shares a single boolean — has the travelling dot reached the bottom of the
 * timeline? — between the (client) ProcessPath and the (async, server-rendered)
 * ViewProjectsButton, so the line reads as flowing INTO the button.
 *
 * The button is passed in as `button`: a server component rendered ahead of
 * time and slotted into this client provider's tree. Client components inside
 * that slotted output (VpFlowHighlight) can still read this context, while the
 * button keeps its async Sanity fetch intact. Rendered without a provider
 * (about/contact pages) the default is simply `false`, so nothing highlights.
 */
const LandedContext = createContext(false);

export const useProcessLanded = () => useContext(LandedContext);

export default function ProcessFlow({
  steps,
  button,
}: {
  steps?: Step[];
  button: ReactNode;
}) {
  const [landed, setLanded] = useState(false);

  // Stable identity: ProcessPath's scroll effect lists onLanded as a dependency,
  // so a fresh function each render would re-bind its listeners every time.
  const handleLanded = useCallback((v: boolean) => setLanded(v), []);

  return (
    <>
      <ProcessPath steps={steps} onLanded={handleLanded} />
      <LandedContext.Provider value={landed}>{button}</LandedContext.Provider>
    </>
  );
}
