import Sidebar from '@/components/Sidebar/Sidebar';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Fixed header (Sidebar) */}
      <header className="w-full h-20 fixed top-0 left-0 z-20">
        <Sidebar />
      </header>

      {/* Main content — padded down so it doesn't sit under the header */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
