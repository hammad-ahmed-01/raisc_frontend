"use client";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import TopRightIcons from "@/components/TopRightIcons";
import PatientRequestCard from "./PatientRequestCard";
import RescheduleRequestCard from "./RescheduleRequestCard";
import { FiSearch, FiChevronDown, FiUsers, FiCalendar } from "react-icons/fi";

/* ----------------------------- types ----------------------------- */
interface ExtraInfo {
  duration?: {
    value: string | null;
    required: boolean;
    collected: boolean;
    description: string;
  };
  current_condition?: {
    value: string | null;
    required: boolean;
    collected: boolean;
    description: string;
  };
  physical_activity?: {
    value: string | null;
    required: boolean;
    collected: boolean;
    description: string;
  };
  suicidal_thoughts?: {
    value: string | null;
    required: boolean;
    collected: boolean;
    description: string;
  };
  mental_health_history?: {
    value: string | null;
    required: boolean;
    collected: boolean;
    description: string;
  };
}

interface PatientRequest {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  condition: string;
  message: string;
  requestDate: string;
  extraInfo?: ExtraInfo;
}

interface RescheduleRequest {
  id: number;
  calendar_session: number;
  session_title: string;
  patient_name: string;
  doctor_name: string;
  current_date: string;
  current_time: string | null;
  current_date_display: string;
  proposed_date: string;
  proposed_time: string;
  proposed_date_display: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_note: string;
  created_at: string;
  responded_at: string | null;
}

type TabType = 'patients' | 'reschedule';

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
    obj?.therapyFocus,
    obj?.therapy_focus,
    profileData?.therapyFocus,
    profileData?.therapy_focus,
    obj?.primary_concern,
    obj?.current_condition,
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

const extractExtraInfo = (obj: any, profileData?: Record<string, any>): ExtraInfo | undefined => {
  const questionnaireInsights = profileData?.questionnaire_insights || obj?.questionnaire_insights;
  if (!questionnaireInsights || typeof questionnaireInsights !== 'object') {
    return undefined;
  }

  const insights = questionnaireInsights as Record<string, any>;
  const extraInfo: ExtraInfo = {};
  const fields = ['duration', 'current_condition', 'physical_activity', 'mental_health_history'];
  
  for (const field of fields) {
    const value = insights[field];
    if (value && typeof value === 'string') {
      extraInfo[field as keyof ExtraInfo] = {
        value: value,
        required: true,
        collected: true,
        description: value,
      };
    }
  }

  return Object.keys(extraInfo).length > 0 ? extraInfo : undefined;
};

const mapToCard = (r: any): PatientRequest => {
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
    message: "",
    requestDate: toRequestDate(r),
    extraInfo: extractExtraInfo(patient, profileData),
  };
};

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("session_key");
  if (!token) return {};
  return { Authorization: `Token ${token}` };
}

