"use client"

// RegularPatientHome.tsx
import PreviousSessionCard from "./components/PreviousSessionCard";
import PsychologistCard from "./components/PsychologistCard";
import TipAndSupportCard from "./components/TipAndSupportCard";
import { User } from "@/app/dashboard/page";
import TopRightIcons from "@/components/TopRightIcons";


interface RegularPatientHomeProps {
  user: User;
}

export default function RegularPatientHome({ user }: RegularPatientHomeProps) {
    return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10 px-4 lg:px-0"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <TopRightIcons />

      <div className="relative ml-8 py-10 px-4 z-10 text-center pt-16 lg:pt-10">
        <h1 className="text-heading text-2xl lg:text-4xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
          Welcome back, {user.username}
        </h1>
        <p className="text-center text-lg lg:text-xl text-heading2 mt-2">
          Healing takes time, and asking for help is a courageous step.
        </p>
        <div className="mt-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          <PreviousSessionCard />
          <TipAndSupportCard />
          <PsychologistCard user={user} />
        </div>
      </div>
    </div>
  );
}
