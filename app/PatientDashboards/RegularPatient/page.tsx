// NewPatientHome.tsx
import TopRightIcons from "./components/Navigation";
import PreviousSessionCard from "./components/PreviousSessionCard";
import PsychologistCard from "./components/PsychologistCard";
import TipAndSupportCard from "./components/TipAndSupportCard";

export default function NewPatientHome() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <TopRightIcons />

      <div className="relative py-10 px-4 z-10 text-center">
        <h1 className="text-heading text-6xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
          Welcome back, Name
        </h1>
        <p className="text-center text-2xl text-heading2 mt-2">
          Healing takes time, and asking for help is a courageous step.
        </p>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
          <PreviousSessionCard />
          <TipAndSupportCard />
          <PsychologistCard />
        </div>
      </div>
    </div>
  );
}
