import Sidebar from '@/components/Sidebar/Sidebar';
import LatestFooter from '@/components/LatestFooter';

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar on top */}
      <header className="w-full h-20 fixed top-0 left-0 z-20">
        <Sidebar />
      </header>

      {/* Main content below the fixed header */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
