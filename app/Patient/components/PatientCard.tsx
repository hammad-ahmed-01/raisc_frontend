"use client";

import { useState } from "react";
import type { Patient } from "@/src/types";
import CreateSessionForm from "./CreateNewSession";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { useRouter } from "next/navigation";
import { Smile, Meh, Frown } from "lucide-react";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  console.log(patient);

  const [showForm, setShowForm] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const router = useRouter();

  // ---------- Helpers ----------
  const formatFieldLabel = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getFieldValue = (field: any): string => {
    if (!field || field.value === null || field.value === undefined) {
      return field?.collected === false ? "Not provided" : "—";
    }
    return String(field.value);
  };

  // ---------- Extra Info ----------
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

  // ---------- Chatbot Insights ----------
  const chatbotInsight = "No recent chatbot insights available.";

  // ---------- Mood Today ----------
  const mood = "neutral";

  const moodConfig = {
    happy: { icon: Smile, color: "text-green-500", label: "Happy" },
    neutral: { icon: Meh, color: "text-yellow-500", label: "Neutral" },
    sad: { icon: Frown, color: "text-red-500", label: "Sad" },
  };

  const MoodIcon = moodConfig[mood as keyof typeof moodConfig]?.icon || Meh;
  const moodColor = moodConfig[mood as keyof typeof moodConfig]?.color || "text-gray-400";
  const moodLabel = moodConfig[mood as keyof typeof moodConfig]?.label || "Unknown";

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-6 mb-4 border">
        {/* Main Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6">
          {/* Name, Age, Gender, Mood */}
          <div className="flex flex-col gap-2 md:ml-4">
            <h2 className="text-base sm:text-lg font-bold text-heading2">
              {patient.name}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-normal">
              Age: {patient.age ?? "—"} | Gender: {patient.gender || "—"}
            </p>

            {/* Mood Today */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-gray-600">
                Mood Today:
              </span>
              <MoodIcon className={`w-4 h-4 ${moodColor}`} />
              <span className="text-xs text-gray-600">{moodLabel}</span>
            </div>
          </div>

          {/* Chatbot Insights */}
          <div className="md:col-span-2 rounded-lg px-5 py-4 flex flex-col gap-1">
            <p className="text-md font-bold text-black">
              Chatbot Insights:
            </p>
            <p className="text-sm text-normal leading-snug">
              {chatbotInsight}
            </p>
          </div>

          {/* View Profile */}
          <div className="flex justify-start md:justify-end">
            <PrimaryButton
              text="View Profile"
              className="rounded-full font-semibold px-5 py-2 whitespace-nowrap text-sm"
              onClick={() =>
                router.push(
                  `/chatbot-insights?id=${patient.id}&name=${encodeURIComponent(
                    patient.name
                  )}`
                )
              }
            />
          </div>

          {/* Create Session + Extra Info */}
          <div className="flex justify-start gap-3">
            {extraInfoFields.length > 0 && (
              <SecondaryButton
                text={showExtraInfo ? "Hide Info" : "View Info"}
                className="text-heading2 font-semibold rounded-full px-4 py-2 whitespace-nowrap text-sm"
                onClick={() => setShowExtraInfo(!showExtraInfo)}
              />
            )}

            <SecondaryButton
              text="Create Session"
              className="text-heading2 font-semibold rounded-full px-4 py-2 whitespace-nowrap text-sm"
              onClick={() => setShowForm(true)}
            />
          </div>
        </div>

        {/* Extra Information Section */}
        {showExtraInfo && extraInfoFields.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-base sm:text-lg font-bold text-heading2 mb-4">
              Additional Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extraInfoFields.map(({ key, data }) => (
                <div
                  key={key}
                  className="bg-[#F6FDFE] border border-[#E6E6FA] rounded-lg p-4"
                >
                  <p className="text-sm font-semibold text-heading2 mb-1">
                    {formatFieldLabel(key)}
                  </p>
                  <p
                    className={`text-sm ${
                      data?.collected === false || !data?.value
                        ? "text-gray-500 italic"
                        : "text-normal"
                    }`}
                  >
                    {getFieldValue(data)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative">
            <CreateSessionForm onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
};
