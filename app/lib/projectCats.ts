// A project's type tags, resolved across three generations of the schema (the
// client's existing content is never migrated, so all three must keep working):
//   1. `typeTitles` — the managed Project Type references (the current way)
//   2. `categories` — the older hardcoded string array
//   3. `category`   — the oldest single string
// The first non-empty source wins, in that order of preference.
export function projectCats(p: {
  typeTitles?: (string | null)[] | null;
  categories?: string[] | null;
  category?: string | null;
}): string[] {
  const clean = (arr: (string | null | undefined)[] | null | undefined) =>
    (arr ?? [])
      .map((c) => c?.trim())
      .filter((c): c is string => Boolean(c));

  const refs = clean(p.typeTitles);
  if (refs.length) return refs;
  const list = clean(p.categories);
  if (list.length) return list;
  const legacy = p.category?.trim();
  return legacy ? [legacy] : [];
}
