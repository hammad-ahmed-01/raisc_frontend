"use client"

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import Image from "next/image";

// Define types for the psychologist data
interface PsychologistData {
  name: string;
  role: string;
  affiliation: string;
  image: string;
  about: string;
  qualifications: string[];
  languages: string[];
  experience: string;
  rating: number;
  reviews: number;
}

const RatingStars = ({ rating = 4.6 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const totalStars = 5;

  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: totalStars }, (_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;

        return (
          <Star
            key={i}
            className="w-6 h-6"
            fill={isFilled ? "#FFD700" : isHalf ? "none" : "none"}
            stroke={isFilled ? "#FFD700" : isHalf ? "#000000" : "#000000"}
          />
        );
      })}
    </div>
  );
};

export default function Psychologist() {
  const [psychologist, setPsychologist] = useState<PsychologistData>({
    name: "Dr. Sara Khan",
    role: "Clinical Psychologist",
    affiliation: "Pakistan Institute of Mental Health (PIMH)",
    image: "/psychologist.jpeg", // Updated default image path to match available assets
    about: "Passionate about helping individuals manage anxiety and emotional challenges.",
    qualifications: ["MSc in Clinical Psychology", "Certified CBT Therapist"],
    languages: ["English", "Urdu"],
    experience: "10+ years of experience in trauma, cognitive behavioural therapy, family therapy, anxiety.",
    rating: 4.6,
    reviews: 124
  });
  
  // State to track the request status
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  
  useEffect(() => {
    // First check if there's a selected doctor in localStorage
    const selectedDoctorData = localStorage.getItem('selectedDoctor');
    
    if (selectedDoctorData) {
      try {
        const selectedDoctor = JSON.parse(selectedDoctorData);
        setSelectedDoctor(selectedDoctor);
        
        // Check if this doctor has a pending or accepted request
        setRequestStatus(selectedDoctor.requestStatus || 'none');
        
        // Map the doctor data to our psychologist format
        setPsychologist({
          name: selectedDoctor.name,
          role: selectedDoctor.specialization,
          affiliation: selectedDoctor.location,
          image: selectedDoctor.profile_image,
          about: `Specializes in ${selectedDoctor.specialization} with expertise in ${selectedDoctor.expertise.join(', ')}.`,
          qualifications: [selectedDoctor.education],
          languages: ["English", "Urdu"], // Default languages if not available
          experience: selectedDoctor.experience,
          rating: selectedDoctor.rating,
          reviews: Math.floor(selectedDoctor.rating * 20) // Generate random number of reviews based on rating
        });
        
        return; // Exit the function since we already have the data
      } catch (error) {
        console.error("Error parsing selected doctor data:", error);
      }
    }
    
    // If no selected doctor or parsing failed, fall back to backend or default data
    const fetchData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/psychologist/current`);
          if (response.ok) {
            const data = await response.json();
            setPsychologist(data);
          }
        } catch (error) {
          console.error("Failed to fetch psychologist data:", error);
        }
      }
      // If NEXT_PUBLIC_BACKEND_CONNECTED is false, we'll use the default dummy data set in useState
    };
    
    fetchData();
  }, []);

  // Function to send a request to a doctor
  const sendRequest = async () => {
    if (!selectedDoctor) return;
    
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
    }
    
    setRequestStatus('pending');
  };

  // Function to remove a request
  const removeRequest = async () => {
    if (!selectedDoctor) return;
    
    // Update the doctor's request status in localStorage
    const updatedDoctor = { ...selectedDoctor, requestStatus: 'none' };
    localStorage.setItem('selectedDoctor', JSON.stringify(updatedDoctor));
    
    // Update user's sent_requests in localStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.patient_profile?.sent_requests) {
        const updatedSentRequests = parsedUser.patient_profile.sent_requests.filter(
          (id: string) => id !== selectedDoctor.id.toString()
        );
        
        const updatedUser = {
          ...parsedUser,
          patient_profile: {
            ...parsedUser.patient_profile,
            sent_requests: updatedSentRequests
          }
        };
        
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
      }
    }
    
    setRequestStatus('none');
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-4 mt-6 sm:mt-10">      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-lg p-3 sm:p-6 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Image
            src={psychologist.image}
            alt={psychologist.name}
            width={80}
            height={80}
            className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-blue-300 object-cover"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-sm sm:text-lg font-bold font-weight-700 text-heading">{psychologist.name}</h2>
            <p className="text-heading2 font-weight-400 text-xs sm:text-base">{psychologist.role}</p>
            <p className="text-xs sm:text-sm text-heading2">
              <span className="text-red-500">📍</span> Location: <strong>{psychologist.affiliation}</strong>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="font-weight-400 text-xs sm:text-sm">{psychologist.rating} Rating</span>
            </div>
          </div>
        </div>
        
        {/* Request action buttons */}
        <div className="w-full sm:w-auto flex justify-center">
          {requestStatus === 'none' && (
            <SecondaryButton
              text="Send Request"
              onClick={sendRequest}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold whitespace-nowrap text-xs sm:text-sm"
            />
          )}
          
          {requestStatus === 'pending' && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 sm:gap-2 text-blue-700 mb-1 sm:mb-2 text-xs sm:text-sm">
                <span className="text-amber-700">⌛</span> 
                <span className="whitespace-nowrap">Status: Pending Request</span>
              </div>
              <SecondaryButton
                text="Remove Request"
                onClick={removeRequest}
                className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold whitespace-nowrap text-xs sm:text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
        {/* Left Sub-Column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* About Me */}
          <div className="bg-[#FFF8ECDB] p-3 sm:p-4 rounded-xl">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="about">👤</span> About Me
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.about}
            </p>

            {/* Qualifications */}
            <h3 className="font-semibold text-heading mt-2 sm:mt-3 mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="qualification">🎓</span> Qualification
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.qualifications.map((qual, index) => (
                <span key={index}>
                  {qual}
                  {index < psychologist.qualifications.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          {/* Languages */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="languages">💬</span> Languages Spoken
            </h3>
            <p className="text-xs sm:text-sm text-heading2">{psychologist.languages.join(", ")}</p>
          </div>
        </div>        

        {/* Right Sub-Column */}
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* Experience */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span role="img" aria-label="experience">🧳</span> Experience
            </h3>
            <p className="text-xs sm:text-sm text-heading2">
              {psychologist.experience}
            </p>
          </div>

          {/* Ratings */}
          <div className="bg-[#FFFEFE] p-3 sm:p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-sm sm:text-lg mb-2 flex items-center gap-1 sm:gap-2">
              <span>⭐</span> Rating / Reviews
            </h3>
            <p className="text-heading2 mb-2 sm:mb-3 flex items-center gap-1 text-xs sm:text-sm">
              <span>⭐</span> {psychologist.rating} rating
            </p>
            <button className="w-full bg-[#E9F5FE] text-heading2 font-medium py-1.5 sm:py-2 rounded-full hover:bg-blue-100 transition text-xs sm:text-sm">
              Submit your rating
            </button>
            <RatingStars rating={4.6} />
          </div>
        </div>
      </div>
    </div>
  );
}
