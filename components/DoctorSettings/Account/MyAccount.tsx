"use client";

import { Doctor } from "@/app/settings/account/page";
import Image from "next/image";
import Link from "next/link";

interface DoctorProps {
  doctor: Doctor & { chatgroup_nickname?: string };
}

export default function MyAccount({ doctor }: DoctorProps) {
  const phone = doctor.phone?.trim();
  const specialization = doctor.specialization?.trim();
  const img = doctor.imageUrl?.trim() || "/doc.png";
  const chatNick = doctor.chatgroup_nickname?.trim();
  const education = (doctor.education || "").trim();
  const expertise = Array.isArray(doctor.expertise)
    ? doctor.expertise
    : [];

  return (
    <div className="h-full overflow-hidden p-4 md:p-5">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-left text-[#1E3CA7] mb-6 md:mb-16">
          My Account
        </h1>

        {/* Account Detail Section - Single container */}
        <div
          className="bg-[#E9F5FE] rounded-3xl p-4 md:p-5 relative flex-1"
          style={{ border: "1px solid #2196F3" }}
        >
          {/* Doctor Profile Header - Inside Account Detail */}
          <div
            className="
              bg-white rounded-2xl p-4 md:p-5 mb-4 md:mb-5
              w-full md:w-[calc(100%-2.5rem)]
              static md:absolute md:top-0 md:-translate-y-1/2
            "
            style={{ border: "1px solid #2196F3" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden"
                  style={{ border: "2px solid #1E3CA7" }}
                >
                  <Image
                    src={img}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                    width={56}
                    height={56}
                  />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[#1E3CA7] mb-0.5">
                    {doctor.display_name || doctor.username}
                  </h2>
                  <p className="text-sm md:text-base text-[#1E3CA7] font-normal">
                    {specialization || "—"}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg md:text-xl">⭐</span>
                  <span className="text-sm md:text-base font-bold text-[#1E3CA7]">
                    {doctor.rating ?? "—"} Rating
                  </span>
                </div>
                <p className="text-sm md:text-md font-normal text-[#444444]">
                  Member Since {doctor.member_since || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Detail Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2 md:pt-10 mb-3 md:mb-4 gap-1">
            <h3 className="text-lg md:text-xl font-bold text-[#1E3CA7]">Account Detail</h3>
            <span className="text-sm md:text-md font-normal text-[#444444]">
              Last Login: {doctor.last_login || "—"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-5 mb-4 md:mb-5">
            {/* Left Column - 60% */}
            <div
              className="w-full md:w-[60%] bg-white rounded-xl p-4 space-y-3 md:space-y-4"
              style={{ border: "1px solid #2196F3" }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                <label className="text-sm md:text-md font-bold text-[#444444]">
                  Display Name
                </label>
                <p className="text-sm md:text-base font-normal text-[#444444]">
                  {doctor.display_name || doctor.username}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                <label className="text-sm md:text-md font-bold text-[#444444]">
                  Username
                </label>
                <p className="text-sm md:text-base font-normal text-[#444444]">
                  {doctor.username}
                </p>
              </div>

              {/* Chatgroup Nickname */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                <label className="text-sm md:text-md font-bold text-[#444444]">
                  Chatgroup Nickname
                </label>
                <p className="text-sm md:text-base font-normal text-[#444444]">
                  {chatNick || "—"}
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-1 gap-2">
                <span className="text-base font-semibold text-[#000000]">Email</span>
                <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
                  <span className="text-base font-normal text-[#444444] break-words">
                    {doctor.email || "ayesha@example.com"}
                  </span>
                  {doctor.emailVerified ? (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold flex items-center">
                      <span className="text-green-600 mr-1">✓</span>
                      Verified
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                <label className="text-sm md:text-md font-bold text-[#444444]">
                  Phone
                </label>
                {phone ? (
                  <p className="text-sm md:text-base font-normal text-[#444444]">{phone}</p>
                ) : (
                  <Link
                    href="/settings/edit-profile"
                    className="text-[#1E3CA7] text-sm md:text-md bg-transparent text-left font-semibold hover:underline"
                  >
                    Add a phone number
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column - 40% */}
            <div className="w-full md:w-[40%] flex flex-col gap-4">
              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-sm md:text-md font-semibold text-[#444444] block mb-3 text-center">
                  Affiliated Organization
                </label>
                <div className="text-center space-y-1">
                  <p className="text-sm md:text-base font-normal text-[#444444]">
                    {doctor.organization || "—"}
                  </p>
                  <p className="text-sm md:text-md font-normal text-[#444444]">
                    {doctor.location || "—"}
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center"
                style={{ border: "1px solid #2196F3" }}
              >
                <label className="text-sm md:text-md font-semibold text-[#444444] text-center">
                  Patients Assigned: {doctor.patients_assigned ?? "—"}
                </label>
              </div>
            </div>
          </div>

          {/* Qualification Section (no duplicates) */}
          <div
            className="bg-white rounded-xl p-4 mb-3 md:mb-4"
            style={{ border: "1px solid #2196F3" }}
          >
            <h3 className="text-lg md:text-xl font-bold text-[#444444] mb-3 md:mb-4">
              Qualification
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Education */}
              <div className="space-y-2">
                <h4 className="text-sm md:text-base font-semibold text-[#1E3CA7]">Education</h4>
                <p className="text-sm md:text-base font-normal text-[#444444]">
                  {education || "—"}
                </p>
                {(doctor.university || doctor.graduation_year) && (
                  <p className="text-xs md:text-sm font-normal text-[#7A8BA0]">
                    {doctor.university || "—"}
                    {doctor.graduation_year ? ` — ${doctor.graduation_year}` : ""}
                  </p>
                )}
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <h4 className="text-sm md:text-base font-semibold text-[#1E3CA7]">Expertise</h4>
                {expertise.length ? (
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((item, idx) => (
                      <span
                        key={`${item}-${idx}`}
                        className="px-2 py-0.5 rounded-full text-xs md:text-sm bg-[#E9F5FE] text-[#1E3CA7] border border-[#A6B6CC66]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm md:text-base font-normal text-[#444444]">—</p>
                )}
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <h4 className="text-sm md:text-base font-semibold text-[#1E3CA7]">Specialization</h4>
                <p className="text-sm md:text-base font-normal text-[#444444]">
                  {specialization || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Update Profile Link */}
          <div className="text-center">
            <p className="text-sm md:text-md font-normal text-[#1E3CA7]">
              Want to update your details?{" "}
              <Link
                href="/settings/edit-profile"
                className="underline font-semibold"
              >
                Go to Edit Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
