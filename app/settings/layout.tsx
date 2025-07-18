"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar/Sidebar';
import SettingsSidebar from '@/components/Settings/SettingsSidebar';

const settingsNavItems = [
  { href: "/settings/account", label: "My Account", id: "account" },
  { href: "/settings/edit-profile", label: "Edit Profile", id: "edit-profile" },
  { href: "/settings/change-password", label: "Change Password", id: "change-password" },
  { href: "/settings/email", label: "Email", id: "email" },
  { href: "/settings/notifications", label: "Notifications", id: "notifications" },
  { href: "/settings/privacy-policy", label: "Privacy Policy", id: "privacy-policy" },
  { href: "/settings/terms", label: "Terms and Conditions", id: "terms" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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