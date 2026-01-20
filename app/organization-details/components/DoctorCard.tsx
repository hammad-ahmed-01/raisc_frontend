// app/organization-details/components/DoctorCard.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, GraduationCap, Heart, BadgeDollarSign, MessageSquareText } from "lucide-react";
import PrimaryButton from "@/components/Buttons/PrimaryButton";  // Assuming this exists in your project
import type { Doctor } from "../types";

interface Props {
  doctor: Doctor;
}

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

export default function DoctorCard({ doctor }: Props) {
  const router = useRouter();
  const info = doctor.professional_information || {};
  const displayName = info.display_name || doctor.user.username || "Doctor";
  const profileImage = info.profile_image || "/doctor.jpg";
  const rating = Number(info.rating || 0);
  const specialization = safeStr(info.specialization);
  const location = safeStr(info.location);
  const experience = safeStr(info.experience);
  const education = safeStr(info.education);
  const expertise = Array.isArray(info.expertise) ? info.expertise : [];
  const description = safeStr(info.description);
  const rates = doctor.rates ? `$${doctor.rates}` : "Contact for rates";

  const handleViewProfile = () => {
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    router.push("/AssociatedPsychologist");
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Profile Image */}
        <div className="rounded-full overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border-2 border-blue-500 flex-shrink-0 bg-blue-50">
          <Image
            src={profileImage}
            alt={displayName}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Name and Specialization */}
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-heading">
            {displayName}
          </h3>
          {specialization && (
            <p className="text-sm sm:text-base text-heading2 font-medium">
              {specialization}
            </p>
          )}
          {rating > 0 && (
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="ml-1 text-sm text-gray-700 font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-gray-700 mb-4">
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        {experience && (
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="truncate">{experience}</span>
          </div>
        )}

        {education && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">{education}</span>
          </div>
        )}

        {expertise.length > 0 && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">
              {expertise.join(", ")}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <BadgeDollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{rates}</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-heading2 line-clamp-3">
            {description}
          </p>
        </div>
      )}

      {/* View Profile Button */}
      <div className="mt-4 flex justify-center">
        <PrimaryButton
          onClick={handleViewProfile}
          text="View Profile"
          className="px-4 py-2 rounded-full font-semibold text-sm"
        />
      </div>
    </div>
  );
}