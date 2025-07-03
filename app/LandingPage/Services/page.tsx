"use client";

import React from "react";
import Card from "./card";

const services = [
  {
    heading: "An Online Haven",
    image: "/services/onlinehaven.png",
    description: "A secure, calming space for mental wellness.",
    backgroundColor: "#D6F5F2",
  },
  {
    heading: "24/7 Humanized AI Interaction",
    image: "/services/humanizedinteraction.png",
    description: "Chat with empathetic AI anytime, anywhere",
    backgroundColor: "#E6E6FA",
  },
  {
    heading: "Mental Health Resources",
    image: "/services/mentalhealthresources.png",
    description: "Access articles, videos, and guided exercises.",
    backgroundColor: "#F4DFDF",
  },
  {
    heading: "AI Facilated Therapy",
    image: "/services/facilatedtherapy.png",
    description: "Boost therapy with smart recommendations.",
    backgroundColor: "#FBFBEF",
  },
  {
    heading: "Sentiment Analysis",
    image: "/services/sentimentanalysis.png",
    description: "Analyze patient mood trends using real-time feedback.",
    backgroundColor: "#D0E9FF",
  },
  {
    heading: "AI Driven Feedback Loop",
    image: "/services/feedbackloop.png",
    description: "Refine therapy sessions based on real-time insights.",
    backgroundColor: "#F6E9F9",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative px-4 py-20 bg-blue-50 min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/servicesbg.png"
          alt="Services Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Top Image */}
        <div className="mb-8">
          <img
            src="/services/service.png" 
            alt="Services Icon"
            className="mx-auto w-20 h-20"
          />
        </div>

        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl text-center font-extrabold text-heading">Our Services</h2>

        {/* Caption */}
        <p className="text-heading2 text-center font-semibold my-2">
          Tailored support for both individuals and mental health professionals.
        </p>

        {/* First Heading */}
        <h3 className="text-xl text-heading font-bold mt-6">Services For Patients</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-2">
          {services.slice(0, 3).map(({ heading, image, description, backgroundColor }) => (
            <Card
              key={heading}
              image={image}
              heading={heading}
              description={description}
              backgroundColor={backgroundColor}
            />
          ))}
        </div>

        {/* Second Heading */}
        <h3 className="text-xl text-heading font-bold mt-6">Services  For Mental Health Professionals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {services.slice(3).map(({ heading, image, description, backgroundColor }) => (
            <Card
              key={heading}
              image={image}
              heading={heading}
              description={description}
              backgroundColor={backgroundColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
