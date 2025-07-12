import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  label: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
};

const FiltersGroup = ({ label, children, open, onToggle }: Props) => {
  return (
    <div>
      <div
        className="flex items-center gap-1 font-bold text-[#1A237E] mb-2 cursor-pointer"
        onClick={onToggle}
      >
        <span className="text-2xl leading-none">•</span>
        <span>{label}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 ml-1 text-[#1A237E]" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-1 text-[#1A237E]" />
        )}
      </div>
      {open && children}
    </div>
  );
};

export default FiltersGroup;
