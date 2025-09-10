"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, X } from "lucide-react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

interface CreateSessionFormProps {
  onCancel: () => void; // 👈 parent passes this
}

type PatientRow = {
  id: string;        // coerced string
  name: string;      // display name or username
  age?: number;
  gender?: "Male" | "Female" | "Other";
  condition?: string;
};

export default function CreateSessionForm({ onCancel }: CreateSessionFormProps) {
  const [sessionType, setSessionType] = useState("Follow-up");
  const [time, setTime] = useState("2:00 PM");
  const [date, setDate] = useState("2025-07-16");
  const [patientName, setPatientName] = useState("Ayesha Khan");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast to refresh the calendar list
  const bc = useMemo(() => {
    try {
      return new BroadcastChannel("calendar-events");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (typeof window !== "undefined") {
          const tok = (localStorage.getItem("session_key") || "").trim();
          if (tok) headers.Authorization = `Token ${tok}`;
        }

        const res = await fetch("/api/doctors/patients", { headers, cache: "no-store" });
        const data = await res.json().catch(() => []);
        const items: any[] = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : []);

        const mapped: PatientRow[] = items.map((row: any) => {
          const u = row?.user ?? {};
          const pd = (row?.profile_data ?? {}) as Record<string, any>;
          const display =
            (pd.display_name && String(pd.display_name).trim()) ||
            (u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : "") ||
            String(u.username || "Patient");
          return { id: String(u.id ?? row.id ?? ""), name: display };
        });

        setPatients(mapped);
      } catch (e) {
        console.error("Load patients failed", e);
      }
    })();

    return () => {
      try {
        bc?.close();
      } catch {}
    };
  }, [bc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files; 
    if (!files || files.length === 0) return;
    setAttachments(prev => [...prev, ...Array.from(files)]);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // "2:00 PM" -> "14:00"
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

  async function handleCreate() {
    setError("");
    setSubmitting(true);
    try {
      // Resolve patient by name (case-insensitive exact, then contains)
      const q = patientName.trim().toLowerCase();
      const match =
        patients.find((p) => p.name.toLowerCase() === q) ||
        patients.find((p) => p.name.toLowerCase().includes(q));
      if (!match) {
        setError("Patient not found. Please type their exact display name as shown in My Patients.");
        setSubmitting(false);
        return;
      }

      // Build a description that carries the time tag for the calendar
      const time24 = to24h(time); // "HH:mm"
      const timeTag = `[time=${time24}]`;
      const description = `${notes.trim()}${notes.trim() ? "\n" : ""}${timeTag}`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const tok = (localStorage.getItem("session_key") || "").trim();
        if (tok) headers.Authorization = `Token ${tok}`;
      }

      // IMPORTANT: Send date-only to Django (Calendar.date is likely a DateField)
      const res = await fetch("/api/doctors/create-session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          patient_id: match.id,
          title: `${sessionType} Session`,
          description, // includes [time=HH:mm]
          date,        // YYYY-MM-DD only
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "Failed to create session";
        try {
          const j = JSON.parse(text);
          msg = j?.error || j?.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      // notify calendar to refresh
      try {
        bc?.postMessage({ type: "refresh-sessions" });
      } catch {}

      // clear attachments (we're not uploading them in this flow)
      setAttachments([]);

      // close the modal/sheet
      onCancel?.();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#E6E6FA] border-[#2196F3] rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-heading mb-4">
        Create New session
      </h2>

      <h3 className="text-md font-semibold text-heading mb-4">
        Session Information
      </h3>

      {error ? (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-normal mb-1">Patient</label>
          <Input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="bg-white"
            placeholder="Type the patient name as in My Patients"
          />
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
          <label className="block text-sm text-normal mb-1">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <label className="block text-sm text-normal mb-1">Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option>2:00 PM</option>
            <option>3:00 PM</option>
            <option>4:00 PM</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-normal mb-1">Session Notes</label>
        <Textarea
          placeholder="Add objectives, concern or focus area for this session..."
          rows={3}
          className="bg-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Attachment Section (UI only for now) */}
      <div className="mt-4">
        <label className="block text-sm text-normal mb-1">Attachments (optional)</label>
        <div
          onClick={handleBrowseClick}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-4 bg-white text-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          Drag and drop files here, or{" "}
          <span className="text-blue-600 font-medium ml-1">Browse</span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

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
        <SecondaryButton
          text="Cancel"
          className="px-10 py-2 rounded-full flex items-center text-center font-semibold"
          onClick={onCancel}
        />

        <PrimaryButton
          text={submitting ? "Creating..." : "Create Session"}
          className="px-4 py-2 rounded-full flex items-center text-center font-semibold"
          onClick={submitting ? undefined : handleCreate}
        />
      </div>
    </div>
  );
}
