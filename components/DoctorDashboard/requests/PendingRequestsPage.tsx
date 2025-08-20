"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import TopRightIcons from "@/components/TopRightIcons";
import PatientRequestCard from './PatientRequestCard';
import { FiSearch } from 'react-icons/fi';
import { FiChevronDown } from 'react-icons/fi';

interface PatientRequest {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  condition: string;
  message: string;
  requestDate: string;
}

const PendingRequestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([
    {
      id: '1',
      name: 'Ayesha Khan',
      email: 'ayesha123@gmail.com',
      age: 28,
      gender: 'Female',
      condition: 'Anxiety',
      message: 'I\'ve been feeling overwhelming lately and need to talk.',
      requestDate: 'July 6, 2025'
    },
    {
      id: '2',
      name: 'Ayesha Khan',
      email: 'ayesha123@gmail.com',
      age: 28,
      gender: 'Female',
      condition: 'Anxiety',
      message: 'I\'ve been feeling overwhelming lately and need to talk.',
      requestDate: 'July 6, 2025'
    }
  ]);

  const handleAccept = (id: string) => {
    console.log('Accepted request:', id);
    // API call to accept patient request
  };

  const handleReject = (id: string) => {
    console.log('Rejected request:', id);
    // API call to reject patient request
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredRequests = patientRequests.filter(request => 
    request.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div 
        className="flex-1 ml-20 bg-cover bg-center bg-no-repeat pb-16 px-8 overflow-y-auto"
        style={{ backgroundImage: "url('/doctordashboard/bg2.png')" }}
      >
        <TopRightIcons />

        {/* Header */}
        <div className="pt-32 sm:pt-16">
          <div className="flex items-center">
            <div className="text-4xl text-[#1E3CA7] font-bold">
              <span className="mr-2">👤</span> Pending Requests
            </div>
          </div>
          <p className="text-lg text-[#1E3CA7] mt-2">
            You have new patient requests waiting to be accepted or rejected.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex-grow max-w-md relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients"
              className="w-full pl-12 pr-4 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] focus:outline-none focus:border-[#2196F3]"
              style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <button 
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
          >
            Age <FiChevronDown />
          </button>

          <button 
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
          >
            Condition <FiChevronDown />
          </button>

          <button 
            className="hover:opacity-70 px-6 py-3 bg-[#F6FDFE] border-[3px] border-[#E6E6FA] rounded-full text-[#444444] flex items-center gap-2"
            style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
          >
            Request Date <FiChevronDown />
          </button>
        </div>

        {/* Requests List - Centered with limited width */}
        <div className="my-8 flex flex-col items-center">
          <div className="max-w-4xl w-full">
            <div className="flex flex-col gap-6">
              {filteredRequests.map((request) => (
                <PatientRequestCard
                  key={request.id}
                  patientRequest={request}
                  onAccept={() => handleAccept(request.id)}
                  onReject={() => handleReject(request.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestsPage;
