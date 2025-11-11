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

  // Helper function for auth header
  const getAuthHeader = () => ({
    Authorization: `Token ${typeof window !== "undefined" ? localStorage.getItem("session_key") : ""}`,
  });

  // Fetch all data
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
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10 px-4 lg:px-0"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <TopRightIcons />

      <div className="relative ml-32 py-10 px-4 z-10">
        {/* Welcome Heading */}
        <h1
          className="text-3xl font-bold text-[#1E3CA7] text-left mb-8"
          style={{
            fontWeight: 700,
            fontFamily: "Quicksand, Arial, sans-serif",
          }}
        >
          Welcome, {orgDetails?.name || "Organization"}
        </h1>

        {/* Statistics */}
        <div className="w-full flex justify-between gap-8 mb-12 pr-16">
          {[
            { label: "Total Psychologists", value: orgDetails?.no_of_doctors ?? doctors.length },
            { label: "Total Patients", value: doctors.reduce((sum, d) => sum + (d.no_of_patients ?? 0), 0) },
            { label: "Sessions Today", value: calendarEvents.length },
            { label: "New Join Request", value: orgDetails?.details?.new_join_requests ?? 0 },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex-1 bg-white rounded-2xl border border-[#2196F3] px-10 py-6 text-center shadow"
              style={{ boxShadow: "0px 4px 12px 0px #D0E3FFC7" }}
            >
              <div className="text-base text-[#1E3CA7]" style={{ fontWeight: 600 }}>
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-[#1E3CA7] mt-2" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Psychologists Section */}
        <div className="mb-6 flex flex-col" style={{ width: "100%" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1E3CA7]" style={{ fontWeight: 700 }}>
              Psychologists
            </h2>
            <div className="mr-8">
              <PrimaryButton
                text="Add Psychologist"
                onClick={() => router.push("/Organization")}
                className="font-semibold px-6 py-2 rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="bg-[#D0E3FFC7] rounded-3xl p-8 flex flex-col items-center mx-auto"
              style={{
                width: "90%",
                overflowY: doctors.length > 3 ? "auto" : "visible",
                maxHeight: doctors.length > 3 ? "440px" : "none",
                boxShadow: "0px 4px 12px 0px #D0E3FFC7",
              }}
            >
              {doctors.length > 0 ? (
                doctors.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-2xl mb-6 px-8 py-6 border border-[#2196F3] w-full"
                    style={{
                      fontWeight: 400,
                      boxShadow: "0px 4px 12px 0px #D0E3FFC7",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src="/doc.png"
                        alt={doc.doctor_name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full border-2 border-[#2196F3] object-cover bg-white"
                      />
                      <div>
                        <div className="text-lg font-bold text-[#1E3CA7]" style={{ fontWeight: 700 }}>
                          {doc.doctor_name}
                        </div>
                        <div className="text-[#1E3CA7] text-base" style={{ fontWeight: 600 }}>
                          Patients: {doc.no_of_patients}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 min-w-[220px] justify-end">
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-[#1E3CA7] text-base" style={{ fontWeight: 600 }}>
                          Rate: {doc.rates}
                        </div>
                        <div className="text-[#1E3CA7] text-base flex items-center gap-1" style={{ fontWeight: 400 }}>
                          <span>🌟</span> {doc.chatgroup_nickname}
                        </div>
                      </div>
                      <PrimaryButton text="View Profile" className="font-semibold px-6 py-2 rounded-full" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#1E3CA7] text-lg font-semibold">No psychologists registered yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar & Sessions */}
        <CalendarView />
        <TodaysSessions />
      </div>
    </div>
  );
};

export default OrganizationDashboard;
