"use client";

// Configuration for the embedded Sanity Studio (the admin UI at /studio).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Lows Design & Build",
  basePath: "/studio", // the Studio is served from /studio
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(), // the document editing UI
    visionTool({ defaultApiVersion: apiVersion }), // a GROQ playground for learning
  ],
});
