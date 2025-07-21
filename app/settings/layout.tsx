"use client";
import { usePathname } from "next/navigation";

import SettingsSidebar from '@/components/Settings/SettingsSidebar';


export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen overflow-hidden bg-contain bg-no-repeat bg-left"
      style={{ backgroundImage: "url('/settings/bgsettings.png')" }}
  >
      {/* Settings Sidebar */}
      <SettingsSidebar />
      
      {/* Main content with proper margin for sidebar */}
      <main className="flex-1 ml-80 h-screen overflow-y-auto">
        <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}