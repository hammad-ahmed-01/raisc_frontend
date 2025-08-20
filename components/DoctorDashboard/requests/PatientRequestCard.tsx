import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import PrimaryButton from '@/components/Buttons/PrimaryButton';

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

interface PatientRequestCardProps {
  patientRequest: PatientRequest;
  onAccept: () => void;
  onReject: () => void;
}

const PatientRequestCard: React.FC<PatientRequestCardProps> = ({
  patientRequest,
  onAccept,
  onReject,
}) => {
  return (
    <div 
      className="bg-[#FFF8EC] border-2 border-[#2196F3] rounded-[24px] p-6 shadow-sm"
      style={{ boxShadow: '0px 4px 4px 0px #00000040' }}
    >
      <div className="flex flex-col md:flex-row justify-between">
        {/* Patient Info */}
        <div className="flex-grow">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-[#1E3CA7]">{patientRequest.name}</h3>
            <p className="text-[#1E3CA7] py-0 my-0">
              <span className="font-bold">Email:</span> {patientRequest.email}
            </p>
            <p className="text-[#1E3CA7] py-0 my-0">
              <span className="font-bold">Condition:</span> {patientRequest.condition}
            </p>
          </div>
          <p className="text-[#444444] mb-8">
            {patientRequest.message}
          </p>
          <PrimaryButton
            text="View Profile"
            className="font-bold px-6 py-2 rounded-full"
          />
        </div>

        {/* Right Side - Age, Date, Actions */}
        <div className="flex flex-col items-end mt-4 md:mt-0">
          <div className="text-right mb-16">
            <p className="text-[#444444] mb-1">
              <span className="font-semibold">Age:</span> {patientRequest.age} | <span className="font-semibold">Gender:</span> {patientRequest.gender}
            </p>
            <p className="text-[#444444]">
              <span className="font-semibold">Request Date:</span> {patientRequest.requestDate}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-8">
            <button
              onClick={onAccept}
              className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center hover:bg-green-600"
            >
              <FiCheck size={24} />
            </button>
            <button
              onClick={onReject}
              className="bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center hover:bg-red-600"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRequestCard;
