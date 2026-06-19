import type { StructureResolver } from "sanity/structure";

// A clean, page-shaped sidebar: each page/section is its own entry, in the same
// order and wording as the site. The singletons (Home, About, Family, Contact)
// open straight into their one document; "What we do" and "Projects" are lists.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.documentTypeListItem("service").title("What we do"),
      S.listItem()
        .title("Family")
        .id("family")
        .child(S.document().schemaType("family").documentId("family")),
      S.documentTypeListItem("project").title("Projects"),
      S.listItem()
        .title("Contact")
        .id("contact")
        .child(S.document().schemaType("contact").documentId("contact")),
    ]);
