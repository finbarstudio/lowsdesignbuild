// The Studio needs the full viewport to itself, so it gets its own minimal
// layout that doesn't inherit the marketing-site chrome.
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
