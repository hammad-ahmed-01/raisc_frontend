import { PatientList } from "./components/PatientList";
import { patients } from "./components/Patients";
import TopRightIcons from "./components/TopRightIcons";

export default function PatientsPage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg/mypatientsbg.png')" }}
    >
      {/* Fixed Top Right Icons */}
      <div className="absolute top-6 right-6 z-20">
        <TopRightIcons />
      </div>

      {/* Main content area */}
      <div className="pt-24 backdrop-blur-sm bg-blue-50/40 min-h-screen">
        <PatientList patients={patients} />
      </div>
    </main>
  );
}
