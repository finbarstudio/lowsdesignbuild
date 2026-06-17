import Header from "@/app/components/Header";
import { client } from "@/sanity/lib/client";
import { PROJECT_COUNT_QUERY } from "@/sanity/lib/queries";

export const revalidate = 60;

// The standard top header, marketing pages only. The home page uses its own
// HomeChrome instead, so it is intentionally outside this group.
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectCount = await client.fetch<number>(PROJECT_COUNT_QUERY);
  return (
    <>
      <Header projectCount={projectCount} />
      {children}
    </>
  );
}