/* ------------------------------ page ----------------------------- */
const PendingRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('patients');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Patient requests state
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // Reschedule requests state
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [loadingReschedule, setLoadingReschedule] = useState(false);

  // Fetch patient requests
  async function fetchPatientRequests() {
    setLoadingPatients(true);
    try {
      const res = await fetch(`/api/doctors/requests`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load patient requests");
      }

      const data = await res.json();
      const items: any[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setPatientRequests(items.map(mapToCard));
    } catch (e) {
      console.error("Error fetching patient requests:", e);
    } finally {
      setLoadingPatients(false);
    }
  }

  // Fetch reschedule requests
  async function fetchRescheduleRequests() {
    setLoadingReschedule(true);
    try {
      const res = await fetch(`/api/reschedule-requests/pending`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load reschedule requests");
      }

      const data = await res.json();
      const items: RescheduleRequest[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setRescheduleRequests(items);
    } catch (e) {
      console.error("Error fetching reschedule requests:", e);
    } finally {
      setLoadingReschedule(false);
    }
  }

  // Handle patient request actions
  async function handlePatientAction(id: string, action: "accept" | "reject") {
    try {
      const res = await fetch(`/api/doctors/requests`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ requestId: id, status: action === "accept" ? "approved" : "rejected" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || "Action failed");
      }

      setPatientRequests((prev) => prev.filter((p) => p.id !== id));

      // Notify other components
      try {
        const bc = new BroadcastChannel("doctor-patients");
        bc.postMessage({ type: "refresh" });
        bc.close();
      } catch {}
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  // Handle reschedule request actions
  async function handleRescheduleAction(id: number, action: "approve" | "reject", note?: string) {
    try {
      const res = await fetch(`/api/reschedule-requests/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ action, response_note: note || "" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || "Action failed");
      }

      setRescheduleRequests((prev) => prev.filter((r) => r.id !== id));

      // Notify calendar to refresh
      try {
        const bc = new BroadcastChannel("calendar-events");
        bc.postMessage({ type: "refresh-sessions" });
        bc.close();
      } catch {}
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  }

  useEffect(() => {
    fetchPatientRequests();
    fetchRescheduleRequests();
  }, []);

  // Listen for updates
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("calendar-events");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "refresh-sessions") {
          fetchRescheduleRequests();
        }
      };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, []);

  // Filtered lists
  const filteredPatientRequests = useMemo(
    () => patientRequests.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [patientRequests, searchQuery]
  );

  const filteredRescheduleRequests = useMemo(
    () => rescheduleRequests.filter((r) => r.patient_name.toLowerCase().includes(searchQuery.toLowerCase())),
    [rescheduleRequests, searchQuery]
  );

  // Counts
  const totalPatientPending = patientRequests.length;
  const totalReschedulePending = rescheduleRequests.length;
  const totalPending = totalPatientPending + totalReschedulePending;

  const isLoading = activeTab === 'patients' ? loadingPatients : loadingReschedule;

  const getCountText = () => {
    if (isLoading) return "Loading requests…";
    
    if (activeTab === 'patients') {
      return totalPatientPending === 0
        ? "No patient requests pending."
        : `${totalPatientPending} patient request${totalPatientPending === 1 ? "" : "s"} to review.`;
    } else {
      return totalReschedulePending === 0
        ? "No reschedule requests pending."
        : `${totalReschedulePending} reschedule request${totalReschedulePending === 1 ? "" : "s"} to review.`;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div
        className="flex-1 bg-cover bg-center bg-no-repeat pb-16 px-4 sm:px-8 overflow-y-auto"
        style={{ backgroundImage: "url('/doctordashboard/bg2.png')" }}
      >
        {/* Header */}
        <div className="pt-16 md:pt-16 ml-0 md:ml-20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-2xl sm:text-3xl md:text-4xl text-[#1E3CA7] font-bold">
              <TopRightIcons />
              <span className="mr-2">👤</span> Pending Requests
              {totalPending > 0 && (
                <span className="ml-3 px-3 py-1 bg-red-500 text-white text-lg rounded-full">
                  {totalPending}
                </span>
              )}
            </div>
          </div>
          <p className="text-base sm:text-lg text-[#1E3CA7] mt-2">{getCountText()}</p>
        </div>

        {/* Tabs */}
        <div className="mt-6 ml-0 md:ml-20">
          <div className="flex gap-2 sm:gap-4 border-b-2 border-[#E6E6FA]">
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all border-b-4 -mb-[2px] ${
                activeTab === 'patients'
                  ? 'text-[#1E3CA7] border-[#1E3CA7] bg-white/50'
                  : 'text-gray-500 border-transparent hover:text-[#1E3CA7]'
              }`}
            >
              <FiUsers className="w-5 h-5" />
              <span>Patient Requests</span>
              {totalPatientPending > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'patients' ? 'bg-[#1E3CA7] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {totalPatientPending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reschedule')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all border-b-4 -mb-[2px] ${
                activeTab === 'reschedule'
                  ? 'text-[#1E3CA7] border-[#1E3CA7] bg-white/50'
                  : 'text-gray-500 border-transparent hover:text-[#1E3CA7]'
              }`}
            >
              <FiCalendar className="w-5 h-5" />
              <span>Reschedule Requests</span>
              {totalReschedulePending > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === 'reschedule' ? 'bg-[#1E3CA7] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {totalReschedulePending}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 ml-0 md:ml-20 flex flex-wrap gap-4">
          <div className="flex-grow w-full sm:max-w-md relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'patients' ? "Search patients" : "Search by patient name"}
              className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] focus:outline-none focus:border-[#2196F3]"
              style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters - only for patient requests tab */}
          {activeTab === 'patients' && (
            <>
              <button
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2 hover:opacity-70"
                style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
                disabled
                title="Coming soon"
              >
                Age <FiChevronDown />
              </button>

              <button
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2 hover:opacity-70"
                style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
                disabled
                title="Coming soon"
              >
                Condition <FiChevronDown />
              </button>
            </>
          )}
        </div>

        {/* Requests List */}
        <div className="my-8 ml-0 md:ml-20 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-6">
              {/* Patient Requests Tab */}
              {activeTab === 'patients' && (
                <>
                  {filteredPatientRequests.map((request) => (
                    <PatientRequestCard
                      key={request.id}
                      patientRequest={request}
                      onAccept={() => handlePatientAction(request.id, "accept")}
                      onReject={() => handlePatientAction(request.id, "reject")}
                    />
                  ))}

                  {!loadingPatients && filteredPatientRequests.length === 0 && (
                    <div className="text-center py-12">
                      <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-[#1E3CA7] text-lg">No patient requests pending.</p>
                      <p className="text-gray-500 mt-1">New patient requests will appear here.</p>
                    </div>
                  )}
                </>
              )}

              {/* Reschedule Requests Tab */}
              {activeTab === 'reschedule' && (
                <>
                  {filteredRescheduleRequests.map((request) => (
                    <RescheduleRequestCard
                      key={request.id}
                      request={request}
                      onApprove={(note) => handleRescheduleAction(request.id, "approve", note)}
                      onReject={(note) => handleRescheduleAction(request.id, "reject", note)}
                    />
                  ))}

                  {!loadingReschedule && filteredRescheduleRequests.length === 0 && (
                    <div className="text-center py-12">
                      <FiCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-[#1E3CA7] text-lg">No reschedule requests pending.</p>
                      <p className="text-gray-500 mt-1">Patient reschedule requests will appear here.</p>
                    </div>
                  )}
                </>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin w-10 h-10 border-4 border-[#1E3CA7] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-[#1E3CA7]">Loading requests…</p>
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