"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import TopRightIcons from "@/components/TopRightIcons";
import PatientRequestCard from "./PatientRequestCard";
import { FiSearch, FiChevronDown } from "react-icons/fi";

/* ----------------------------- types ----------------------------- */
interface PatientRequest {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  condition: string;
  message: string;
  requestDate: string;
}

/* ----------------------------- helpers --------------------------- */
const safeStr = (v: any, fallback = "") => (v == null ? fallback : String(v));

const toDisplayName = (user: any, profileData?: Record<string, any>) => {
  const pdName = safeStr(profileData?.display_name).trim();
  if (pdName) return pdName;
  const full = safeStr(user?.full_name).trim();
  if (full) return full;
  const disp = safeStr(user?.display_name).trim();
  if (disp) return disp;
  const un = safeStr(user?.username).trim();
  return un || "Patient";
};

const toEmail = (user: any, profileData?: Record<string, any>) => {
  const em = safeStr(user?.email).trim() || safeStr(profileData?.email).trim();
  return em;
};

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toCondition = (obj: any, profileData?: Record<string, any>) => {
  const candidates = [
    obj?.primary_concern,
    obj?.condition,
    profileData?.primary_concern,
    profileData?.condition,
    profileData?.presenting_problem,
  ];
  for (const c of candidates) {
    const s = safeStr(c).trim();
    if (s) return s;
  }
  return "—";
};

const toGender = (obj: any, profileData?: Record<string, any>) => {
  const g = safeStr(obj?.gender).trim() || safeStr(profileData?.gender).trim();
  return g || "—";
};

const toAge = (obj: any, profileData?: Record<string, any>) => {
  if (obj?.age != null) return toNumber(obj.age, 0);
  if (profileData?.age != null) return toNumber(profileData.age, 0);
  const s = safeStr(profileData?.age_group || "");
  const m = s.match(/\d+/);
  if (m) return toNumber(m[0], 0);
  return 0;
};

const toRequestDate = (r: any) => {
  const raw = r?.requested_at || r?.created_at || r?.request_date;
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

/** Extracts patient info from various serializer shapes into normalized card data */
const mapToCard = (r: any): PatientRequest => {
  const patient = r?.patient ?? r?.patient_profile ?? r?.patient_user ?? {};
  const user = patient?.user ?? patient;
  const profileData = patient?.profile_data ?? patient?.profile ?? null;

  return {
    id: safeStr(r?.id ?? ""),
    name: toDisplayName(user, profileData),
    email: toEmail(user, profileData),
    age: toAge(patient, profileData),
    gender: toGender(patient, profileData),
    condition: toCondition(patient, profileData),
    message: safeStr(r?.message).trim(),
    requestDate: toRequestDate(r),
  };
};

/* ------------------------------ page ----------------------------- */
const PendingRequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const token =
    typeof window !== "undefined" ? (localStorage.getItem("session_key") || "").trim() : "";

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("doctor-patients");
    } catch {
      bcRef.current = null;
    }
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      // Always go via Next.js API proxy
      const res = await fetch(`/api/doctors/requests`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        let errTxt = "Failed to load requests";
        try {
          const err = await res.json();
          errTxt = err?.detail || err?.error || errTxt;
        } catch {}
        throw new Error(errTxt);
      }

      const data = await res.json();
      const items: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setPatientRequests(items.map(mapToCard));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function actionRequest(id: string, action: "accept" | "reject") {
    try {
      // Friendly status; API maps to Django's exact values.
      const res = await fetch(`/api/doctors/requests`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          requestId: id,
          status: action, // "accept" | "reject"
        }),
      });

      if (!res.ok) {
        let msg = "Action failed";
        try {
          const err = await res.json();
          msg = err?.detail || err?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      // Optimistic remove from pending
      setPatientRequests((prev) => prev.filter((p) => p.id !== id));

      // 🔔 Tell Patients page to refresh immediately
      try {
        bcRef.current?.postMessage({ type: "refresh" });
      } catch {}
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = (id: string) => actionRequest(id, "accept");
  const handleReject = (id: string) => actionRequest(id, "reject");

  const filteredRequests = useMemo(
    () =>
      patientRequests.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [patientRequests, searchQuery]
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div
        className="flex-1 bg-cover bg-center bg-no-repeat pb-16 px-8 overflow-y-auto"
        style={{ backgroundImage: "url('/doctordashboard/bg2.png')" }}
      >
        {/* Header */}
        <div className="pt-32 ml-20 sm:pt-16">
          <div className="flex items-center">
            <div className="text-4xl text-[#1E3CA7] font-bold">
              <TopRightIcons />
              <span className="mr-2">👤</span> Pending Requests
            </div>
          </div>
          <p className="text-lg text-[#1E3CA7] mt-2">
            {loading
              ? "Loading patient requests…"
              : "You have new patient requests waiting to be accepted or rejected."}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 ml-20 flex flex-wrap gap-4">
          <div className="flex-grow max-w-md relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients"
              className="w-full pl-12 pr-4 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] focus:outline-none focus:border-[#2196F3]"
              style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
            disabled
            title="Coming soon"
          >
            Age <FiChevronDown />
          </button>

          <button
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
            disabled
            title="Coming soon"
          >
            Condition <FiChevronDown />
          </button>

          <button
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
            disabled
            title="Coming soon"
          >
            Request Date <FiChevronDown />
          </button>
        </div>

        {/* Requests List */}
        <div className="my-8 ml-20 flex flex-col items-center">
          <div className="max-w-4xl w-full">
            <div className="flex flex-col gap-6">
              {filteredRequests.map((request) => (
                <PatientRequestCard
                  key={request.id}
                  patientRequest={request}
                  onAccept={() => handleAccept(request.id)}
                  onReject={() => handleReject(request.id)}
                />
              ))}

              {!loading && filteredRequests.length === 0 && (
                <div className="text-[#1E3CA7] opacity-70">
                  No pending requests found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsPage;
