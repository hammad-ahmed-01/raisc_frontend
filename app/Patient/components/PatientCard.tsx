"use client";

import { useEffect, useState } from "react";
import type { Patient } from "@/src/types";
import CreateSessionForm from "./CreateNewSession";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { useRouter } from "next/navigation";
import { Smile, Meh, Frown, Angry, Laugh } from "lucide-react";

interface PatientCardProps {
  patient: Patient;
}

type MoodOption = {
  value: string;
  label: string;
};

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const [showForm, setShowForm] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [currentMood, setCurrentMood] = useState<string>("neutral");
  const [updatingMood, setUpdatingMood] = useState(false);

  const router = useRouter();
  const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

  /* ==============================
     Extra Info (UNCHANGED)
  ============================== */
  const extraInfoFields = patient.extraInfo
    ? [
        { key: "duration", data: patient.extraInfo.duration },
        { key: "current_condition", data: patient.extraInfo.current_condition },
        { key: "physical_activity", data: patient.extraInfo.physical_activity },
        { key: "suicidal_thoughts", data: patient.extraInfo.suicidal_thoughts },
        {
          key: "mental_health_history",
          data: patient.extraInfo.mental_health_history,
        },
      ].filter((item) => item.data !== undefined)
    : [];

  /* ==============================
     Fetch mood options + default
     (mood-today)
  ============================== */
  useEffect(() => {
    (async () => {
      try {
        if (!BASE) return;

        const headers: Record<string, string> = {};
        const tok = localStorage.getItem("session_key");
        if (tok) headers.Authorization = `Token ${tok}`;

        const res = await fetch(`${BASE}/patients/mood-today/`, {
          headers,
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setMoodOptions(data.moods || []);

        // set backend-defined default mood
        if (data.default) {
          setCurrentMood(data.default);
        }
      } catch (err) {
        console.error("Failed to load mood options:", err);
      }
    })();
  }, [BASE]);

  /* ==============================
     Set mood (set-mood)
  ============================== */
  async function updateMood(label: string) {
    if (!BASE || updatingMood) return;

    const option = moodOptions.find((m) => m.label === label);
    if (!option) return;

    setUpdatingMood(true);
    setCurrentMood(option.value);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const tok = localStorage.getItem("session_key");
      if (tok) headers.Authorization = `Token ${tok}`;

      await fetch(`${BASE}/patients/set-mood/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ mood: option.label }),
      });
    } catch (err) {
      console.error("Failed to update mood:", err);
    } finally {
      setUpdatingMood(false);
    }
  }

  /* ==============================
     Mood UI Mapping
  ============================== */
  const moodConfig = {
    happy: { icon: Smile, color: "text-green-500" },
    excited: { icon: Laugh, color: "text-blue-500" },
    neutral: { icon: Meh, color: "text-yellow-500" },
    sad: { icon: Frown, color: "text-orange-500" },
    angry: { icon: Angry, color: "text-red-500" },
    anxious: { icon: Meh, color: "text-purple-500" },
  };

  const MoodIcon =
    moodConfig[currentMood as keyof typeof moodConfig]?.icon || Meh;
  const moodColor =
    moodConfig[currentMood as keyof typeof moodConfig]?.color ||
    "text-gray-400";

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-6 mb-4 border w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          {/* Patient Info */}
          <div className="flex flex-col gap-2 md:ml-4">
            <h2 className="text-base sm:text-lg font-bold text-heading2 break-words">
              {patient.name}
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-normal">
              Age: {patient.age ?? "—"} | Gender: {patient.gender || "—"}
            </p>

            {/* Mood emoji + selector */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-semibold text-gray-600">
                Mood Today:
              </span>
              <MoodIcon className={`w-6 h-6 ${moodColor}`} />

              {moodOptions.length > 0 && (
                <select
                  className="text-xs border rounded-md px-2 py-1 bg-white"
                  value={
                    moodOptions.find((m) => m.value === currentMood)?.label ??
                    "Neutral"
                  }
                  onChange={(e) => updateMood(e.target.value)}
                  disabled={updatingMood}
                >
                  {moodOptions.map((m) => (
                    <option key={m.value} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Chatbot Insights */}
          <div className="md:col-span-2 px-5 py-4 flex flex-col gap-1">
            <p className="text-md font-bold text-black">Chatbot Insights:</p>
            <p className="text-sm text-normal leading-snug break-words">
              No recent chatbot insights available.
            </p>
          </div>

          {/* Actions */}
          <div
            className="
              md:col-span-2
              flex flex-col
              sm:flex-row
              flex-wrap
              md:flex-nowrap
              gap-3
              w-full
              md:justify-end
            "
          >
            <PrimaryButton
              text="View Profile"
              className="rounded-full font-semibold px-5 py-2 text-sm w-full sm:w-auto whitespace-nowrap"
              onClick={() =>
                router.push(
                  `/chatbot-insights?id=${patient.id}&name=${encodeURIComponent(
                    patient.name
                  )}`
                )
              }
            />

            {extraInfoFields.length > 0 && (
              <SecondaryButton
                text={showExtraInfo ? "Hide Info" : "View Info"}
                className="rounded-full px-4 py-2 text-sm w-full sm:w-auto whitespace-nowrap"
                onClick={() => setShowExtraInfo(!showExtraInfo)}
              />
            )}

            <SecondaryButton
              text="Create Session"
              className="rounded-full px-4 py-2 text-sm w-full sm:w-auto whitespace-nowrap"
              onClick={() => setShowForm(true)}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <CreateSessionForm onCancel={() => setShowForm(false)} />
        </div>
      )}
    </>
  );
};
