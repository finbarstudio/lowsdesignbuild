import { defineCliConfig } from "sanity/cli";

// Used by the `sanity` CLI (dataset commands, typegen, deploy). The projectId
// is not a secret. Front-end/Studio read the same values from .env.local.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l6sbyky8",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
