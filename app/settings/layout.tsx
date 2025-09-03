"use client";
import { useEffect, useState } from "react";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import SettingsSidebar from "@/components/Settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication required");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      setAuthVerified(true);
    };
    performAuthCheck();
  }, []);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (!authVerified) {
    return (
      <p className="text-center text-gray-600 mt-10">Verifying session...</p>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar stays on left with its own background */}
      <SettingsSidebar />

      {/* Main content area only has the blue background */}
      <main className="flex-1 ml-80 min-h-screen overflow-y-auto bg-blue-50">
        <div className="h-full w-full p-6">{children}</div>
      </main>
    </div>
  );
}
