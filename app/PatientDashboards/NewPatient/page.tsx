import Quote from "./components/Quote";
import AIChat from "./components/AIChat";

export default function NewPatientHome() {
  return (
    <div
      className="min-h-full bg-cover bg-center bg-fixed relative py-10"
      style={{
        backgroundImage: "url('/bg/patientbg.png')",
      }}
    >
      <div className="relative min-h-screen py-10 px-4 z-10">
        <h1 className="text-heading text-6xl font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
          Welcome to RAISC
        </h1>
        <p className="text-center text-[#5A6ACF] mt-2">
          The journey of thousand miles begin with one step
        </p>

        <Quote />
        <AIChat />
      </div>
    </div>
  );
}
