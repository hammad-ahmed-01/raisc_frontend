"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import { PatientList } from "./components/PatientList";
import type { Patient } from "@/src/types";

/* ----------------------------- helpers ----------------------------- */
const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const toStr = (v: unknown, fallback = ""): string => {
  const s = (v ?? "").toString().trim();
  return s.length ? s : fallback;
};
/** Coerce any backend value to the union: 'Male' | 'Female' | 'Other' */
const normalizeGender = (v: unknown): Patient["gender"] => {
  const s = toStr(v).toLowerCase();
  if (["m", "male", "man"].includes(s)) return "Male";
  if (["f", "female", "woman"].includes(s)) return "Female";
  return "Other";
};

export default function PatientsPage() {
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const router = useRouter();

  async function loadPatients() {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const tok = (localStorage.getItem("session_key") || "").trim();
        if (tok) headers.Authorization = `Token ${tok}`;
      }

      // via Next proxy -> Django /users/doctor/patients/
      const res = await fetch("/api/doctors/patients", {
        headers,
        cache: "no-store",
      });

      if (res.status === 401) {
        setAuthError("Unauthorized access");
        setTimeout(redirectToLogin, 1200);
        return;
      }

      const data = await res.json().catch(() => []);
      const items: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      const mapped: Patient[] = items.map((row: any): Patient => {
        const u = row?.user ?? {};
        const pd = (row?.profile_data ?? {}) as Record<string, unknown>;

        const idStr = toStr(u.id ?? row.id ?? "", "");

        return {
          id: idStr,
          name:
            toStr((pd as any).display_name) ||
            toStr(`${u.first_name ?? ""} ${u.last_name ?? ""}`) ||
            toStr(u.username, "Patient"),
          age: toNum((pd as any).age, 0),
          gender: normalizeGender((pd as any).gender),
          condition: toStr((pd as any).primary_concern ?? (pd as any).condition, "—"),
        };
      });

      setPatients(mapped);
    } catch (e) {
      console.error("Failed to load patients:", e);
    }
  }

  useEffect(() => {
    (async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication failed");
        setTimeout(redirectToLogin, 2000);
        return;
      }
      if (authResult.user?.user_type === "patient") {
        setAuthError("Patients cannot access the Patient page");
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }
      setAuthVerified(true);
      await loadPatients();
    })();
  }, [router]);

  // 👂 Live refresh when a pending request is approved in Requests page
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("doctor-patients");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "refresh") loadPatients();
      };
    } catch {}
    return () => {
      try {
        bc?.close();
      } catch {}
    };
  }, []);

  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!authVerified) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-gray-600">Verifying session...</p>
      </div>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg/mypatientsbg.png')" }}
    >
      <div className="h-full backdrop-blur-sm bg-blue-50/40">
        <PatientList patients={patients} />
      </div>
    </main>
  );
}
