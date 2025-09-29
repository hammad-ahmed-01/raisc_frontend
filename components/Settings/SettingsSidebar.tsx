"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getToken, clearSession } from "@/lib/auth";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    //{ href: "/settings/notifications", label: "Notifications", id: "notifications" },
    //{ href: "/settings/privacy-policy", label: "Privacy Policy", id: "privacy-policy" },
    //{ href: "/settings/terms", label: "Terms and Conditions", id: "terms" },
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

  async function handleDeleteAccount() {
    {/*
    if (busy) return;
    const sure = window.confirm(
      "This will permanently delete your account and associated data. Continue?"
    );
    if (!sure) return;

    try {
      setBusy(true);

      const token = getToken();
      if (!token) {
        alert("Not logged in. Please sign in again.");
        return;
      }

      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({}),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Delete failed:", payload);
        throw new Error(payload?.detail || "Failed to delete account.");
      }

      clearSession();
      router.replace("/goodbye"); // or "/login"
    } catch (err) {
      console.error(err);
      alert("Could not delete account. Please try again.");
    } finally {
      setBusy(false);
    }
  */}
  }

  return (
    <div
      className="fixed left-0 top-0 w-80 h-screen shadow-lg overflow-y-auto z-10 flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/settings/bgsettings.png')" }}
    >
      {/* Header with Back Icon */}
      <div className="flex items-center gap-3 px-12 pt-8 pb-2 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#1E3CA7] hover:text-blue-800 transition-colors"
          aria-label="Back to Dashboard"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[#1E3CA7]">Settings</h1>
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

      {/* Delete Account Button */}
      <div className="mt-auto py-8">
        <button
          onClick={handleDeleteAccount}
          disabled={busy}
          className={`w-full px-12 py-4 text-left bg-transparent font-semibold text-md transition-all duration-200 ${
            busy ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"
          } text-[#A71515]`}
        >
          {busy ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}
