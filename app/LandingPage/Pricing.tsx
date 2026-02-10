"use client";

import Image from "next/image";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export default function PricingSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-8 md:px-16 bg-gradient-to-b from-heading to-heading2 flex flex-col items-center text-center text-heading">
      {/* Icon */}
      <div className="mb-6">
        <Image
          src="/pricing.png"
          alt="Pricing Icon"
          width={70}
          height={70}
          className="mx-auto"
        />
      </div>

      {/* Heading */}
      <h2 className="text-white text-[clamp(1.5rem,3vw,2rem)] font-bold mb-2">
        Plans made for every kind of practice
      </h2>
      <p className="text-white text-[clamp(0.95rem,1.5vw,1.1rem)] mb-14 max-w-2xl">
        Choose the option that matches the size of your team. You can always upgrade later.
      </p>

      {/* Pricing Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Solo Practitioners */}
        <div className="bg-[#FFF8EC] rounded-3xl p-8 flex flex-col items-center text-center border border-[#2196F3] shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <h3 className="text-heading2 text-xl font-bold mb-4">Solo Practitioners</h3>
          <ul className="text-heading2 text-left list-disc list-inside mb-8 space-y-1">
            <li>Personal dashboard</li>
            <li>Client session logs</li>
            <li>Secure chat & notes</li>
            <li>Appointment scheduling</li>
            <li>AI-powered assistance</li>
            <li>Quick patient onboarding</li>
          </ul>
          <SecondaryButton
            text="Get Started"
            onClick={() => window.location.href = '/register'}
            className="px-8 py-2 rounded-full bg-[#FFFFFF] text-[#0A2C75] border border-[#2196F3] hover:bg-[#bed7eb] transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Clinics & Small Practices */}
        <div className="bg-[#D6F5F2] rounded-3xl p-8 flex flex-col items-center text-center border border-[#2196F3] shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <h3 className="text-heading2 text-xl font-bold mb-4">Clinics & Small Practices</h3>
          <ul className="text-heading2 text-left list-disc list-inside mb-8 space-y-1">
            <li>Multi-therapist dashboard</li>
            <li>Shared patient records</li>
            <li>Team scheduling tools</li>
            <li>Performance insights</li>
            <li>Centralized billing</li>
            <li>AI-assisted workflows</li>
          </ul>
          <SecondaryButton
            text="Get Started"
            onClick={() => window.location.href = '/register'}
            className="px-8 py-2 rounded-full bg-[#FFFFFF] text-[#0A2C75] border border-[#2196F3] hover:bg-[#bed7eb] transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Organizations */}
        <div className="bg-[#FFD2DC] rounded-3xl p-8 flex flex-col items-center text-center border border-[#2196F3] shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <h3 className="text-heading2 text-xl font-bold mb-4">Organizations</h3>
          <ul className="text-heading2 text-left list-disc list-inside mb-8 space-y-1">
            <li>Organization-wide control</li>
            <li>Custom dashboards</li>
            <li>Role-based access</li>
            <li>Automated reporting</li>
            <li>Large-team management</li>
            <li>Advanced analytics</li>
          </ul>
          <SecondaryButton
            text="Get Started"
            onClick={() => window.location.href = '/register'}
            className="px-8 py-2 rounded-full bg-[#FFFFFF] text-[#0A2C75] border border-[#2196F3] transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
          />
        </div>
      </div>

      {/* Email input + Button */}
      <div className="flex justify-center items-center border border-[#2196F3] mt-16 w-full max-w-2xl bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Input */}
        <input
          type="email"
          placeholder="youremail@example.com"
          className="w-full px-6 py-4 text-[#0A2C75] placeholder:text-gray-400 focus:outline-none border-none"
        />
        {/* Button */}
        <button
          className="h-full px-8 py-4 bg-[#CCD2F4] text-heading2 border border-[#2196F3] font-semibold rounded-full hover:bg-[#949edb] hover:text-heading transition-all duration-300"
        >
          Book A Demo
        </button>
      </div>
    </section>
  );
}
