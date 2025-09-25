"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, X } from "lucide-react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export type TransportType = "video" | "audio" | "in-person";

export interface Session {
  id: string;
  patient_name: string;
  patient_user_id?: string | null;
  date: string;
  time: string;
  type?: TransportType;
  session_type?: string;
  title?: string;
}

interface RescheduleProps {
  open: boolean;
  session: Session | null;
  onClose: () => void;
  onSaved?: () => void;
}

function to12h(hhmm: string) {
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

export default function Reschedule({ open, session, onClose, onSaved }: RescheduleProps) {
  const [sessionType, setSessionType] = useState<string>("Follow-up");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) return;
    setSessionType(session.session_type || "Follow-up");
    setDate(session.date || "");
    setTime(session.time || "");
    setNotes("");
    setAttachments([]);
    setError("");
  }, [session]);

  const bc = useMemo(() => {
    try { return new BroadcastChannel("calendar-events"); } catch { return null; }
  }, []);
  useEffect(() => () => { try { bc?.close(); } catch {} }, [bc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };
  const handleBrowseClick = () => fileInputRef.current?.click();
  const removeFile = (idx: number) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  async function handleSave() {
    if (!session) return;
    setError("");
    setSaving(true);
    try {
      if (!date) throw new Error("Please select a date.");
      if (!time) throw new Error("Please select a time.");

      const time24 = /^\d{2}:\d{2}$/.test(time) ? time : to24h(time);

      const tags = [
        `[time=${time24}]`,
        `[session_type=${sessionType || "Follow-up"}]`,
        `[rescheduled_from=${session.id}]`,
      ];
      const description = `${notes.trim()}${notes.trim() ? "\n" : ""}${tags.join(" ")}`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const tok = (localStorage.getItem("session_key") || "").trim();
        if (tok) headers.Authorization = `Token ${tok}`;
      }

      const res = await fetch(`/api/doctors/reschedule-session/${session.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title: `${sessionType} Session`, description, date }),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "Failed to reschedule session";
        try { const j = JSON.parse(text); msg = j?.error || j?.detail || msg; } catch {}
        throw new Error(msg);
      }

      try { bc?.postMessage({ type: "refresh-sessions" }); } catch {}
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to reschedule session");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-3">
      <div className="bg-[#E6E6FA] border-[#2196F3] rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-heading mb-4">Reschedule Session</h2>

        <h3 className="text-sm sm:text-md font-semibold text-heading mb-4">{session.patient_name}</h3>

        {error ? (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-normal mb-1">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white" />
          </div>
          <div>
            <label className="block text-sm text-normal mb-1">Time</label>
            <select
              value={/^\d{2}:\d{2}$/.test(time) ? to12h(time) : time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              {time && !["2:00 PM", "3:00 PM", "4:00 PM"].includes(to12h(time)) && <option>{to12h(time)}</option>}
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-normal mb-1">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option>Follow-up</option>
              <option>Initial</option>
              <option>Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-normal mb-1">Patient</label>
            <Input value={session.patient_name} disabled className="bg-gray-100" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-normal mb-1">Notes</label>
          <Textarea
            placeholder="Add notes or adjustments for this session..."
            rows={3}
            className="bg-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-normal mb-1">Attachments (optional)</label>
          <div
            onClick={handleBrowseClick}
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 bg-white text-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <UploadCloud className="w-5 h-5 mr-2" />
            Drag and drop files here, or <span className="text-blue-600 font-medium ml-1">Browse</span>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {attachments.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-normal rounded-full p-1 hover:bg-gray-200"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <SecondaryButton text="Cancel" className="px-8 sm:px-10 py-2 rounded-full font-semibold" onClick={onClose} />
          <PrimaryButton
            text={saving ? "Saving..." : "Save Changes"}
            className="px-4 py-2 rounded-full font-semibold"
            onClick={saving ? undefined : handleSave}
          />
        </div>
      </div>
    </div>
  );
}
