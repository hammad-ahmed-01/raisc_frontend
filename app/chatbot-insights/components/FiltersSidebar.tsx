'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import FiltersGroup from './FiltersGroup';
import { useRouter } from "next/navigation";

interface FiltersSidebarProps {
  filters: { topic: string; date: string; message: string };
  onFilterChange: (filters: { topic: string; date: string; message: string }) => void;
  availableTopics: string[];
}

const options = {
  date: ['Last 7 Days', 'This Month', 'Custom'],
  message: ['Important', 'Summary Only', 'Detailed'],
};

const FiltersSidebar = ({ filters, onFilterChange, availableTopics }: FiltersSidebarProps) => {
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState({ topic: true, date: true, message: true });

  const toggleDropdown = (key: keyof typeof openDropdowns) =>
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSelect = (group: keyof typeof filters, value: string) =>
    onFilterChange({ ...filters, [group]: value });

  const clearFilters = () => onFilterChange({ topic: '', date: '', message: '' });

  return (
    <aside className="w-full md:w-80 md:min-w-[320px] min-h-full p-4 bg-white border border-[#2196F3] rounded-[28px] shadow-sm">
      {/* Back button hidden on mobile to avoid duplication; desktop remains unchanged */}
      <Button
        onClick={() => router.push('/Patient')}
        className="hidden md:inline-flex mb-6 w-full justify-start text-lg font-bold text-[#1A237E] bg-[#D0E3FFC7] hover:bg-[#D0E3FFFF] rounded-full"
      >
        <ChevronLeft className="mr-2 h-5 w-5" />
        Back to Patients List
      </Button>

      <h1 className="text-lg font-bold mb-4 text-[#1A237E] text-left">Filter By</h1>

      <div className="space-y-6 md:ml-4">
        <FiltersGroup label="Topic-Wise" open={openDropdowns.topic} onToggle={() => toggleDropdown('topic')}>
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {availableTopics.length > 0 ? (
                availableTopics.map((topic) => (
                  <tr
                    key={topic}
                    className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                      filters.topic === topic ? 'bg-[#D0E3FFC7]' : ''
                    }`}
                    onClick={() => handleSelect('topic', topic)}
                  >
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                          filters.topic === topic ? 'bg-[#1A237E]' : 'bg-transparent'
                        }`}
                      />
                      {topic}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-500">No topics available</td>
                </tr>
              )}
            </tbody>
          </table>
        </FiltersGroup>

        <FiltersGroup label="Date Range" open={openDropdowns.date} onToggle={() => toggleDropdown('date')}>
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {options.date.map((val) => (
                <tr
                  key={val}
                  className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                    filters.date === val ? 'bg-[#D0E3FFC7]' : ''
                  }`}
                  onClick={() => handleSelect('date', val)}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                        filters.date === val ? 'bg-[#1A237E]' : 'bg-transparent'
                      }`}
                    />
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FiltersGroup>

        <FiltersGroup label="Message Type" open={openDropdowns.message} onToggle={() => toggleDropdown('message')}>
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {options.message.map((val) => (
                <tr
                  key={val}
                  className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                    filters.message === val ? 'bg-[#D0E3FFC7]' : ''
                  }`}
                  onClick={() => handleSelect('message', val)}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                        filters.message === val ? 'bg-[#1A237E]' : 'bg-transparent'
                      }`}
                    />
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FiltersGroup>
      </div>

      <Button
        onClick={clearFilters}
        className="w-full justify-center mt-4 text-lg font-bold text-[#1A237E] bg-[#D0E3FFC7] hover:bg-[#D0E3FFFF] rounded-full"
      >
        Clear Filters
      </Button>
    </aside>
  );
};

export default FiltersSidebar;
