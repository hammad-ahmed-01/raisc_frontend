"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";


export default function SettingsSidebar() {
  const pathname = usePathname();

  const { checkAuth } = require("@/lib/auth");

  const authResult = checkAuth();

  const userType = authResult.user?.user_type;

  let settingsNavItems = [
    { href: "/settings/account", label: "My Account", id: "account" },
    { href: "/settings/edit-profile", label: "Edit Profile", id: "edit-profile" },
    { href: "/settings/change-password", label: "Change Password", id: "change-password" },
    { href: "/settings/change-email", label: "Email", id: "email" },
    { href: "/settings/notifications", label: "Notifications", id: "notifications" },
    { href: "/settings/privacy-policy", label: "Privacy Policy", id: "privacy-policy" },
    { href: "/settings/terms", label: "Terms and Conditions", id: "terms" },
  ];

  if(userType==="organization"){
    settingsNavItems = [
      { href: "/settings/account", label: "My Account", id: "account" },
      { href: "/settings/edit-profile", label: "Edit Profile", id: "edit-profile" },
      { href: "/settings/manage-team", label: "Manage Team", id: "manage-team" },
      { href: "/settings/doctor-permissions", label: "Doctor Permissions", id: "doctor-permissions" },
      { href: "/settings/notifications", label: "Notifications", id: "notifications" },
      { href: "/settings/privacy-policy", label: "Privacy Policy", id: "privacy-policy" },
      { href: "/settings/terms", label: "Terms and Conditions", id: "terms" },
    ];
  }

  return (
    <div className="fixed left-0 top-0 w-80 h-screen bg-transparent shadow-lg overflow-y-auto z-10 flex flex-col">
      <h1 className="text-2xl text-left px-12 pt-8 pb-2 font-bold text-[#1E3CA7] mb-6">Settings</h1>
      
      <nav className="space-y-1">
        {settingsNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`block px-12 py-4 text-md font-semibold transition-all duration-200 ${
              pathname === item.href
                ? "bg-white text-[#1E3CA7]"
                : "text-[#1E3CA7] hover:bg-blue-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Delete Account Button */}
      <div className="mt-auto py-8">
        <button className="w-full px-12 py-4 text-center bg-transparent text-[#A71515] font-semibold text-md hover:bg-red-50 transition-all duration-200">
          Delete My Account
        </button>
      </div>
    </div>
  );
}
