"use client";
import React, { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

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
  id: string | number;
  name: string;
  email: string;
  age: number;
  gender: string;
  condition: string;
  message: string;
  requestDate: string;
  extraInfo?: ExtraInfo;
}

interface PatientRequestCardProps {
  patientRequest: PatientRequest;
  onAccept?: () => void;
  onReject?: () => void;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    for (const k of ["session_key", "access_token", "token", "authToken"]) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
  } catch {}
  return null;
}

function buildAuthHeader(): { key: "Authorization"; value: string } | null {
  const t = getToken();
  if (!t) return null;
  const looksJWT = t.includes(".");
  return { key: "Authorization", value: `${looksJWT ? "Bearer" : "Token"} ${t}` };
}

const PatientRequestCard: React.FC<PatientRequestCardProps> = ({
  patientRequest,
  onAccept,
  onReject,
}) => {
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string>("");
  const [hidden, setHidden] = useState<boolean>(false);

  const handleAction = async (intent: "accept" | "reject") => {
    setError("");

    const requestId = patientRequest.id;
    if (requestId == null) {
      setError("Invalid request id.");
      return;
    }

    const auth = buildAuthHeader();
    if (!auth) {
      setError("Not logged in. Please sign in again.");
      return;
    }

    setBusy(intent);
    try {
      const res = await fetch(`/api/doctors/requests`, {
        method: "PATCH",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          [auth.key]: auth.value,
        } as Record<string, string>,
        body: JSON.stringify({
          requestId,
          status: intent === "accept" ? "accepted" : "reject",
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(`Failed to ${intent}. ${res.status} ${txt || ""}`);
        setBusy(null);
        return;
      }

      // Success - call callback and hide
      if (intent === "accept") onAccept?.();
      else onReject?.();
      setHidden(true);

      // Notify other UI components
      try {
        window.dispatchEvent(
          new CustomEvent("doctor-request-updated", { detail: { id: requestId, intent } })
        );
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setBusy(null);
    }
  };

  if (hidden) return null;

  const formatFieldLabel = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldValue = (field: any): string => {
    if (!field || field.value === null || field.value === undefined) {
      return field?.collected === false ? "Not provided" : "—";
    }
    return String(field.value);
  };

  const extraInfoFields = patientRequest.extraInfo
    ? [
        { key: 'duration', data: patientRequest.extraInfo.duration },
        { key: 'current_condition', data: patientRequest.extraInfo.current_condition },
        { key: 'physical_activity', data: patientRequest.extraInfo.physical_activity },
        { key: 'suicidal_thoughts', data: patientRequest.extraInfo.suicidal_thoughts },
        { key: 'mental_health_history', data: patientRequest.extraInfo.mental_health_history },
      ].filter((item) => item.data !== undefined)
    : [];

  // Format age display
  const ageDisplay = patientRequest.age > 0 ? patientRequest.age : "—";
  const genderDisplay = patientRequest.gender && patientRequest.gender !== "—" 
    ? patientRequest.gender 
    : "—";

  return (
    <div
      className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-[24px] p-4 sm:p-6 shadow-sm"
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Left section */}
        <div className="flex-grow">
          <div className="mb-3">
            <h3 className="text-lg sm:text-xl font-bold text-[#1E3CA7]">
              {patientRequest.name}
            </h3>
            <p className="text-[#1E3CA7]">
              <span className="font-bold">Email:</span> {patientRequest.email}
            </p>
            {patientRequest.condition && patientRequest.condition !== "—" && (
              <p className="text-[#1E3CA7]">
                <span className="font-bold">Focus:</span> {patientRequest.condition}
              </p>
            )}
          </div>

          {/* Extra Information Section */}
          {extraInfoFields.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg font-bold text-[#1E3CA7] mb-3">
                Additional Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extraInfoFields.map(({ key, data }) => (
                  <div
                    key={key}
                    className="bg-[#F6FDFE] border border-[#E6E6FA] rounded-lg p-3"
                  >
                    <p className="text-sm font-semibold text-[#1E3CA7] mb-1">
                      {formatFieldLabel(key)}
                    </p>
                    <p className={`text-sm ${
                      data?.collected === false || !data?.value
                        ? "text-gray-500 italic"
                        : "text-[#444444]"
                    }`}>
                      {getFieldValue(data)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patientRequest.message && (
            <p className="text-[#444444] mb-4">{patientRequest.message}</p>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Right section */}
        <div className="flex flex-col items-center md:items-end mt-2 md:mt-0">
          <div className="text-center md:text-right mb-4 md:mb-8">
            <p className="text-[#444444] mb-1">
              <span className="text-[#222] font-semibold">Age:</span> {ageDisplay}
              <span className="mx-2">·</span>
              <span className="text-[#222] font-semibold">Gender:</span> {genderDisplay}
            </p>
            <p className="text-[#444444]">
              <span className="text-[#222] font-semibold">Request Date:</span>{" "}
              {patientRequest.requestDate || "—"}
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => handleAction("accept")}
              className={`${
                busy === "accept" ? "opacity-60 cursor-not-allowed" : "hover:bg-green-600"
              } bg-green-500 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition`}
              title="Accept"
              disabled={!!busy}
            >
              <FiCheck size={22} className="md:hidden" />
              <FiCheck size={24} className="hidden md:block" />
            </button>
            <button
              onClick={() => handleAction("reject")}
              className={`${
                busy === "reject" ? "opacity-60 cursor-not-allowed" : "hover:bg-red-600"
              } bg-red-500 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition`}
              title="Reject"
              disabled={!!busy}
            >
              <FiX size={22} className="md:hidden" />
              <FiX size={24} className="hidden md:block" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRequestCard;