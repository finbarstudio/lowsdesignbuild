import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// The client is how the Next.js front-end talks to Sanity's Content Lake.
// useCdn:false during the build phase keeps the learning loop instant —
// edit in the Studio, refresh the site, see the change. (We'll switch on the
// CDN + ISR for production later.)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
