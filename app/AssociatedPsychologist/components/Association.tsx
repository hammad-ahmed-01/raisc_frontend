"use client"

import { useEffect, useState } from "react";

interface AssociationData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export default function Association() {
  const [association, setAssociation] = useState<AssociationData>({
    name: "Pakistan Institute of Mental Health (PIMH)",
    description: "A leading mental health institution providing comprehensive care and support.",
    address: "123 Medical Avenue, Islamabad, Pakistan",
    phone: "+92 51 1234567",
    email: "info@pimh.org.pk",
    website: "www.pimh.org.pk"
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (process.env.NEXT_PUBLIC_BACKEND_CONNECTED === 'true') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}api/association/current`);
          if (response.ok) {
            const data = await response.json();
            setAssociation(data);
          }
        } catch (error) {
          console.error("Failed to fetch association data:", error);
        }
      }
      // If NEXT_PUBLIC_BACKEND_CONNECTED is false, we'll use the default dummy data set in useState
    };
    
    fetchData();
  }, []);

  return (
    <div className="bg-white/90 rounded-2xl min-h-full border border-blue-100 mt-6 md:mt-0 p-6">
      <h3 className="text-xl font-semibold text-heading mb-4">{association.name}</h3>
      <p className="text-heading2 mb-4">{association.description}</p>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-heading">Address:</h4>
          <p className="text-sm text-heading2">{association.address}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-heading">Contact:</h4>
          <p className="text-sm text-heading2">Phone: {association.phone}</p>
          <p className="text-sm text-heading2">Email: {association.email}</p>
          <p className="text-sm text-heading2">Website: {association.website}</p>
        </div>
        
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          Visit Website
        </button>
      </div>
    </div>
  );
}
