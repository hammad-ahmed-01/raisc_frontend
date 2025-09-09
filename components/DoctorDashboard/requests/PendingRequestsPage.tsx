"use client";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import TopRightIcons from "@/components/TopRightIcons";
import PatientRequestCard from "./PatientRequestCard";
import { FiSearch, FiChevronDown } from "react-icons/fi";

/* ----------------------------- types ----------------------------- */
/** Must match your PatientRequestCard props (string id, required fields) */
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

/* ----------------------------- config ---------------------------- */
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

/* ------------------------------ page ----------------------------- */
const PendingRequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? (localStorage.getItem("session_key") || "").trim() : "";

  async function fetchRequests() {
    setLoading(true);
    try {
      // DRF: GET /users/doctor/requests/ (pending by default)
      const res = await fetch(`${BASE}/users/doctor/requests/`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();

      // Accept either paginated or plain list
      const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

      // Map to card-friendly structure, fill safe defaults
      const mapped: PatientRequest[] = items.map((r: any) => {
        const patient = r?.patient || {};
        const pUser = patient?.user || {};
        return {
          id: String(r?.id ?? ""),
          name:
            pUser?.full_name?.toString?.().trim?.() ||
            pUser?.display_name?.toString?.().trim?.() ||
            pUser?.username?.toString?.().trim?.() ||
            "Patient",
          email: String(pUser?.email || ""),
          age: Number(patient?.age ?? 0),
          gender: String(patient?.gender ?? "").trim() || "—",
          condition:
            String(patient?.primary_concern ?? patient?.condition ?? "").trim() || "—",
          message: String(r?.message ?? "").trim(),
          requestDate: r?.requested_at
            ? new Date(r.requested_at).toLocaleDateString()
            : r?.created_at
            ? new Date(r.created_at).toLocaleDateString()
            : "",
        };
      });

      setPatientRequests(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /** Accept/Reject using your DRF endpoint:
   * PATCH /users/doctor/manage-request/<pk>/
   * body: { status: "accepted" | "request_again" }
   */
  async function actionRequest(id: string, action: "accept" | "reject") {
    try {
      const statusVal = action === "accept" ? "accepted" : "request_again";
      const res = await fetch(`${BASE}/users/doctor/manage-request/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({ status: statusVal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || err?.error || "Action failed");
      }
      // Optimistically remove it from pending list
      setPatientRequests((prev) => prev.filter((p) => p.id !== id));
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
        <TopRightIcons />

        {/* Header */}
        <div className="pt-32 ml-20 sm:pt-16">
          <div className="flex items-center">
            <div className="text-4xl text-[#1E3CA7] font-bold">
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
