"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TopRightIcons from "@/components/TopRightIcons";

type SessionRange = "Daily" | "Weekly" | "Annually";

interface Doctor {
  doctor_name: string;
  professional_information?: Record<string, any>;
  chatgroup_nickname?: string;
  no_of_patients?: number;
  rates?: string;
}

interface Organization {
  id: number;
  name: string;
  no_of_doctors?: number;
  total_patients?: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
}

export default function AnalyticsDashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<SessionRange>("Annually");

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    Authorization: `Token ${
      typeof window !== "undefined" ? localStorage.getItem("session_key") : ""
    }`,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [orgRes, docRes, countRes, calRes] = await Promise.all([
          fetch("/api/organization", { headers: getAuthHeader() }),
          fetch("/api/organization/view-doctors", { headers: getAuthHeader() }),
          fetch("/api/organization/no-of-doctors", { headers: getAuthHeader() }),
          fetch("/api/organization/doctor-calendar", {
            headers: getAuthHeader(),
          }),
        ]);

        const [orgData, docData, countData, calData] = await Promise.all([
          orgRes.json(),
          docRes.json(),
          countRes.json(),
          calRes.json(),
        ]);

        const orgDetails = Array.isArray(orgData) ? orgData[0] : orgData;
        setOrganization({
          ...orgDetails,
          no_of_doctors: countData?.[0]?.no_of_doctors ?? 0,
          total_patients: Array.isArray(docData)
            ? docData.reduce(
                (sum: number, d: any) => sum + (d.no_of_patients ?? 0),
                0
              )
            : 0,
        });

        setDoctors(Array.isArray(docData) ? docData : []);
        setCalendarEvents(Array.isArray(calData) ? calData : []);

        if (docData.length > 0) setSelectedDoctor(docData[0].doctor_name);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const sessionData = {
    Daily: buildSessionFrequency(calendarEvents, "day"),
    Weekly: buildSessionFrequency(calendarEvents, "week"),
    Annually: buildSessionFrequency(calendarEvents, "month"),
  };

  const doctor = doctors.find((doc) => doc.doctor_name === selectedDoctor);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-[#F0F9FF] min-h-screen flex justify-center items-center text-[#1E3CA7] font-semibold">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="p-4 sm:pl-24 bg-[#F0F9FF] min-h-screen">
      <TopRightIcons />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-16 mb-6 gap-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading2">
          Analytics & Reports
        </h1>
        <Button className="bg-heading2 font-semibold rounded-2xl text-sm sm:text-lg text-white px-4 sm:px-6 py-2 sm:py-2">
          Export PDF
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:ml-0">
        <StatCard
          title="Total Psychologists"
          value={organization?.no_of_doctors ?? 0}
        />
        <StatCard
          title="Total Patients"
          value={organization?.total_patients ?? 0}
        />
        <StatCard title="Sessions This Month" value={calendarEvents.length} />
        <StatCard title="Avg Session Rating" value={averageRating(doctors)} />
      </div>

      {/* Charts and Doctor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Session Trend Chart */}
        <Card className="lg:col-span-2 p-4 rounded-3xl border-[#2196F3]">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-lg sm:text-2xl font-bold text-heading2 text-center sm:text-left">
              Sessions Over Time
            </h2>

            <div className="flex flex-wrap justify-center sm:justify-end rounded-2xl p-1 gap-2 border border-[#2196F3]">
              {["Daily", "Weekly", "Annually"].map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  onClick={() => setSelectedRange(range as SessionRange)}
                  className={`px-3 sm:px-4 py-1 rounded-2xl text-sm font-semibold transition ${
                    selectedRange === range
                      ? "bg-heading2 text-white"
                      : "bg-white text-normal"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionData[selectedRange]}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11337A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#11337A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#11337A" fontSize={10} />
                <YAxis stroke="#11337A" fontSize={10} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#11337A"
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Doctor Performance Card */}
        <Card className="p-4 border-[#2196F3] rounded-3xl">
          <h2 className="text-xl sm:text-2xl text-center font-bold text-heading2 mb-2">
            Doctors Performance
          </h2>
          <div className="mb-2 text-sm sm:text-md font-semibold text-normal text-center sm:text-left">
            Filter By:
          </div>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="mb-4 text-normal font-semibold border-[#2196F3] bg-[#E9F5FE]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doc, i) => (
                <SelectItem key={i} value={doc.doctor_name}>
                  {doc.doctor_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Image
              src="/doc.png"
              alt={doctor?.doctor_name || "doctor"}
              width={64}
              height={64}
              className="rounded-full mx-auto sm:mx-0"
            />
            <div>
              <div className="font-bold text-lg sm:text-xl text-heading2">
                {doctor?.doctor_name}
              </div>
              <div className="text-sm sm:text-lg text-normal">
                Patients Handled: {doctor?.no_of_patients ?? 0}
              </div>
              <div className="text-sm sm:text-lg text-normal">
                Avg Rating: {doctor?.rates ?? "N/A"}
              </div>
              <div className="text-sm sm:text-lg text-green-600">
                Available Now
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper: Build frequency summary
function buildSessionFrequency(
  events: CalendarEvent[],
  range: "day" | "week" | "month"
) {
  if (!events?.length) return [];

  const buckets: Record<string, number> = {};

  for (const ev of events) {
    const date = new Date(ev.date);
    let key = "";

    if (range === "day") key = date.toLocaleDateString("en-US", { weekday: "short" });
    else if (range === "week") key = `Week ${Math.ceil(date.getDate() / 7)}`;
    else key = date.toLocaleDateString("en-US", { month: "short" });

    buckets[key] = (buckets[key] || 0) + 1;
  }

  return Object.entries(buckets).map(([name, sessions]) => ({ name, sessions }));
}

// Helper: Average rating
function averageRating(doctors: Doctor[]) {
  if (!doctors.length) return "N/A";
  const validRates = doctors
    .map((d) => parseFloat(d.rates || "0"))
    .filter((r) => r > 0);
  if (!validRates.length) return "N/A";
  const avg = validRates.reduce((a, b) => a + b, 0) / validRates.length;
  return `${avg.toFixed(1)} Rating`;
}

// Stat Card
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="rounded-3xl border-[#2196F3]">
      <CardContent className="p-4 sm:p-6 text-center">
        <div className="text-base sm:text-xl text-heading2 font-semibold mb-1">
          {title}
        </div>
        <div className="text-xl sm:text-2xl font-bold text-heading2">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
