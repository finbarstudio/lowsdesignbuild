import Header from "@/app/components/Header";

// The standard top header — marketing pages only. The home page uses its own
// HomeChrome instead, so it is intentionally outside this group.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
