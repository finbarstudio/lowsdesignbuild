"use client";

// Configuration for the embedded Sanity Studio (the admin UI at /studio).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "Lows Design & Build",
  basePath: "/studio", // the Studio is served from /studio
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }), // the document editing UI (custom sidebar)
    visionTool({ defaultApiVersion: apiVersion }), // a GROQ playground for learning
  ],
});
