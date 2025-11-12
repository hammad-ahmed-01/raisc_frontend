"use client";
import React from "react";
import TopRightIcons from "@/components/TopRightIcons";
import TodaysSessions from "./components/Calendar/TodaysSessions";
import CalendarView from "./components/Calendar/CalendarView";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

interface Doctor {
  id: number;
  doctor_name: string;
  professional_information: Record<string, any>;
  chatgroup_nickname: string;
  rates: string;
  no_of_patients: number;
}

interface Organization {
  id: number;
  name: string;
  location?: string;
  details?: Record<string, any>;
  no_of_doctors?: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  details: string;
  description: string;
  doctor_summary: string;
  patient_update: string;
  doctor_id: number;
  patient_id: number;
}

const OrganizationDashboard: React.FC = () => {
  const router = useRouter();
  const [orgDetails, setOrgDetails] = React.useState<Organization | null>(null);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const getAuthHeader = () => ({
    Authorization: `Token ${
      typeof window !== "undefined" ? localStorage.getItem("session_key") : ""
    }`,
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [orgRes, docsRes, countRes, calRes] = await Promise.all([
          fetch("/api/organization", { headers: getAuthHeader() }),
          fetch("/api/organization/view-doctors", { headers: getAuthHeader() }),
          fetch("/api/organization/no-of-doctors", { headers: getAuthHeader() }),
          fetch("/api/organization/doctor-calendar", { headers: getAuthHeader() }),
        ]);

        const [orgData, docData, countData, calData] = await Promise.all([
          orgRes.json(),
          docsRes.json(),
          countRes.json(),
          calRes.json(),
        ]);

        setOrgDetails({
          ...(Array.isArray(orgData) ? orgData[0] : orgData),
          no_of_doctors: countData?.[0]?.no_of_doctors ?? 0,
        });

        setDoctors(Array.isArray(docData) ? docData : []);
        setCalendarEvents(Array.isArray(calData) ? calData : []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center text-lg font-semibold text-[#1E3CA7]">
        Loading organization data...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10 px-2 sm:px-4 md:px-6 lg:px-0"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <TopRightIcons />

      <div className="relative md:ml-10 lg:ml-20 py-10 px-2 sm:px-4 z-10">
        {/* Welcome Heading */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#1E3CA7] text-left mb-6 sm:mb-8"
          style={{
            fontWeight: 700,
            fontFamily: "Quicksand, Arial, sans-serif",
          }}
        >
          Welcome, {orgDetails?.name || "Organization"}
        </h1>

        {/* Statistics Section */}
        <div className="w-full flex flex-col sm:flex-row sm:flex-wrap justify-between gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-12 pr-0 sm:pr-8 md:pr-16">
          {[
            {
              label: "Total Psychologists",
              value: orgDetails?.no_of_doctors ?? doctors.length,
            },
            {
              label: "Total Patients",
              value: doctors.reduce((sum, d) => sum + (d.no_of_patients ?? 0), 0),
            },
            { label: "Sessions Today", value: calendarEvents.length },
            {
              label: "New Join Request",
              value: orgDetails?.details?.new_join_requests ?? 0,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex-1 min-w-[150px] bg-white rounded-2xl border border-[#2196F3] px-6 py-4 sm:px-8 sm:py-6 text-center shadow"
              style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
            >
              <div
                className="text-sm sm:text-base text-[#1E3CA7]"
                style={{ fontWeight: 600 }}
              >
                {stat.label}
              </div>
              <div
                className="text-xl sm:text-2xl font-bold text-[#1E3CA7] mt-2"
                style={{ fontWeight: 700 }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Psychologists Section */}
        <div className="mb-6 flex flex-col w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
            <h2
              className="text-xl sm:text-2xl font-bold text-[#1E3CA7]"
              style={{ fontWeight: 700 }}
            >
              Psychologists
            </h2>
            <div className="sm:mr-8">
              <PrimaryButton
                text="Add Psychologist"
                onClick={() => router.push("/Organization")}
                className="font-semibold px-5 sm:px-6 py-2 rounded-full text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="bg-[#D0E3FFC7] rounded-3xl p-4 sm:p-8 flex flex-col items-center mx-auto w-full sm:w-[90%]"
              style={{
                overflowY: doctors.length > 3 ? "auto" : "visible",
                maxHeight: doctors.length > 3 ? "440px" : "none",
                boxShadow: "0px 4px 12px 0px #D0E3FFC7",
              }}
            >
              {doctors.length > 0 ? (
                doctors.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center sm:justify-between bg-white rounded-2xl mb-4 sm:mb-6 px-4 sm:px-8 py-4 sm:py-6 border border-[#2196F3] w-full"
                    style={{
                      fontWeight: 400,
                      boxShadow: "0px 4px 12px 0px #D0E3FFC7",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <Image
                        src="/doc.png"
                        alt={doc.doctor_name}
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#2196F3] object-cover bg-white"
                      />
                      <div className="text-center sm:text-left">
                        <div
                          className="text-base sm:text-lg font-bold text-[#1E3CA7]"
                          style={{ fontWeight: 700 }}
                        >
                          {doc.doctor_name}
                        </div>
                        <div
                          className="text-[#1E3CA7] text-sm sm:text-base"
                          style={{ fontWeight: 600 }}
                        >
                          Patients: {doc.no_of_patients}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 justify-center sm:justify-end mt-3 sm:mt-0 w-full sm:w-auto">
                      <div className="flex flex-col items-center sm:items-end gap-1">
                        <div
                          className="text-[#1E3CA7] text-sm sm:text-base"
                          style={{ fontWeight: 600 }}
                        >
                          Rate: {doc.rates}
                        </div>
                        <div
                          className="text-[#1E3CA7] text-sm sm:text-base flex items-center gap-1"
                          style={{ fontWeight: 400 }}
                        >
                          <span>🌟</span> {doc.chatgroup_nickname}
                        </div>
                      </div>
                      <PrimaryButton
                        text="View Profile"
                        className="font-semibold px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#1E3CA7] text-base sm:text-lg font-semibold text-center">
                  No psychologists registered yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar & Sessions */}
        <div className="w-full mt-10">
          <CalendarView />
          <TodaysSessions />
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
