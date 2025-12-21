"use client";

import { useState } from "react";
import type { Patient } from "@/src/types";
import CreateSessionForm from "./CreateNewSession";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { useRouter } from "next/navigation";
import { Smile, Meh, Frown, Angry, Laugh } from "lucide-react";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const [showForm, setShowForm] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  const router = useRouter();

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

  const mood: string = patient?.profile_data?.mood?.current_mood ?? "neutral";

  const moodConfig = {
    happy: { icon: Smile, color: "text-green-500" },
    excited: { icon: Laugh, color: "text-blue-500" },
    neutral: { icon: Meh, color: "text-yellow-500" },
    sad: { icon: Frown, color: "text-orange-500" },
    angry: { icon: Angry, color: "text-red-500" },
    anxious: { icon: Meh, color: "text-purple-500" },
  };

  const MoodIcon =
    moodConfig[mood as keyof typeof moodConfig]?.icon || Meh;
  const moodColor =
    moodConfig[mood as keyof typeof moodConfig]?.color || "text-gray-400";

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

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-gray-600">
                Mood Today:
              </span>
              <MoodIcon className={`w-6 h-6 ${moodColor}`} />
            </div>
          </div>

          {/* Chatbot Insights */}
          <div className="md:col-span-2 px-5 py-4 flex flex-col gap-1">
            <p className="text-md font-bold text-black">Chatbot Insights:</p>
            <p className="text-sm text-normal leading-snug break-words">
              No recent chatbot insights available.
            </p>
          </div>

          {/* Actions – Fully Responsive */}
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
              className="
                rounded-full font-semibold px-5 py-2 text-sm
                w-full sm:w-auto
                whitespace-nowrap
              "
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
                className="
                  rounded-full px-4 py-2 text-sm
                  w-full sm:w-auto
                  whitespace-nowrap
                "
                onClick={() => setShowExtraInfo(!showExtraInfo)}
              />
            )}

            <SecondaryButton
              text="Create Session"
              className="
                rounded-full px-4 py-2 text-sm
                w-full sm:w-auto
                whitespace-nowrap
              "
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
