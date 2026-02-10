"use client";
import React, { useState } from "react";
import { FiCheck, FiX, FiCalendar, FiClock, FiArrowRight, FiMessageSquare } from "react-icons/fi";

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

interface RescheduleRequestCardProps {
  request: RescheduleRequest;
  onApprove?: (note?: string) => void;
  onReject?: (note?: string) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  // Handle HH:mm format
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return timeStr;
  const dt = new Date();
  dt.setHours(h, m || 0, 0, 0);
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatRequestDate(isoStr: string): string {
  if (!isoStr) return "";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const RescheduleRequestCard: React.FC<RescheduleRequestCardProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [hidden, setHidden] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setBusy(action);
    try {
      if (action === "approve") {
        await onApprove?.(responseNote || undefined);
      } else {
        await onReject?.(responseNote || undefined);
      }
      setHidden(true);
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setBusy(null);
    }
  };

  if (hidden) return null;

  const currentDateTime = `${formatDate(request.current_date)}${request.current_time ? ` at ${formatTime(request.current_time)}` : ""}`;
  const proposedDateTime = `${formatDate(request.proposed_date)} at ${formatTime(request.proposed_time)}`;

  return (
    <div
      className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-[24px] p-4 sm:p-6 shadow-sm"
      style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#1E3CA7]">
            {request.patient_name}
          </h3>
          <p className="text-sm text-gray-600">
            Session: <span className="font-medium">{request.session_title || "Therapy Session"}</span>
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Requested: {formatRequestDate(request.created_at)}
        </div>
      </div>

      {/* Date Change Visual */}
      <div className="bg-white rounded-xl p-4 mb-4 border border-[#E6E6FA]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Current Date */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current</p>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span className="text-[#1E3CA7] font-medium">{currentDateTime}</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center justify-center">
            <FiArrowRight className="w-6 h-6 text-[#2196F3]" />
          </div>
          <div className="sm:hidden flex items-center gap-2 text-sm text-gray-400">
            <span>↓ Change to</span>
          </div>

          {/* Proposed Date */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Proposed</p>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-semibold">{proposedDateTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      {request.reason && (
        <div className="bg-[#F6FDFE] rounded-lg p-3 mb-4 border border-[#E6E6FA]">
          <div className="flex items-start gap-2">
            <FiMessageSquare className="w-4 h-4 text-[#1E3CA7] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-[#444444]">{request.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Response Note Input (Optional) */}
      {showNoteInput && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#1E3CA7] mb-1">
            Add a note (optional)
          </label>
          <textarea
            value={responseNote}
            onChange={(e) => setResponseNote(e.target.value)}
            placeholder="E.g., Please arrive 10 minutes early for the new time..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#2196F3] focus:border-transparent"
            rows={2}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="text-sm text-[#1E3CA7] hover:underline"
        >
          {showNoteInput ? "Hide note" : "+ Add response note"}
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => handleAction("reject")}
            disabled={!!busy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition ${
              busy === "reject"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white border border-red-300"
            }`}
          >
            <FiX className="w-5 h-5" />
            <span>{busy === "reject" ? "Declining..." : "Decline"}</span>
          </button>

          <button
            onClick={() => handleAction("approve")}
            disabled={!!busy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition ${
              busy === "approve"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-100 text-green-600 hover:bg-green-500 hover:text-white border border-green-300"
            }`}
          >
            <FiCheck className="w-5 h-5" />
            <span>{busy === "approve" ? "Approving..." : "Approve"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleRequestCard;