"use client"

import React from "react";
import Card from "./card";

const services = [
  {
    heading: "Psychological Therapy",
    image: "/services/pt.webp",
    description: "Personalized sessions to improve your mental health and coping skills.",
  },
  {
    heading: "Psychiatric Consultation",
    image: "/services/pc.png",
    description: "Comprehensive evaluations to diagnose and plan treatment.",
  },
  {
    heading: "Group Therapy",
    image: "/services/gt.png",
    description: "Supportive group sessions that foster community and healing.",
  },
  {
    heading: "Task-Based Therapy",
    image: "/services/tbt.png",
    description: "Goal-oriented therapy focusing on practical tasks and skills.",
  },
  {
    heading: "Flexible Scheduling",
    image: "/services/fs.png",
    description: "Appointments available to fit your busy lifestyle.",
  },
  {
    heading: "Video Sessions",
    image: "/services/vs.webp",
    description: "Access therapy from the comfort of your home with secure video calls.",
  },
];

export default function ServicesSection() {
  const handleLearnMore = (serviceName) => {
    alert(`Learn more about ${serviceName}`);
  };

  return (
    <section id="services" className="relative px-4 py-16 bg-blue-50 text-center min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/servicesbg.png"
          alt="Contact Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10">
        <h2 className="inline-block px-8 py-3 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md mb-[6px]">
                Our Services
              </h2>
              <h2 className="text-heading2 mb-2 max-w-xl mx-auto">
                We offer a comprehensive range of mental health services to support your well-being journey.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {services.map(({ heading, image, description }) => (
                  <Card
                    key={heading}
                    image={image}
                    heading={heading}
                    description={description}
                    onLearnMore={() => handleLearnMore(heading)}
                  />
                ))}
              </div>
      </div>
    </section>
  );
}
