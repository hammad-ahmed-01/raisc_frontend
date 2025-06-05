import { FiBell, FiSettings } from "react-icons/fi";
import Quote from "./components/Quote";
import AIChat from "./components/AIChat";

export default function NewPatientHome() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative py-10"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      {/* Icons container */}
      <div className="absolute top-5 right-5 flex gap-6 z-20">
        <button
          className="text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
          style={{ background: "none", border: "none" }}
          aria-label="Notifications"
        >
          <FiBell />
        </button>
        <button
          className="text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
          style={{ background: "none", border: "none" }}
          aria-label="Setting"
        >
          <FiSettings />
        </button>
      </div>

      <div className="relative min-h-screen py-10 px-4 z-10">
        <h1 className="text-heading text-6xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
          Welcome to RAISC
        </h1>
        <p className="text-center text-2xl text-heading2 mt-2">
          The journey of thousand miles begin with one step
        </p>

        <Quote />
        <AIChat />
      </div>
    </div>
  );
}
