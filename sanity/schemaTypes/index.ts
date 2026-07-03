import { type SchemaTypeDefinition } from "sanity";

import { aboutPageType } from "./aboutPage";
import { contactType } from "./contact";
import { estimatePageType } from "./estimatePage";
import { familyType } from "./family";
import { homePageType } from "./homePage";
import { projectType } from "./project";
import { projectCategoryType } from "./projectCategory";
import { projectsPageType } from "./projectsPage";
import { serviceType } from "./service";

// Every document/object type the Studio knows about. Organised by page/section
// (Home, About, Family, Contact) plus the repeatable lists (What we do, Projects).
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    homePageType,
    aboutPageType,
    serviceType,
    familyType,
    projectType,
    projectsPageType,
    projectCategoryType,
    estimatePageType,
    contactType,
  ],
};
