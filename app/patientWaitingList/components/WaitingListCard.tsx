"use client";

import type { Patient } from "@/src/types";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

interface WaitingListPatient extends Omit<Patient, "condition" | "extraInfo"> {
  comment?: string;
}

interface WaitingListCardProps {
  patient: WaitingListPatient;
}

export const WaitingListCard: React.FC<WaitingListCardProps> = ({ patient }) => {
  const handleViewDetails = () => {
    // View details functionality - can be implemented later
    console.log("View details for:", patient.id);
  };

  const handleContact = () => {
    // Contact functionality - does nothing as per requirements
    console.log("Contact:", patient.id);
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-4 border">
      {/* Main Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6">
        {/* Name, Age */}
        <div className="flex flex-col gap-2 md:ml-4">
          <h2 className="text-base sm:text-lg font-bold text-heading2">
            {patient.name}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-normal">
            Age: {patient.age ?? "—"}
          </p>
        </div>

        {/* Comment */}
        <div className="md:col-span-2 rounded-lg px-5 py-4 flex flex-col gap-1">
          <p className="text-md font-bold text-black">Comment:</p>
          <p className="text-sm text-normal leading-snug">
            {patient.comment || "No comments available."}
          </p>
        </div>

        {/* View Details Button */}
        <div className="flex justify-start md:justify-end">
          <PrimaryButton
            text="View Details"
            className="rounded-full font-semibold px-5 py-2 whitespace-nowrap text-sm"
            onClick={handleViewDetails}
          />
        </div>

        {/* Contact Button */}
        <div className="flex justify-start gap-3">
          <SecondaryButton
            text="Contact"
            className="text-heading2 font-semibold rounded-full px-4 py-2 whitespace-nowrap text-sm"
            onClick={handleContact}
          />
        </div>
      </div>
    </div>
  );
};

