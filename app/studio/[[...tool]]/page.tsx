/**
 * This route mounts the entire Sanity Studio (the admin UI) at /studio.
 * It's the same app; your friend logs in here to add/edit/delete content.
 */
import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
