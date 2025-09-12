// SessionSummary.tsx
"use client";

import React from "react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export interface SessionSummaryData {
  id: string | number;          // accept number or string
  patient_display_name?: string;
  patient_name?: string;         // fallback
  date: string;                  // YYYY-MM-DD
  doctor_summary?: string;
}

interface SessionSummaryProps {
  open: boolean;
  session: SessionSummaryData | null;
  onClose: () => void;
  onSaved?: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ open, session, onClose, onSaved }) => {
  const [summary, setSummary] = React.useState<string>(session?.doctor_summary || "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setSummary(session?.doctor_summary || "");
    setError("");
  }, [session]);

  // If closed or no session, render nothing
  if (!open || !session) return null;

  // After the early return, it's safe to treat as non-null
  const current = session as SessionSummaryData;

  async function handleSave() {
    try {
      setSubmitting(true);
      setError("");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const tok = (localStorage.getItem("session_key") || "").trim();
        if (tok) headers.Authorization = `Token ${tok}`;
      }

      const sid = encodeURIComponent(String(current.id));

      const res = await fetch(`/api/doctors/update-summary/${sid}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ doctor_summary: summary }),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "Failed to save summary";
        try {
          const j = JSON.parse(text);
          msg = j?.error || j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      try {
        const bc = new BroadcastChannel("calendar-events");
        bc.postMessage({ type: "refresh-sessions" });
        bc.close();
      } catch {}

      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save summary");
    } finally {
      setSubmitting(false);
    }
  }

  const patientLabel = current.patient_display_name || current.patient_name || "Patient";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border-2 border-[#2196F3] rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold text-heading2 text-center mb-4">Session Summary</h2>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Patient:</span>
            <span className="text-gray-900">{patientLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Date:</span>
            <span className="text-gray-900">{current.date}</span>
          </div>
        </div>

        <label className="block text-base font-semibold text-gray-700 mb-1">Doctor Summary</label>
        <textarea
          className="w-full border rounded-md p-3 h-40 focus:ring-2 focus:ring-[#2196F3] outline-none"
          placeholder="Write your notes or session summary here…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        {error ? (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton
            text="Cancel"
            className="px-6 py-2 rounded-full font-semibold"
            onClick={onClose}
          />
          <PrimaryButton
            text={submitting ? "Saving..." : "Save"}
            className="px-6 py-2 rounded-full font-semibold"
            onClick={submitting ? undefined : handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
