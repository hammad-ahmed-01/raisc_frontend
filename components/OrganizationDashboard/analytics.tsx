// components/AnalyticsDashboard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TopRightIcons from "@/components/TopRightIcons";

const dummyOrg = {
  name: "Pakistan Institute of Mental Health",
  total_psychologists: 10,
  total_patients: 30,
  sessions_today: 4,
  new_join_requests: 2,
  todays_sessions: [
    { doctor: "Dr. Ali Hamza", therapy_type: "Cognitive Therapy", time: "9:00 AM" },
    { doctor: "Dr. Alisha", therapy_type: "Cognitive Therapy", time: "11:00 AM" },
    { doctor: "Dr. Sara Ali", therapy_type: "Cognitive Therapy", time: "10:00 AM" },
    { doctor: "Dr. Zahra", therapy_type: "Cognitive Therapy", time: "3:00 PM" },
  ],
};

const dummyDoctors = [
  { name: "Dr. Ali Hamza", specialization: "Cognitive Therapy", assigned: 10, rating: 4.7, profile_image: "/doc.png" },
  { name: "Dr. Alisha", specialization: "Cognitive Therapy", assigned: 10, rating: 4.7, profile_image: "/doc.png" },
  { name: "Dr. Sara Ali", specialization: "Cognitive Therapy", assigned: 10, rating: 4.7, profile_image: "/doc.png" },
];

const sessionData = {
  Daily: [
    { name: "Mon", sessions: 5 },
    { name: "Tue", sessions: 7 },
    { name: "Wed", sessions: 4 },
    { name: "Thu", sessions: 6 },
    { name: "Fri", sessions: 8 },
    { name: "Sat", sessions: 3 },
    { name: "Sun", sessions: 2 },
  ],
  Weekly: [
    { name: "Week 1", sessions: 30 },
    { name: "Week 2", sessions: 28 },
    { name: "Week 3", sessions: 35 },
    { name: "Week 4", sessions: 40 },
  ],
  Annually: [
    { name: "JAN", sessions: 250 },
    { name: "FEB", sessions: 300 },
    { name: "MAR", sessions: 180 },
    { name: "APR", sessions: 260 },
    { name: "MAY", sessions: 400 },
    { name: "JUN", sessions: 350 },
    { name: "JUL", sessions: 370 },
    { name: "AUG", sessions: 340 },
    { name: "SEP", sessions: 310 },
    { name: "OCT", sessions: 290 },
    { name: "NOV", sessions: 200 },
    { name: "DEC", sessions: 390 },
  ],
};

type SessionRange = keyof typeof sessionData;

export default function AnalyticsDashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Ali Hamza");
  const [selectedRange, setSelectedRange] = useState<SessionRange>("Annually");
  const doctor = dummyDoctors.find((doc) => doc.name === selectedDoctor);

  return (
    <div className="p-4 sm:p-6 bg-[#F0F9FF] min-h-screen">
      <TopRightIcons />
      <div className="flex justify-between items-center mt-16 mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-heading2">Analytics & Reports</h1>
        <Button className="bg-heading2 font-semibold rounded-2xl text-lg text-white px-6">Export PDF</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Psychologists" value={dummyOrg.total_psychologists} />
        <StatCard title="Total Patients" value={dummyOrg.total_patients} />
        <StatCard title="Sessions This Month" value={40} />
        <StatCard title="Avg Session Rating" value="4.7 Rating" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4 rounded-3xl border-[#2196F3]">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-heading2">Sessions Over Time</h2>
            <div className="flex rounded-2xl p-1 gap-2 border border-[#2196F3]">
              {["Daily", "Weekly", "Annually"].map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  onClick={() => setSelectedRange(range as SessionRange)}
                  className={`px-4 py-1 rounded-2xl  text-sm font-semibold ${
                    selectedRange === range ? "bg-heading2 text-white" : "bg-white text-normal"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={sessionData[selectedRange]}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#11337A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#11337A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#11337A" fontSize={12} />
              <YAxis stroke="#11337A" fontSize={12} />
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
        </Card>

        <Card className="p-4 border-[#2196F3] rounded-3xl">
          <h2 className="text-2xl text-center font-bold text-heading2 mb-2">Doctors Performance</h2>
          <div className="mb-2 text-md font-semibold text-normal">Filter By:</div>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="mb-4 text-normal font-semibold border-[#2196F3] bg-[#E9F5FE]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {dummyDoctors.map((doc) => (
                <SelectItem key={doc.name} value={doc.name}>{doc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-4">
            <Image src={doctor?.profile_image ?? ""} alt="" width={64} height={64} className="rounded-full" />
            <div>
              <div className="font-bold text-xl text-heading2">{doctor?.name}</div>
              <div className="text-lg text-normal">{doctor?.specialization}</div>
              <div className="text-lg text-normal">Patient Handled: {doctor?.assigned}</div>
              <div className="text-lg text-normal">Avg Rating: {doctor?.rating}</div>
              <div className="text-lg text-green-600">Available Now</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="rounded-3xl border-[#2196F3]">
      <CardContent className="p-4 text-center">
        <div className="text-2xl text-heading2 font-semibold mb-1">{title}</div>
        <div className="text-2xl font-bold text-heading2">{value}</div>
      </CardContent>
    </Card>
  );
}
