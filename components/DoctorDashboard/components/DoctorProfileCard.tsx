import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import Image from "next/image";

interface DoctorProfileCardProps {
  doctor: {
    name: string;
    specialization: string;
    rating: number;
    experience: string;
    rates: string;
    organization: string;
    location: string;
  };
}

interface DoctorStats {
  total_patients: number;
  total_sessions: number;
  rating: number;
  reviews_count: number;
}

export const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({ doctor }) => {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    fetchDoctorStats();
  }, []);

  const fetchDoctorStats = async () => {
    setIsLoading(true);
    
    if (!isBackendConnected) {
      // Mock stats
      const mockStats: DoctorStats = {
        total_patients: 45,
        total_sessions: 120,
        rating: 4.7,
        reviews_count: 28
      };
      
      setStats(mockStats);
      setIsLoading(false);
      return;
    }

    try {
      const sessionKey = localStorage.getItem("session_key");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/doctor/stats/`,
        {
          headers: {
            'Authorization': `Bearer ${sessionKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.log('Failed to fetch doctor stats');
        // Use default stats if backend fails
        setStats({
          total_patients: 0,
          total_sessions: 0,
          rating: doctor.rating,
          reviews_count: 0
        });
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      // Use default stats if error occurs
      setStats({
        total_patients: 0,
        total_sessions: 0,
        rating: doctor.rating,
        reviews_count: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#2196F3] rounded-[24px] p-6" 
        style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
        <div className="animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#2196F3] rounded-[24px] p-6" 
      style={{ boxShadow: '0px 4px 4px 0px #00000040' }}>
      <div className="flex items-center">
        {/* Doctor Avatar */}
        <div className="mr-8">
          <div className="w-36 h-36 rounded-full border-2 border-[#2196F3] flex items-center justify-center overflow-hidden">
            <Image
              src="/doctordashboard/doctor.png"
              width={144}
              height={144}
              alt="Doctor Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Doctor Info */}
        <div className="flex-1">
          <h3 className="text-[28px] text-[#1E3CA7] mb-1" style={{ fontWeight: 700 }}>
            Dr. {doctor.name}
          </h3>
          <p className="text-xl text-[#1E3CA7] mb-2" style={{ fontWeight: 400 }}>
            {doctor.specialization}
          </p>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl text-yellow-400">⭐</span>
            <span className="text-xl  text-[#1E3CA7]" style={{ fontWeight: 400 }}>
              {stats?.rating || doctor.rating} Rating
            </span>
          </div>
          
          {/* Experience and Rates */}
          <div className="flex flex-col gap-1">
            <p className="text-xl text-[#1E3CA7]">
              <span style={{ fontWeight: 700 }}>Experience:</span> 
              <span style={{ fontWeight: 400 }}> {doctor.experience}</span>
            </p>
            <p className="text-xl text-[#1E3CA7]">
              <span style={{ fontWeight: 700 }}>Rates:</span> 
              <span style={{ fontWeight: 400 }}> {doctor.rates}</span>
            </p>
          </div>
        </div>
        
        {/* Affiliated Organization */}
        <div className="ml-8 min-w-[340px]">
          <div className="bg-[#E9F5FE] border border-[#2196F3] rounded-[24px] px-4 py-2 mb-3">
            <h4 className="text-2xl text-[#1E3CA7] text-center" style={{ fontWeight: 700 }}>
              Affiliated Organization
            </h4>
          </div>
          
          <p className="text-lg text-[#1E3CA7] text-center mb-2" style={{ fontWeight: 400 }}>
            {doctor.organization}
          </p>
          
          <div className="flex items-center justify-center gap-1 mb-4">
            <MapPin className="w-5 h-5 text-[#1E3CA7]" />
            <span className="text-lg text-[#1E3CA7]" style={{ fontWeight: 400 }}>
              {doctor.location}
            </span>
          </div>
          
          <div className="text-center">
            <a href="#" className="text-xl text-[#0004F6] underline hover:no-underline" style={{ fontWeight: 700 }}>
              View More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};