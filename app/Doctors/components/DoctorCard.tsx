// app/DoctorsPage/components/DoctorCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import {
  BadgeDollarSign,
  GraduationCap,
  Heart,
  Info,
  MapPin,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";
import { Doctor as BaseDoctor } from "../types";
import { safeStr, truncate } from "../_utils";
import { getToken } from "@/lib/auth";

type RequestStatus = "none" | "pending" | "accepted";

// Extend the imported Doctor type locally so we don’t
// have to change your shared types file.
type Doctor = BaseDoctor & {
  user_id?: number;
  username?: string;
  requestStatus?: RequestStatus;
};

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

interface Props {
  doctor: Doctor;
  onViewProfile: (doctor: Doctor) => void;
  onSendRequest?: (doctorId: number) => void;
  onCancelRequest?: (doctorId: number) => void;
}

/** Read status from localStorage snapshot for resilience */
function computeStatusFromLocal(doctor: Doctor): RequestStatus {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return "none";
    const me = JSON.parse(raw);
    const pp = me?.patient_profile || {};
    const assocRaw =
      pp?.associated_psychologist ?? pp?.associated_psychologist_id ?? null;
    const assocName = (pp?.associated_psychologist_name || "").toString().trim();
    const assocId =
      assocRaw != null && !isNaN(Number(assocRaw)) ? Number(assocRaw) : null;

    if (
      assocId != null &&
      (Number(doctor.user_id ?? NaN) === assocId || Number(doctor.id) === assocId)
    ) {
      return "accepted";
    }
    if (
      assocName &&
      (assocName.toLowerCase() === (doctor.name || "").toLowerCase() ||
        assocName.toLowerCase() === (doctor.username || "").toLowerCase())
    ) {
      return "accepted";
    }

    const sentArr: string[] = Array.isArray(pp?.sent_requests) ? pp.sent_requests : [];
    if (
      sentArr.includes(String(doctor.id)) ||
      (doctor.user_id != null && sentArr.includes(String(doctor.user_id)))
    ) {
      return "pending";
    }
    return "none";
  } catch {
    return "none";
  }
}

