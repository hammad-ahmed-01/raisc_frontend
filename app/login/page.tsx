"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../LandingPage/constants/navbar";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

type Role = "patient" | "doctor" | "organization";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const router = useRouter();

  // Toggle backend vs demo mode using NEXT_PUBLIC_BACKEND_CONNECTED
  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  // --- Helpers ---
  const normalizeUserForStorage = (u: any) => {
    if (!u || typeof u !== "object") return u;
    const role: Role = u.user_type as Role;

    // Important: never carry a patient_profile for a non-patient user
    if (role === "doctor" || role === "organization") {
      const { patient_profile, ...rest } = u;
      return { ...rest, user_type: role };
    }

    // Patient: ensure a safe level field (frontend expects it)
    if (role === "patient") {
      const pp = u.patient_profile ?? null;
      const safeProfile = {
        level: typeof pp?.level === "number" ? pp.level : 0,
        associated_psychologist: pp?.associated_psychologist ?? null,
        associated_psychologist_name: pp?.associated_psychologist_name ?? null,
        sent_requests: pp?.sent_requests ?? [],
      };
      return { ...u, user_type: role, patient_profile: safeProfile };
    }

    return u;
  };

  const goToDashboardFor = (role: Role) => {
    // We route to the same /dashboard hub; the page component picks
    // the correct dashboard (Doctor/Patient/Organization).
    // Keeping it centralized avoids duplicating logic here.
    router.push("/dashboard");
  };

  // If already logged in, go to dashboard immediately (respect stored role)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = localStorage.getItem("session_key");
    if (!key || key === "null" || key === "") return;

    try {
      const raw = localStorage.getItem("user_data");
      const parsed = raw ? JSON.parse(raw) : null;
      const role: Role | undefined = parsed?.user_type;
      if (role === "doctor" || role === "patient" || role === "organization") {
        // Normalize once more in case old/stale user_data exists
        const normalized = normalizeUserForStorage(parsed);
        localStorage.setItem("user_data", JSON.stringify(normalized));
        goToDashboardFor(normalized.user_type);
      } else {
        // Fallback: still go to dashboards hub; it will fetch/validate
        router.push("/dashboard");
      }
    } catch {
      // If parsing fails, force re-login
      localStorage.removeItem("session_key");
      localStorage.removeItem("user_data");
    }
  }, [router]);

  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);

    // ===== Demo Mode when backend is NOT connected =====
    if (!isBackendConnected) {
      // Default demo user: PATIENT (you can change to a doctor by flipping the role here)
      const dummyUser = {
        id: 2,
        username: "demo_user",
        email: "demo@example.com",
        user_type: "patient",
        patient_profile: {
          level: 0,
          associated_psychologist: null,
          associated_psychologist_name: null,
          sent_requests: [],
        },
      };

      const normalized = normalizeUserForStorage(dummyUser);
      localStorage.setItem("session_key", "dummy-session-key");
      localStorage.setItem("user_data", JSON.stringify(normalized));
      goToDashboardFor(normalized.user_type);
      setIsLoading(false);
      return;
    }
    // ===================================================

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // username can be email/username (backend handles it)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(
          data?.message || data?.detail || data?.error || "Invalid username or password."
        );
        return;
      }

      if (typeof data?.token !== "string" || !data?.user) {
        setErrorMessage("Unexpected login response. Please try again.");
        return;
      }

      // Normalize and store
      const normalized = normalizeUserForStorage(data.user);
      localStorage.setItem("session_key", data.token);
      localStorage.setItem("user_data", JSON.stringify(normalized));

      // Route based on role; doctors will hit DoctorDashboard
      goToDashboardFor(normalized.user_type);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-[url('/bg/patientbg.png')] bg-cover bg-center px-4 py-24">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-[48px] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
            Welcome to RAISC
          </h1>
          <p className="text-[40px] font-[400] font-quicksand text-[#1E3CA7] text-center mt-2">
            Healing begins with one step.
          </p>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="w-full max-w-2xl rounded-[32px] bg-[#D0E3FF1A] bg-opacity-70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-[#7EA8FF] p-8 md:p-16">
            <div>
              {errorMessage && (
                <div className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">
                  {errorMessage}
                </div>
              )}

              <div className="mb-6 text-left">
                <label className="block text-gray-700 text-base mb-1">Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-6 text-left">
                <label className="block text-gray-700 text-base mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex justify-between items-center mb-6 text-sm">
                <label className="flex items-center text-heading2 font-medium">
                  <input type="checkbox" className="mr-2 accent-blue-600" />
                  Remember me
                </label>
              </div>

              <div className="flex justify-center">
                <PrimaryButton
                  text={isLoading ? "Logging in..." : "Login"}
                  onClick={handleLogin}
                  className="px-10 text-lg py-3 rounded-full"
                  disabled={isLoading}
                />
              </div>

              <p className="mt-6 text-center text-sm text-gray-700">
                {"Don't have an account yet? "}
                <a href="/register" className="text-heading2 font-medium hover:underline">
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
