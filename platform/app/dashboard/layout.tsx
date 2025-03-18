export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full h-full flex flex-col items-center justify-center gap-4">
      {children}
    </section>
  );
}
