"use client";

import { Patient } from "@/app/settings/account/page";
import Image from "next/image";
import Link from "next/link";

interface PatientProps {
  patient: Patient;
}

export default function MyAccount({ patient }: PatientProps) {
  const phone = patient.phone?.trim();

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-left text-[#1E3CA7] mb-4">
          My Account
        </h1>

        {/* Main Account Container */}
        <div
          className="bg-[#E6F3FF] rounded-2xl p-4 flex-1 overflow-y-auto flex flex-col"
          style={{ border: "1px solid #87CEEB" }}
        >
          {/* Patient Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden"
                style={{ border: "2px solid #1E3CA7" }}
              >
                <Image
                  src="/patient.png"
                  alt="Patient"
                  className="w-full h-full object-cover"
                  width={56}
                  height={56}
                />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#1E3CA7]">
                  {patient.displayName || "Ayesha Khan"}
                </h2>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-sm font-normal text-[#444444]">
                Last Login: {patient.lastLogin || "—"}
              </span>
            </div>
          </div>

          {/* Account Detail Section */}
          <div
            className="bg-white rounded-2xl py-4 mb-4"
            style={{ border: "1px solid #87CEEB" }}
          >
            <h3 className="px-4 text-lg font-bold text-[#1E3CA7] mb-4">
              Account Detail
            </h3>

            <div
              className="px-4 space-y-3 bg-[#F0F9FFC7] py-4"
              style={{
                borderTop: "1px solid #2196F3",
                borderBottom: "1px solid #2196F3",
              }}
            >
              {[
                ["Display Name", patient.displayName || "Ayesha"],
                ["Username", patient.username || "Ayesha_123"],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex flex-col md:flex-row md:justify-between md:items-center py-1 gap-1"
                >
                  <span className="text-base font-semibold text-[#000000]">
                    {label}
                  </span>
                  <span className="text-base font-normal text-[#444444] break-words">
                    {val}
                  </span>
                </div>
              ))}

              {/* Email */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-1 gap-2">
                <span className="text-base font-semibold text-[#000000]">Email</span>
                <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
                  <span className="text-base font-normal text-[#444444] break-words">
                    {patient.email || "ayesha@example.com"}
                  </span>
                  {patient.emailVerified ? (
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-center py-1 gap-1">
                <span className="text-base font-semibold text-[#000000]">
                  Phone
                </span>
                {phone ? (
                  <span className="text-base font-normal text-[#444444]">{phone}</span>
                ) : (
                  <Link
                    href="/settings/profile"
                    className="text-[#1E3CA7] text-base font-semibold hover:underline"
                  >
                    Add a phone number
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section with Therapy Focus and Sessions */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div
              className="flex-1 bg-white rounded-2xl p-4"
              style={{ border: "1px solid #87CEEB" }}
            >
              <h4 className="text-base font-bold text-[#000000] mb-2">
                Therapy Focus
              </h4>
              <p className="text-sm font-normal text-[#444444]">
                {patient.therapyFocus || "Managing Stress and Anxiety."}
              </p>
            </div>

            <div
              className="flex-1 bg-white rounded-2xl p-4"
              style={{ border: "1px solid #87CEEB" }}
            >
              <h4 className="text-base font-bold text-[#000000] mb-2">
                Sessions Completed: {patient.sessionsCompleted ?? "—"}
              </h4>
              <p className="text-sm font-normal text-[#444444]">
                Last Session: {patient.lastSession || "—"}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-2 text-center">
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
