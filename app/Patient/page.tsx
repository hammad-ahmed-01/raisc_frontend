"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import { PatientList } from "./components/PatientList";
import type { Patient } from "@/src/types";
import TopRightIcons from "@/components/TopRightIcons";

/* ----------------------------- helpers ----------------------------- */
const toStr = (v: unknown, fallback = ""): string => {
  const s = (v ?? "").toString().trim();
  return s.length ? s : fallback;
};
const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const normalizeGender = (v: unknown): Patient["gender"] => {
  const s = toStr(v).toLowerCase();
  if (s === "male" || s === "m") return "Male";
  if (s === "female" || s === "f") return "Female";
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

      const res = await fetch("/api/doctors/patients", {
        headers,
        cache: "no-store",
      });

      console.log(res);

      if (res.status === 401) {
        setAuthError("Unauthorized access");
        setTimeout(redirectToLogin, 1200);
        return;
      }

      const data = await res.json().catch(() => []);
      const items: any[] = Array.isArray(data)
        ? data
        : Array.isArray((data?.results as any))
        ? (data as any).results
        : [];

      console.log(items)

      // Helper to extract extra information
      const extractExtraInfo = (pd: Record<string, unknown>): Patient["extraInfo"] | undefined => {
        const questionnaireInsights = pd?.questionnaire_insights;
        if (!questionnaireInsights || typeof questionnaireInsights !== 'object') {
          return undefined;
        }

        const insights = questionnaireInsights as Record<string, any>;
        const extraInfo: Patient["extraInfo"] = {};
        const fields = ['duration', 'current_condition', 'physical_activity', 'mental_health_history'];
        
        for (const field of fields) {
          const value = insights[field];
          if (value && typeof value === 'string') {
            // Transform string value to expected ExtraInfo format
            extraInfo[field as keyof typeof extraInfo] = {
              value: value,
              required: true,
              collected: true,
              description: value,
            };
          }
        }

        return Object.keys(extraInfo).length > 0 ? extraInfo : undefined;
      };

      const mapped: Patient[] = items.map((row: any): Patient => {
        const u = row?.user ?? {};
        const pd = ((row?.profile_data ?? {}) as Record<string, unknown>) || {};

        const id = toStr(u.id ?? row.id ?? "", "");
        const name =
          toStr(pd["display_name"]) ||
          toStr(`${u.first_name ?? ""} ${u.last_name ?? ""}`) ||
          toStr(u.username, "Patient");

        const age = toNum(pd["age"], 21);
        const gender = normalizeGender(pd["gender"]);

        // Therapy focus: prefer `therapyFocus`; if empty, fall back to `condition`.
        const therapyFocus = toStr(pd["therapyFocus"]);
        const condition = therapyFocus || toStr(pd["current_condition"]) || "—";

        return {
          id,
          name,
          age,
          gender,
          condition, // shown as therapy focus in UI
          extraInfo: extractExtraInfo(pd),
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
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg/mypatientsbg.png')" }}
    >

      <div className="pt-4 pb-8">
        <TopRightIcons />
        </div>

      <div className="min-h-screen">
        <PatientList patients={patients} />
      </div>
    </main>
  );
}
