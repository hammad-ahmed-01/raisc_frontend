"use client";
import React, { useEffect, useState } from 'react';
import PendingRequestsPage from '../../components/DoctorDashboard/requests/PendingRequestsPage';
import { checkAuth, redirectToLogin } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Requests() {
  const [authError, setAuthError] = useState("");
  const [authVerified, setAuthVerified] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => redirectToLogin(), 2000);
        return;
      }
      if (authResult.user?.user_type === "patient") {
        setAuthError("Patients cannot access the Requests page");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }
      setAuthVerified(true);
    };
    performAuthCheck();
  }, [router]);

  if (!hydrated) return null;

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!authVerified) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  return <PendingRequestsPage />;
}
