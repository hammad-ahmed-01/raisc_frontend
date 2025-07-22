"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import { PatientList } from "./components/PatientList";
import { patients } from "./components/Patients";
import TopRightIcons from "./components/TopRightIcons";

export default function PatientsPage() {
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();

      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }

      setAuthVerified(true);
    };

    performAuthCheck();
  }, [router]);

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
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg/mypatientsbg.png')" }}
    >
      {/* Fixed Top Right Icons */}
      <div className="absolute top-6 right-6 z-20">
        <TopRightIcons />
      </div>

      {/* Main content area */}
      <div className="pt-24 backdrop-blur-sm bg-blue-50/40 min-h-screen">
        <PatientList patients={patients} />
      </div>
    </main>
  );
}
