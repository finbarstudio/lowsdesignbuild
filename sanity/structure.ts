import type { StructureResolver } from "sanity/structure";

// A clean, page-shaped sidebar. The single-page documents (Home, About, Team,
// Estimate, Contact) open straight into their one document; "Projects" and
// "What we do" are lists you add items to. Order roughly follows the site:
// Home, Projects, then the About-page sections, then Estimate and Contact.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home Page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("projectCategory").title("Project Types"),
      S.divider(),
      S.listItem()
        .title("About Page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.documentTypeListItem("service").title("What we do"),
      S.listItem()
        .title("Team")
        .id("family")
        .child(S.document().schemaType("family").documentId("family")),
      S.divider(),
      S.listItem()
        .title("Estimate Page")
        .id("estimatePage")
        .child(
          S.document().schemaType("estimatePage").documentId("estimatePage"),
        ),
      S.listItem()
        .title("Contact")
        .id("contact")
        .child(S.document().schemaType("contact").documentId("contact")),
    ]);
