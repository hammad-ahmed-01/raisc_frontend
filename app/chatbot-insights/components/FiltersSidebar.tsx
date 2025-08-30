'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import FiltersGroup from './FiltersGroup';
import { useRouter } from "next/navigation";

const options = {
  topic: ['Anxiety', 'Sleep', 'Family Conflict'],
  date: ['Last 7 Days', 'This Month', 'Custom'],
  message: ['Important', 'Summary Only', 'Detailed'],
};

const FiltersSidebar = () => {
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState({
    topic: true,
    date: true,
    message: true,
  });

  const [selected, setSelected] = useState({
    topic: 'Anxiety',
    date: 'Last 7 Days',
    message: 'Important',
  });

  const toggleDropdown = (key: keyof typeof openDropdowns) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (group: keyof typeof selected, value: string) => {
    setSelected((prev) => ({ ...prev, [group]: value }));
  };

  const clearFilters = () => {
    setSelected({
      topic: '',
      date: '',
      message: '',
    });
  };

  return (
    <aside className="w-80 min-w-[320px] min-h-full p-4 bg-white border border-[#2196F3] rounded-[28px] shadow-sm">
      <Button onClick={() => router.push('/Patient')} className="mb-6 w-full justify-start text-lg font-bold text-[#1A237E] bg-[#D0E3FFC7] hover:bg-[#D0E3FFFF] rounded-full">
        <ChevronLeft className="mr-2 h-5 w-5" />
        Back to Patients List
      </Button>

      <h1 className="text-lg font-bold mb-4 text-[#1A237E] text-left">Filter By</h1>

      <div className="space-y-6 ml-4">
        <FiltersGroup
          label="Topic-Wise"
          open={openDropdowns.topic}
          onToggle={() => toggleDropdown('topic')}
        >
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {options.topic.map((val) => (
                <tr
                  key={val}
                  className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                    selected.topic === val ? 'bg-[#D0E3FFC7]' : ''
                  }`}
                  onClick={() => handleSelect('topic', val)}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                        selected.topic === val ? 'bg-[#1A237E]' : 'bg-transparent'
                      }`}
                    ></span>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FiltersGroup>

        <FiltersGroup
          label="Date Range"
          open={openDropdowns.date}
          onToggle={() => toggleDropdown('date')}
        >
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {options.date.map((val) => (
                <tr
                  key={val}
                  className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                    selected.date === val ? 'bg-[#D0E3FFC7]' : ''
                  }`}
                  onClick={() => handleSelect('date', val)}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                        selected.date === val ? 'bg-[#1A237E]' : 'bg-transparent'
                      }`}
                    ></span>
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FiltersGroup>

        <FiltersGroup
          label="Message Type"
          open={openDropdowns.message}
          onToggle={() => toggleDropdown('message')}
        >
          <table className="w-full border-[#2196F3] border-separate border-2 rounded-md overflow-hidden">
            <tbody>
              {options.message.map((val) => (
                <tr
                  key={val}
                  className={`cursor-pointer text-sm font-medium text-[#1A237E] hover:bg-[#E3F2FD] ${
                    selected.message === val ? 'bg-[#D0E3FFC7]' : ''
                  }`}
                  onClick={() => handleSelect('message', val)}
                >
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#1A237E] ${
                        selected.message === val ? 'bg-[#1A237E]' : 'bg-transparent'
                      }`}
                    ></span>
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
