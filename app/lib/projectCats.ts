// A project's type tags. Projects can carry up to two types via the new
// `categories` array; older documents still hold a single legacy `category`
// string (the client's existing content is never migrated), so this merges the
// two: prefer the array, fall back to the single.
export function projectCats(p: {
  categories?: string[] | null;
  category?: string | null;
}): string[] {
  const list = (p.categories ?? [])
    .map((c) => c?.trim())
    .filter((c): c is string => Boolean(c));
  if (list.length) return list;
  const legacy = p.category?.trim();
  return legacy ? [legacy] : [];
}
