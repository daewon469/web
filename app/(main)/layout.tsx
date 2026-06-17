import TopBar from "@/components/TopBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      <TopBar />
      <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-4">{children}</div>
    </div>
  );
}
