// app/Doctor/Requests/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
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
const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toDisplayName = (user: any, profileData?: Record<string, any>) => {
  const pdName = safeStr(profileData?.display_name).trim();
  if (pdName) return pdName;
  const full = safeStr(user?.full_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`).trim();
  if (full) return full;
  const disp = safeStr(user?.display_name).trim();
  if (disp) return disp;
  const un = safeStr(user?.username).trim();
  return un || "Patient";
};
const toEmail = (user: any, profileData?: Record<string, any>) =>
  safeStr(user?.email).trim() || safeStr(profileData?.email).trim();
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
const toGender = (obj: any, profileData?: Record<string, any>) =>
  safeStr(obj?.gender).trim() || safeStr(profileData?.gender).trim() || "—";
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

/** Extracts patient info from DRF DoctorRequestSerializer → normalized card data */
const mapToCard = (r: any): PatientRequest => {
  // DRF returns: { id, patient: { id, username, email, profile_data }, status, requested_at }
  const patient = r?.patient ?? {};
  const user = {
    username: patient?.username,
    email: patient?.email,
    first_name: patient?.first_name,
    last_name: patient?.last_name,
  };
  const profileData = patient?.profile_data ?? null;

  return {
    id: safeStr(r?.id ?? ""),
    name: toDisplayName(user, profileData),
    email: toEmail(user, profileData),
    age: toAge(profileData, profileData),
    gender: toGender(profileData, profileData),
    condition: toCondition(profileData, profileData),
    message: "", // optional message not present in current serializer
    requestDate: toRequestDate(r),
  };
};

/* ------------------------------ page ----------------------------- */
const PendingRequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchRequests() {
    setLoading(true);
    try {
      // Next proxy → Django /users/doctor/requests/
      const res = await fetch(`/api/doctors/requests`, {
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("session_key")
            ? { Authorization: `Token ${localStorage.getItem("session_key")}` }
            : {}),
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
      const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const mapped = items.map(mapToCard);
      setPatientRequests(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function actionRequest(id: string, action: "accept" | "reject") {
    try {
      // Our Next route normalizes → 'approved' or 'rejected'
      const res = await fetch(`/api/doctors/requests`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("session_key")
            ? { Authorization: `Token ${localStorage.getItem("session_key")}` }
            : {}),
        },
        body: JSON.stringify({ requestId: id, status: action === "accept" ? "approved" : "rejected" }),
      });

      if (!res.ok) {
        let msg = "Action failed";
        try {
          const err = await res.json();
          msg = err?.detail || err?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      // Remove from list
      setPatientRequests((prev) => prev.filter((p) => p.id !== id));

      // Tell /patients page to refresh its list immediately
      try {
        const bc = new BroadcastChannel("doctor-patients");
        bc.postMessage({ type: "refresh" });
        bc.close();
      } catch {}
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = (id: string) => actionRequest(id, "accept");
  const handleReject = (id: string) => actionRequest(id, "reject");

  const filteredRequests = useMemo(
    () => patientRequests.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
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
            {loading ? "Loading patient requests…" : "You have new patient requests waiting to be accepted or rejected."}
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
                <div className="text-[#1E3CA7] opacity-70">No pending requests found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsPage;
