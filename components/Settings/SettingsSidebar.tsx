"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X, Menu, ChevronLeft } from "lucide-react";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change (link tap)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Load user type for conditional items
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserType(parsed.user_type || null);
      }
    } catch (e) {
      console.error("Error reading user_data from localStorage:", e);
    }
  }, []);

  let settingsNavItems = [
    { href: "/settings/account", label: "My Account", id: "account" },
    { href: "/settings/edit-profile", label: "Edit Profile", id: "edit-profile" },
    { href: "/settings/change-password", label: "Change Password", id: "change-password" },
    { href: "/settings/change-email", label: "Change Email", id: "email" },
  ];

  if (userType === "organization") {
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

  const toggleMobile = () => setIsOpen((v) => !v);
  const closeMobile = () => setIsOpen(false);

  const SidebarNav = (
    <>
      {/* Drawer header (mobile) — title + close X (no dashboard arrow) */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#1E3CA7]">Settings</h1>
        <button
          onClick={closeMobile}
          aria-label="Close settings menu"
          className="text-[#1E3CA7] hover:opacity-80 transition"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="space-y-1">
        {settingsNavItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={closeMobile}
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

      {/* Delete Account Button (unchanged action wiring) */}
      <div className="mt-auto px-12 py-6">
        <button
          disabled={busy}
          className={`w-full text-center font-semibold text-md transition-all duration-200 ${
            busy ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"
          } text-[#A71515] py-3`}
        >
          {busy ? "Deleting..." : "Delete My Account"}
        </button>
      </div>

      {/* Bottom: Back to Dashboard button (mobile drawer) */}
      <div className="px-6 pb-8">
        <button
          onClick={() => {
            closeMobile();
            router.push("/dashboard");
          }}
          className="w-full rounded-lg border border-[#1E3CA7] text-[#1E3CA7] font-semibold py-3 hover:bg-blue-50 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ===== MOBILE TOP BAR (only the menu button visible) ===== */}
      <div className="md:hidden sticky top-0 z-40" style={{ backgroundImage: "url('/settings/bgsettings.png')" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleMobile}
            aria-label={isOpen ? "Close settings menu" : "Open settings menu"}
            className="text-[#1E3CA7] hover:opacity-80 transition"
          >
            <Menu className="text-bold" size={24} />
          </button>
          {/* Keep center/right empty per requirement (no dashboard arrow here) */}
          <div />
          <div />
        </div>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      <div
        className={`md:hidden fixed inset-0 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto z-30 bg-black/40"
            : "opacity-0 pointer-events-none z-[-1]"
        }`}
        onClick={closeMobile}
        aria-hidden={!isOpen}
      />

      {/* ===== MOBILE DRAWER ===== */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-80 overflow-y-auto bg-cover bg-center transform transition-all duration-300 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100 z-40 shadow-lg visible"
            : "-translate-x-full opacity-0 z-[-1] pointer-events-none invisible"
        }`}
        style={{ backgroundImage: "url('/settings/bgsettings.png')" }}
        role="dialog"
        aria-modal="true"
        aria-label="Settings menu"
      >
        <div className="flex h-full flex-col">{SidebarNav}</div>
      </aside>

      {/* ===== DESKTOP SIDEBAR (unchanged) ===== */}
      <aside
        className="hidden md:flex fixed left-0 top-0 w-80 h-screen shadow-lg overflow-y-auto z-10 flex-col bg-cover bg-center"
        style={{ backgroundImage: "url('/settings/bgsettings.png')" }}
        aria-label="Settings sidebar"
      >
        {/* Desktop keeps the same content and header styling as before */}
        <div className="flex items-center gap-3 px-12 pt-8 pb-2 mb-6">
          {/* Desktop keeps its original back arrow behavior; do not alter */}
          <h1 className="text-2xl font-bold text-[#1E3CA7]">
          <span
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer select-none"
              title="Back to Dashboard"
            >
              <ChevronLeft size={24} className="inline mr-2" />
            </span>{" "}  
          Settings</h1>
        </div>
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
        <div className="mt-auto py-8">
          <button
            disabled={busy}
            className={`w-full px-12 py-4 text-center bg-transparent font-semibold text-md transition-all duration-200 ${
              busy ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"
            } text-[#A71515]`}
          >
            {busy ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </aside>
    </>
  );
}
