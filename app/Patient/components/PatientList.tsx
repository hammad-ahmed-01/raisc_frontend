"use client";

import { useEffect, useState } from "react";
import { Patient } from "@/src/types";
import { PatientCard } from "./PatientCard";
import { SearchInput } from "./SearchInput";
import { FilterBar } from "./FilterBar";
import { Users } from "lucide-react";

interface PatientListProps {
  patients: Patient[];
}

export const PatientList: React.FC<PatientListProps> = ({ patients }) => {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Patient[]>(patients);

  // 🔧 keep local filtered list in sync when parent updates `patients`
  useEffect(() => {
    setFiltered(patients);
  }, [patients]);

  const handleFilters = (type: "age" | "gender" | "condition", value: string) => {
    let updated = [...patients];

    if (type === "age" && value) {
      const [min, max] = value.split("-").map(Number);
      updated = updated.filter((p) => (p.age ?? 0) >= min && (p.age ?? 0) <= max);
    }
    if (type === "gender" && value) {
      updated = updated.filter(
        (p) => (p.gender || "").toLowerCase() === value.toLowerCase()
      );
    }
    if (type === "condition" && value) {
      updated = updated.filter((p) =>
        (p.condition || "").toLowerCase().includes(value.toLowerCase())
      );
    }

    setFiltered(updated);
  };

  const searched = filtered.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="p-6 ml-20 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-heading mb-2 flex items-center gap-2">
          <Users className="text-heading h-8 w-8" />
          My Patients
        </h1>
        <p className="text-heading2 mb-6">
          You are currently supporting {patients.length} patients. Click on view profile for more
          details or start a session.
        </p>

        <div className="flex items-center justify-between mb-6 w-full flex-wrap gap-4">
          {/* Left: Search bar */}
          <div className="flex-1 min-w-[250px] max-w-full">
            <SearchInput value={search} onChange={setSearch} />
          </div>

          {/* Right: Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <FilterBar
              onAgeChange={(val) => handleFilters("age", val)}
              onGenderChange={(val) => handleFilters("gender", val)}
              onConditionChange={(val) => handleFilters("condition", val)}
            />
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto bg-[#D7E2FEC7] border-[#A6B6CC66] border border-3 px-12 py-12 rounded-3xl space-y-4">
          <div className="flex flex-col gap-4">
            {searched.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
            {searched.length === 0 && (
              <div className="text-center text-heading2 opacity-70">No patients yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