export default function DoctorCard({
  doctor,
  onViewProfile,
  onSendRequest,
  onCancelRequest,
}: Props) {
  const [status, setStatus] = useState<RequestStatus>(
    doctor.requestStatus || computeStatusFromLocal(doctor)
  );
  const [sending, setSending] = useState(false);

  // keep status in sync if parent updates doctor.requestStatus
  useEffect(() => {
    const next = doctor.requestStatus || computeStatusFromLocal(doctor);
    setStatus(next);
  }, [doctor]);

  // react to cross-tab/profile updates (e.g., acceptance)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "profile-updated") {
          setStatus(computeStatusFromLocal(doctor));
        }
      };
    } catch {
      // ignore
    }
    return () => {
      if (bc) bc.close();
    };
  }, [doctor]);

  const handleSend = async () => {
    if (sending || status !== "none") return;
    setSending(true);

    if (isBackendConnected && BASE) {
      try {
        const token = getToken();
        if (!token) {
          console.error("Missing auth token");
          setSending(false);
          return;
        }
        const resp = await fetch(`${BASE}/users/doctor/request/${doctor.id}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (!resp.ok) {
          const t = await resp.text();
          console.error("Request failed", resp.status, t);
          setSending(false);
          return;
        }
      } catch (e) {
        console.error("sendRequest error", e);
        setSending(false);
        return;
      }
    }

    // Update local snapshot for instant UI
    try {
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        const sentSet = new Set(parsed?.patient_profile?.sent_requests ?? []);
        sentSet.add(String(doctor.id));
        parsed.patient_profile = {
          ...(parsed.patient_profile || {}),
          sent_requests: [...sentSet],
        };
        localStorage.setItem("user_data", JSON.stringify(parsed));
        try {
          new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    setStatus("pending");
    setSending(false);
    onSendRequest?.(doctor.id);
  };

  const handleCancel = async () => {
    // Backend cancel not implemented; demo only
    if (isBackendConnected) {
      console.info("Cancel request is not supported by backend yet.");
      return;
    }
    try {
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        const sentArr: string[] = parsed?.patient_profile?.sent_requests ?? [];
        parsed.patient_profile = {
          ...(parsed.patient_profile || {}),
          sent_requests: sentArr.filter((x) => x !== String(doctor.id)),
        };
        localStorage.setItem("user_data", JSON.stringify(parsed));
        try {
          new BroadcastChannel("profile-sync").postMessage({ type: "profile-updated" });
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
    setStatus("none");
    onCancelRequest?.(doctor.id);
  };

  const actionArea = useMemo(() => {
    if (status === "accepted") {
      return (
        <>
          <div className="mb-2 sm:mb-3 flex justify-center items-center gap-1.5 sm:gap-2 font-weight-700 text-[#1E3CA7] text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-[#1E3CA7]" /> Associated Psychologist
          </div>
          <div className="flex justify-center">
            <PrimaryButton
              text="View Profile"
              onClick={() => onViewProfile(doctor)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
            />
          </div>
        </>
      );
    }
    if (status === "pending") {
      return (
        <>
          <div className="mb-2 sm:mb-3 flex justify-center items-center gap-1.5 sm:gap-2 font-weight-700 text-[#1E3CA7] text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-[#1E3CA7]" /> Status: Pending Request
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full">
            <PrimaryButton
              text="View Profile"
              onClick={() => onViewProfile(doctor)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
            />
            <SecondaryButton
              text="Cancel Request"
              onClick={handleCancel}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-weight-700"
            />
          </div>
        </>
      );
    }
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full">
        <PrimaryButton
          text="View Profile"
          onClick={() => onViewProfile(doctor)}
          className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
        />
        <SecondaryButton
          text={sending ? "Sending…" : "Send Request"}
          onClick={handleSend}
          className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
        />
      </div>
    );
  }, [status, sending, doctor, onViewProfile]);

  return (
    <div className="bg-white bg-opacity-95 rounded-xl p-3 sm:p-6 shadow border-0 min-h-[300px] flex flex-col">
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="rounded-full overflow-hidden w-12 sm:w-20 h-12 sm:h-20 border-2 border-blue-200 flex-shrink-0 bg-blue-50">
          <Image
            src={doctor.profile_image}
            alt={doctor.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-xl font-bold text-blue-800 font-weight-700">
            {doctor.name}
          </h3>
          <p className="text-blue-600 font-weight-400 text-xs sm:text-base">
            {doctor.specialization}
          </p>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="ml-1 font-medium text-gray-700 font-weight-400 text-xs sm:text-base">
              {Number(doctor.rating || 0).toFixed(1)} Rating
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-3 text-gray-700 text-xs sm:text-sm font-weight-400">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>Location: {doctor.location || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MessageSquareText className="w-4 h-4 text-gray-600" />
          <span>Experience: {safeStr(doctor.experience) || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="truncate">{doctor.education || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="truncate">
            Expertise: {(doctor.expertise ?? []).join(", ") || "—"}
          </span>
        </div>
        {doctor.rates && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BadgeDollarSign className="w-4 h-4 text-green-600" />
            <span>Rates: {doctor.rates}</span>
          </div>
        )}
      </div>

      {/* About me snippet */}
      <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-100 rounded-lg p-2 sm:p-3">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-700" />
          <span className="text-blue-800 font-semibold text-xs sm:text-sm">About me</span>
        </div>
        <p className="text-xs sm:text-sm text-blue-900">
          {doctor.description?.trim()
            ? truncate(doctor.description.trim(), 180)
            : "—"}
        </p>
      </div>

      <div className="mt-auto pt-2 sm:pt-4 flex flex-col items-center">{actionArea}</div>
    </div>
  );
}
