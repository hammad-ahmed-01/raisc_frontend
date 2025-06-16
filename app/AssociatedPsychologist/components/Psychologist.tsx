"use client"

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

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
    image: "/img/female-doc.png",
    about: "Passionate about helping individuals manage anxiety and emotional challenges.",
    qualifications: ["MSc in Clinical Psychology", "Certified CBT Therapist"],
    languages: ["English", "Urdu"],
    experience: "10+ years of experience in trauma, cognitive behavioural therapy, family therapy, anxiety.",
    rating: 4.6,
    reviews: 124
  });
  
  useEffect(() => {
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

  return (
    <div className="flex flex-col gap-4 mt-10">
      {/* Header Card */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <img
            src={psychologist.image}
            alt="Therapist"
            className="w-20 h-20 rounded-full border-2 border-blue-300"
          />
          <div>
            <h2 className="text-lg font-semibold text-heading">{psychologist.name}</h2>
            <p className="text-heading2">{psychologist.role}</p>
            <p className="text-sm text-heading2">
              Affiliated with <strong>{psychologist.affiliation}</strong>
            </p>
          </div>
        </div>
        <button className="bg-[#FFF8ECDB] text-heading2 text-sm px-4 py-2 rounded-full shadow">
          Change Therapist
        </button>
      </div>

      {/* Info Grid */}      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Sub-Column */}
        <div className="flex flex-col gap-4">
          {/* About Me */}
          <div className="bg-[#FFF8ECDB] p-4 rounded-xl">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="about">👤</span> About Me
            </h3>
            <p className="text-sm text-heading2">
              {psychologist.about}
            </p>

            {/* Qualifications */}
            <h3 className="font-semibold text-heading mt-3 mb-1 flex items-center gap-2">
              <span role="img" aria-label="qualification">🎓</span> Qualification
            </h3>
            <p className="text-sm text-heading2">
              {psychologist.qualifications.map((qual, index) => (
                <span key={index}>
                  {qual}
                  {index < psychologist.qualifications.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          {/* Languages */}
          <div className="bg-[#FFFEFE] p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="languages">💬</span> Languages Spoken
            </h3>
            <p className="text-sm text-heading2">{psychologist.languages.join(", ")}</p>
          </div>
        </div>        {/* Right Sub-Column */}
        <div className="flex flex-col gap-4">
          {/* Experience */}
          <div className="bg-[#FFFEFE] p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="experience">🧳</span> Experience
            </h3>
            <p className="text-sm text-heading2">
              {psychologist.experience}
            </p>
          </div>

          {/* Ratings */}
          <div className="bg-[#FFFEFE] p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-lg mb-2 flex items-center gap-2">
              <span>⭐</span> Rating / Reviews
            </h3>
            <p className="text-heading2 mb-3 flex items-center gap-1">
              <span>⭐</span> {psychologist.rating} rating
            </p>
            <button className="w-full bg-[#E9F5FE] text-heading2 font-medium py-2 rounded-full hover:bg-blue-100 transition">
              Submit your rating
            </button>
            <RatingStars rating={4.6} />
          </div>
        </div>
      </div>
    </div>
  );
}
