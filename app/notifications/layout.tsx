import Sidebar from '@/components/Sidebar/Sidebar';

export default function NotificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar on left */}
      <aside className="w-64 h-full fixed top-0 left-0 z-20">
        <Sidebar />
      </aside>

      {/* Main content below the fixed sidebar */}
      <main className="flex-1 min-w-screen ml-20">
        {children}
      </main>
    </div>
  );
}
