import React, { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';
import Image from 'next/image';

interface TherapistCardProps {
  doctor?: any;
  hasRequest?: boolean;
  requestStatus?: 'none' | 'pending' | 'accepted';
  onViewMoreClick: () => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({ 
  doctor,
  hasRequest = false,
  requestStatus = 'none',
  onViewMoreClick
}) => {
  const [recommendedDoctors, setRecommendedDoctors] = useState([
    {
      id: '123',
      name: 'Dr. Sara Khan',
      specialization: 'Clinical Psychologist',
      profile_image: '/doctors/female-doctor.png',
      rating: 4.7,
      location: 'Islamabad'
    },
    {
      id: '456',
      name: 'Dr. Fahad Malik',
      specialization: 'Behavioral Therapy',
      profile_image: '/doctors/male-doctor.png',
      rating: 4.9,
      location: 'Karachi'
    }
  ]);
  
  // Check for any requests made on other pages when component mounts
  useEffect(() => {
    const checkForExistingRequests = () => {
      const selectedDoctorData = localStorage.getItem('selectedDoctor');
      if (selectedDoctorData) {
        try {
          const selectedDoctor = JSON.parse(selectedDoctorData);
          if (selectedDoctor && selectedDoctor.requestStatus === 'pending') {
            // If there's a pending request from other pages, update the local state
            const userData = localStorage.getItem("user_data");
            if (userData) {
              const parsedUser = JSON.parse(userData);
              if (!parsedUser.patient_profile?.sent_requests?.includes(selectedDoctor.id.toString())) {
                // Add to sent_requests if not already included
                const updatedSentRequests = [
                  ...(parsedUser.patient_profile?.sent_requests || []),
                  selectedDoctor.id.toString()
                ];
                
                const updatedUser = {
                  ...parsedUser,
                  patient_profile: {
                    ...(parsedUser.patient_profile || {}),
                    sent_requests: updatedSentRequests
                  }
                };
                
                localStorage.setItem("user_data", JSON.stringify(updatedUser));
              }
            }
          }
        } catch (error) {
          console.error("Error parsing selected doctor data:", error);
        }
      }
    };
    
    checkForExistingRequests();
  }, []);

  const sendRequest = (selectedDoctor: any) => {
    // Update the doctor's request status in localStorage
    const updatedDoctor = { ...selectedDoctor, requestStatus: 'pending' };
    localStorage.setItem('selectedDoctor', JSON.stringify(updatedDoctor));
    
    // Update user's sent_requests in localStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const updatedSentRequests = [
        ...(parsedUser.patient_profile?.sent_requests || []),
        selectedDoctor.id.toString()
      ];
      
      const updatedUser = {
        ...parsedUser,
        patient_profile: {
          ...(parsedUser.patient_profile || {}),
          sent_requests: updatedSentRequests
        }
      };
      
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      window.location.reload(); // Reload to show updated status
    }
  };

  return (
    <div className="bg-[#F6FDFE] shadow-md p-6 rounded-2xl w-full max-w-sm text-heading2">
      <h2 className="text-heading2 bg-[#D7E2FE] text-xl font-semibold p-4 mb-6 rounded-full text-center">
        Choose Your Therapist
      </h2>

      {hasRequest && doctor ? (
        // Selected doctor with status
        <>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={doctor.profile_image || "/doctor-avatar.png"}
              alt="Therapist"
              className="w-20 h-20 rounded-full border-heading border-2 object-cover"
            />
            <div className="flex flex-col">
              <p className="text-blue-800 font-semibold text-lg">{doctor.name || "Dr. Ailah Ahmed"}</p>
              <p className="text-blue-500 text-sm">{doctor.specialization || "Cognitive Therapy"}</p>
              <p className="text-yellow-500 text-sm">⭐ {doctor.rating || "4.7"} Rating</p>
            </div>
          </div>

          {requestStatus === 'pending' && (
            <>
              <div className="mt-2 mb-4 text-sm font-semibold flex items-center justify-center gap-2 text-heading2">
                <span>Status:</span>
                <Hourglass size={16} />
                <span>Pending Request</span>
              </div>

              <button 
                onClick={() => {
                  // Remove request logic
                  if (doctor) {
                    const updatedDoctor = { ...doctor, requestStatus: 'none' };
                    localStorage.setItem('selectedDoctor', JSON.stringify(updatedDoctor));
                    
                    // Update user's sent_requests in localStorage
                    const userData = localStorage.getItem("user_data");
                    if (userData) {
                      const parsedUser = JSON.parse(userData);
                      
                      if (parsedUser.patient_profile?.sent_requests) {
                        const updatedSentRequests = parsedUser.patient_profile.sent_requests.filter(
                          (id: string) => id !== doctor.id.toString()
                        );
                        
                        const updatedUser = {
                          ...parsedUser,
                          patient_profile: {
                            ...parsedUser.patient_profile,
                            sent_requests: updatedSentRequests
                          }
                        };
                        
                        localStorage.setItem("user_data", JSON.stringify(updatedUser));
                        window.location.reload(); // Reload to show updated status
                      }
                    }
                  }
                }}
                className="w-full bg-gray-200 text-blue-800 px-4 py-2 rounded-full shadow hover:bg-gray-300 transition"
              >
                Cancel Request
              </button>
            </>
          )}

          {requestStatus === 'accepted' && (
            <div className="mt-2 mb-4 text-sm font-semibold flex items-center justify-center gap-2 text-green-600">
              <span>✅ Connected Successfully</span>
            </div>
          )}
        </>
      ) : (
        // Show recommended therapists to choose from
        <div className="flex flex-col gap-4">
          {recommendedDoctors.map((recommendedDoctor) => (
            <div key={recommendedDoctor.id} className="border border-blue-100 rounded-xl p-3 hover:bg-blue-50 transition">
              <div className="flex items-center gap-3">
                <img
                  src={recommendedDoctor.profile_image}
                  alt={recommendedDoctor.name}
                  className="w-14 h-14 rounded-full border-blue-200 border object-cover"
                />
                <div className="flex flex-col flex-1">
                  <p className="text-blue-800 font-semibold">{recommendedDoctor.name}</p>
                  <p className="text-blue-500 text-xs">{recommendedDoctor.specialization}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500 text-xs">⭐ {recommendedDoctor.rating}</span>
                    <span className="text-gray-400 text-xs ml-2">• {recommendedDoctor.location}</span>
                  </div>
                </div>
                <button 
                  onClick={() => sendRequest(recommendedDoctor)}
                  className="bg-[#FFF8EC] hover:bg-yellow-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-5 text-[#D0E3FFC7]" />

      <div className="flex justify-center">
        <button 
          onClick={onViewMoreClick}
          className="w-fit flex items-center justify-center bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 rounded-full shadow-sm hover:opacity-90 transition"
        >
          View more
        </button>
      </div>
    </div>
  );
};
