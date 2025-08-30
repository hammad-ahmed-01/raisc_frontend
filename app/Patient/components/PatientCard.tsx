"use client";

import { useState } from "react";
import { Patient } from "@/src/types";
import CreateSessionForm from "./CreateNewSession"; 
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { useRouter } from "next/navigation";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="bg-white shadow-md rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 items-center gap-2 border">
        {/* Column 1: Name, Age, Gender */}
        <div className="ml-6">
          <h2 className="text-xl font-bold text-heading2">{patient.name}</h2>
          <p className="text-xl font-semibold text-normal mt-1">
            Age: {patient.age} | Gender: {patient.gender}
          </p>
        </div>

        {/* Column 2: Condition */}
        <div>
          <p className="text-xl text-normal ml-16">{patient.condition}</p>
        </div>

        {/* Column 3: View Profile Button */}
        <div className="flex justify-start md:justify-end">
          <PrimaryButton
            text="View Profile"
            className="rounded-full font-semibold px-6 py-2 whitespace-nowrap"
            onClick={() => router.push(`/chatbot-insights`)}
          />
        </div>

        {/* Column 4: Create Session Button */}
        <div className="flex justify-start md:justify-start">
          <SecondaryButton
            text="Create Session"
            className="text-heading2 font-semibold rounded-full px-4 py-2 whitespace-nowrap"
            onClick={() => setShowForm(true)}
            disabled={false}
          />

        </div>
      </div>

      {/* Popup modal rendering CreateSessionForm */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative">
            <CreateSessionForm />
          </div>
        </div>
      )}
    </>
  );
};
