"use client";

import { useState } from "react";
import type { Patient } from "@/src/types";
import CreateSessionForm from "./CreateNewSession";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { useRouter } from "next/navigation";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  console.log(patient)
  const [showForm, setShowForm] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const router = useRouter();

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

  const extraInfoFields = patient.extraInfo
    ? [
        { key: 'duration', data: patient.extraInfo.duration },
        { key: 'current_condition', data: patient.extraInfo.current_condition },
        { key: 'physical_activity', data: patient.extraInfo.physical_activity },
        { key: 'suicidal_thoughts', data: patient.extraInfo.suicidal_thoughts },
        { key: 'mental_health_history', data: patient.extraInfo.mental_health_history },
      ].filter((item) => item.data !== undefined)
    : [];

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-3 mb-2 border">
        {/* Main Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2">
          {/* Column 1: Name, Age, Gender */}
          <div className="ml-0 md:ml-4">
            <h2 className="text-base sm:text-lg font-bold text-heading2">{patient.name}</h2>
            <p className="text-xs sm:text-sm font-semibold text-normal mt-1">
              Age: {patient.age ?? "—"} | Gender: {patient.gender || "—"}
            </p>
          </div>

          {/* Column 2: Condition */}
          <div className="ml-0 md:ml-8">
            <p className="text-sm text-normal"></p>
          </div>

          {/* Column 3: View Profile Button */}
          <div className="flex justify-start md:justify-end">
            <PrimaryButton
              text="Chatbot Profile"
              className="rounded-full font-semibold px-4 py-1.5 whitespace-nowrap text-sm"
              onClick={() => router.push(`/chatbot-insights?id=${patient.id}&name=${encodeURIComponent(patient.name)}`)}
            />
          </div>

          {/* Column 4: Create Session Button */}
          <div className="flex justify-start md:justify-start gap-2">
            {extraInfoFields.length > 0 && (
              <SecondaryButton
                text={showExtraInfo ? "Hide Info" : "View Info"}
                className="text-heading2 font-semibold rounded-full px-3 py-1.5 whitespace-nowrap text-sm"
                onClick={() => setShowExtraInfo(!showExtraInfo)}
              />
            )}
            <SecondaryButton
              text="Create Session"
              className="text-heading2 font-semibold rounded-full px-3 py-1.5 whitespace-nowrap text-sm"
              onClick={() => setShowForm(true)}
              disabled={false}
            />
          </div>
        </div>

        {/* Extra Information Section (Expandable) */}
        {showExtraInfo && extraInfoFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-base sm:text-lg font-bold text-heading2 mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extraInfoFields.map(({ key, data }) => (
                <div
                  key={key}
                  className="bg-[#F6FDFE] border border-[#E6E6FA] rounded-lg p-3"
                >
                  <p className="text-sm font-semibold text-heading2 mb-1">
                    {formatFieldLabel(key)}
                  </p>
                  <p className={`text-sm ${
                    data?.collected === false || !data?.value
                      ? "text-gray-500 italic"
                      : "text-normal"
                  }`}>
                    {getFieldValue(data)}
                  </p>
                  {/* {data?.description && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {data.description}
                    </p>
                  )} */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popup modal rendering CreateSessionForm */}
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
