"use client"

import React from "react";
import Card from "./card";

const services = [
  {
    heading: "Psychological Therapy",
    image: "https://via.placeholder.com/400x200?text=Psychological+Therapy",
    description: "Personalized sessions to improve your mental health and coping skills.",
  },
  {
    heading: "Psychiatric Evaluation",
    image: "https://via.placeholder.com/400x200?text=Psychiatric+Evaluation",
    description: "Comprehensive evaluations to diagnose and plan treatment.",
  },
  {
    heading: "Group Therapy",
    image: "https://via.placeholder.com/400x200?text=Group+Therapy",
    description: "Supportive group sessions that foster community and healing.",
  },
  {
    heading: "Task-Based Therapy",
    image: "https://via.placeholder.com/400x200?text=Task-Based+Therapy",
    description: "Goal-oriented therapy focusing on practical tasks and skills.",
  },
  {
    heading: "Flexible Scheduling",
    image: "https://via.placeholder.com/400x200?text=Flexible+Scheduling",
    description: "Appointments available to fit your busy lifestyle.",
  },
  {
    heading: "Video Sessions",
    image: "https://via.placeholder.com/400x200?text=Video+Sessions",
    description: "Access therapy from the comfort of your home with secure video calls.",
  },
];

export default function ServicesSection() {
  const handleLearnMore = (serviceName) => {
    alert(`Learn more about ${serviceName}`);
  };

  return (
    <section id="services" className="px-4 py-16 bg-blue-50 text-center">
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
    </section>
  );
}
