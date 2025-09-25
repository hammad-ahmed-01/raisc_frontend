import { ChevronDown } from "lucide-react";
import React from "react";

interface FilterBarProps {
  onAgeChange: (val: string) => void;
  onGenderChange: (val: string) => void;
  onConditionChange: (val: string) => void;
}

const FilterSelect = ({
  onChange,
  options,
  placeholder,
}: {
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  return (
    <div className="relative w-full md:w-48">
      <select
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full p-3 pr-10 rounded-xl shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
    </div>
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({
  onAgeChange,
  onGenderChange,
  onConditionChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
      <FilterSelect
        placeholder="Age"
        onChange={onAgeChange}
        options={[
          { value: "20-30", label: "20-30" },
          { value: "30-40", label: "30-40" },
          { value: "40-50", label: "40-50" },
        ]}
      />
      <FilterSelect
        placeholder="Gender"
        onChange={onGenderChange}
        options={[
          { value: "Female", label: "Female" },
          { value: "Male", label: "Male" },
          { value: "Other", label: "Other" },
        ]}
      />
      <FilterSelect
        placeholder="Condition"
        onChange={onConditionChange}
        options={[
          { value: "Anxiety", label: "Anxiety" },
          { value: "Sleep issues", label: "Sleep issues" },
          { value: "Stress", label: "Stress" },
        ]}
      />
    </div>
  );
};
