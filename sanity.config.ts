"use client";

// Configuration for the embedded Sanity Studio (the admin UI at /studio).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

// The single-page documents — there should only ever be one of each, so they
// can't be created again, duplicated or deleted from the Studio.
const SINGLETONS = new Set([
  "homePage",
  "aboutPage",
  "family",
  "contact",
  "estimatePage",
]);

export default defineConfig({
  name: "default",
  title: "Lows Design & Build",
  basePath: "/studio", // the Studio is served from /studio
  projectId,
  dataset,
  schema,
  document: {
    // keep the singletons out of the global "＋ Create" menu
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((item) => !SINGLETONS.has(item.templateId))
        : prev,
    // strip delete / duplicate / unpublish from singleton documents
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter(
            (action) =>
              !["delete", "duplicate", "unpublish"].includes(
                action.action ?? "",
              ),
          )
        : prev,
  },
  plugins: [
    structureTool({ structure }), // the document editing UI (custom sidebar)
    visionTool({ defaultApiVersion: apiVersion }), // a GROQ playground for learning
  ],
});
