import { type SchemaTypeDefinition } from "sanity";

import { projectType } from "./project";

// Every document/object type the Studio knows about. Add new content types
// (services, blog posts, areas…) to this array as the site grows.
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType],
};
