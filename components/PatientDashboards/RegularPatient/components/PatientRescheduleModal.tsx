"use client";

import { useEffect, useState } from "react";
import { X, Calendar, Clock, MessageSquare } from "lucide-react";
import { createRescheduleRequest } from "@/lib/reschedule-requests";

export interface PatientSession {
  id: string | number;
  title?: string;
  date: string;        // YYYY-MM-DD or ISO string
  time?: string;       // HH:mm (optional, might be in date)
  doctor_name?: string;
  display_datetime?: string;
}

interface PatientRescheduleModalProps {
  open: boolean;
  session: PatientSession | null;
  doctorName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function extractDateAndTime(session: PatientSession): { date: string; time: string } {
  let dateStr = "";
  let timeStr = "14:00"; // default

  if (session.date) {
    // If it's an ISO datetime string
    if (session.date.includes("T")) {
      const dt = new Date(session.date);
      dateStr = dt.toISOString().split("T")[0];
      timeStr = dt.toTimeString().slice(0, 5);
    } else {
      // Already YYYY-MM-DD
      dateStr = session.date;
    }
  }

  // Override time if explicitly provided
  if (session.time) {
    timeStr = session.time;
  }

  return { date: dateStr, time: timeStr };
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function to12h(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const dt = new Date();
  dt.setHours(h, m || 0, 0, 0);
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function to24h(human: string): string {
  let hours = 0, minutes = 0;
  const trimmed = human.trim().toUpperCase();
  const ampm = /AM|PM/.test(trimmed) ? (trimmed.includes("PM") ? "PM" : "AM") : null;
  const digits = trimmed.replace(/AM|PM/i, "").trim();
  const parts = digits.split(":").map((x) => x.trim());
  hours = parseInt(parts[0] || "0", 10);
  minutes = parseInt(parts[1] || "0", 10);
  if (ampm) {
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function PatientRescheduleModal({
  open,
  session,
  doctorName,
  onClose,
  onSuccess,
}: PatientRescheduleModalProps) {
  const [proposedDate, setProposedDate] = useState<string>("");
  const [proposedTime, setProposedTime] = useState<string>("2:00 PM");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Current session info for display
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    if (!session) return;

    const { date, time } = extractDateAndTime(session);
    setCurrentDate(date);
    setCurrentTime(time);

    // Default proposed date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setProposedDate(tomorrow.toISOString().split("T")[0]);

    // Reset form
    setProposedTime("2:00 PM");
    setReason("");
    setError("");
    setSuccess(false);
  }, [session, open]);

  async function handleSubmit() {
    if (!session) return;

    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      // Validation
      if (!proposedDate) {
        throw new Error("Please select a proposed date.");
      }

      // Check date is in future
      const proposed = new Date(proposedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (proposed < today) {
        throw new Error("Proposed date must be in the future.");
      }

      // Convert time to 24h format
      const time24 = to24h(proposedTime);

      // Submit reschedule request
      const result = await createRescheduleRequest({
        calendar_session: Number(session.id),
        proposed_date: proposedDate,
        proposed_time: time24,
        reason: reason.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to submit request");
      }

      setSuccess(true);

      // Close after showing success message
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (e: any) {
      setError(e?.message || "Failed to submit reschedule request");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !session) return null;

  const sessionTitle = session.title || "Session";
  const doctor = doctorName || "your psychologist";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1E3CA7]">Request Reschedule</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-white/50"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Submit a request to reschedule. {doctor} will be notified and can approve or decline.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              ✓ Reschedule request submitted! Your psychologist will be notified.
            </div>
          )}

          {/* Current Session Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Session</p>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <Calendar className="w-5 h-5 text-[#1E3CA7]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{sessionTitle}</p>
                <p className="text-sm text-gray-600">
                  {formatDisplayDate(currentDate)}
                  {currentTime && ` at ${to12h(currentTime)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Proposed Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Proposed New Date
            </label>
            <input
              type="date"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#1E3CA7] focus:border-transparent transition"
              disabled={success}
            />
          </div>

          {/* Proposed Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              Proposed New Time
            </label>
            <select
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#1E3CA7] focus:border-transparent transition bg-white"
              disabled={success}
            >
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>1:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
              <option>5:00 PM</option>
              <option>6:00 PM</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let your psychologist know why you need to reschedule..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#1E3CA7] focus:border-transparent transition resize-none"
              disabled={success}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            className={`px-5 py-2 rounded-full font-medium transition ${
              submitting || success
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white hover:opacity-90"
            }`}
          >
            {submitting ? "Submitting..." : success ? "Submitted!" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}