"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define interface for association data
interface AssociationData {
  name: string;
  description: string;
  address: string;
  phone?: string;
  hours?: string;
  website?: string;
  logoUrl?: string;
}

export default function Association() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [association, setAssociation] = useState<AssociationData>({
    name: "Pakistan Institute of Mental Health (PIMH)",
    description: "PIMH is a leading mental health facility offering compassionate, evidence-based care. We support individuals with therapy, counseling, and psychiatric services in a safe and inclusive environment.",
    address: "Rawalpindi, Pakistan",
    phone: "042-12345678",
    website: "www.pimh.org.pk",
    hours: "Mon-Sat, 9:00 AM – 5:00 PM",
    logoUrl: "/hospital-logo.png"
  });

  useEffect(() => {
    // Check if there's a selected doctor in localStorage
    const selectedDoctorData = localStorage.getItem('selectedDoctor');
    
    if (selectedDoctorData) {
      try {
        const doctor = JSON.parse(selectedDoctorData);
        setSelectedDoctor(doctor);
        
        // Use the doctor's location information for the association
        setAssociation({
          name: doctor.specialization === "Cognitive Therapy" ? 
            "Pakistan Institute of Mental Health (PIMH)" : 
            `${doctor.specialization} Center of ${doctor.location}`,
          description: "PIMH is a leading mental health facility offering compassionate, evidence-based care. We support individuals with therapy, counseling, and psychiatric services in a safe and inclusive environment.",
          address: `${doctor.location}, Pakistan`,
          phone: `042-${Math.floor(1000000 + Math.random() * 9000000)}`,
          website: `www.pimh.org.pk`,
          hours: "Mon-Sat, 9:00 AM – 5:00 PM",
          logoUrl: "/hospital-icon.png"
        });
      } catch (error) {
        console.error("Error parsing selected doctor data:", error);
      }
    }
  }, []);

  return (
    <div className="bg-[#FEF9E7] rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <h2 className="text-[#0039A6] text-xl font-bold text-center mb-3">
        Affiliated Organization
      </h2>
      
      {/* Organization card with logo */}
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-2">
          <Image 
            src="/hospital-icon.png" 
            alt="Hospital Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        
        {/* Organization Name */}
        <h3 className="text-[#0039A6] text-lg font-bold text-center">
          {association.name}
        </h3>
        
        {/* Description */}
        <p className="text-[#0039A6] text-sm text-center my-3">
          {association.description}
        </p>
        
        {/* Contact Info */}
        <div className="w-full text-[#0039A6] mt-4 space-y-1">
          {/* Address */}
          <div className="flex items-center gap-2">
            <span className="text-red-500">📍</span>
            <span>{association.address}</span>
          </div>
          
          {/* Hours */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">🕒</span>
            <span>{association.hours}</span>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>{association.phone}</span>
          </div>
          
          {/* Website */}
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🌐</span>
            <span>{association.website}</span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-6 w-full flex justify-center">
          <button 
            onClick={() => router.push('/Doctors')}
            className="bg-[#D7E2FE] hover:bg-blue-200 text-[#0039A6] font-semibold px-5 py-3 rounded-full w-full max-w-xs text-center"
          >
            Choose Another Therapist
          </button>
        </div>
      </div>
    </div>
  );
}
