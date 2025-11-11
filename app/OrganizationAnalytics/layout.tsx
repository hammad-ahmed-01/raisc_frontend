import Sidebar from '@/components/Sidebar/Sidebar';

export default function OrganizationAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Fixed Sidebar on the left */}
      <aside className="fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 w-full">
        {children}
      </main>
    </div>
  );
}
