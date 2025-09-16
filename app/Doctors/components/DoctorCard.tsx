// app/DoctorsPage/components/DoctorCard.tsx
"use client";

import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { BadgeDollarSign, GraduationCap, Heart, Info, MapPin, MessageSquareText, Sparkles, Star } from "lucide-react";
import { Doctor } from "../types";
import { safeStr, truncate } from "../_utils";

interface Props {
  doctor: Doctor;
  onViewProfile: (doctor: Doctor) => void;
  onSendRequest: (doctorId: number) => void;
  onCancelRequest: (doctorId: number) => void;
}

export default function DoctorCard({
  doctor,
  onViewProfile,
  onSendRequest,
  onCancelRequest,
}: Props) {
  return (
    <div className="bg-white bg-opacity-95 rounded-xl p-3 sm:p-6 shadow border-0 min-h-[300px] flex flex-col">
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="rounded-full overflow-hidden w-12 sm:w-20 h-12 sm:h-20 border-2 border-blue-200 flex-shrink-0 bg-blue-50">
          <Image
            src={doctor.profile_image}
            alt={doctor.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-xl font-bold text-blue-800 font-weight-700">
            {doctor.name}
          </h3>
          <p className="text-blue-600 font-weight-400 text-xs sm:text-base">
            {doctor.specialization}
          </p>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="ml-1 font-medium text-gray-700 font-weight-400 text-xs sm:text-base">
              {Number(doctor.rating || 0).toFixed(1)} Rating
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-3 text-gray-700 text-xs sm:text-sm font-weight-400">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>Location: {doctor.location || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MessageSquareText className="w-4 h-4 text-gray-600" />
          <span>Experience: {safeStr(doctor.experience) || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="truncate">{doctor.education || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="truncate">
            Expertise: {(doctor.expertise ?? []).join(", ") || "—"}
          </span>
        </div>
        {doctor.rates && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BadgeDollarSign className="w-4 h-4 text-green-600" />
            <span>Rates: {doctor.rates}</span>
          </div>
        )}
      </div>

      {/* About me snippet */}
      <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-100 rounded-lg p-2 sm:p-3">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-700" />
          <span className="text-blue-800 font-semibold text-xs sm:text-sm">About me</span>
        </div>
        <p className="text-xs sm:text-sm text-blue-900">
          {doctor.description?.trim()
            ? truncate(doctor.description.trim(), 180)
            : "—"}
        </p>
      </div>

      <div className="mt-auto pt-2 sm:pt-4 flex flex-col items-center">
        {doctor.requestStatus === "pending" && (
          <div className="mb-2 sm:mb-3 flex justify-center items-center gap-1.5 sm:gap-2 font-weight-700 text-[#1E3CA7] text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-[#1E3CA7]" /> Status: Pending Request
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full">
          <PrimaryButton
            text="View Profile"
            onClick={() => onViewProfile(doctor)}
            className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
          />
          {doctor.requestStatus === "pending" ? (
            <SecondaryButton
              text="Cancel Request"
              onClick={() => onCancelRequest(doctor.id)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-weight-700"
            />
          ) : (
            <SecondaryButton
              text="Send Request"
              onClick={() => onSendRequest(doctor.id)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold font-weight-700 text-xs sm:text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
