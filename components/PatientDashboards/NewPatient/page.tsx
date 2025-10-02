"use client";

import TopRightIcons from "@/components/TopRightIcons";
import AIChat from "./components/AIChat";
import CTAButtons from "./components/CTAButtons";
import { UserShape } from "@/app/dashboard/page";

interface NewPatientHomeProps {
  user: UserShape;
}

export default function NewPatientHome({ user }: NewPatientHomeProps) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/bg/patientbg.png')" }}
    >
      {/* Mobile: render icons first, in normal flow */}
      <div className="md:hidden w-full px-4 pt-4 pb-2 flex justify-end">
        <TopRightIcons />
      </div>

      {/* Desktop: keep absolute overlay in the top-right (unchanged) */}
      <div className="hidden md:block absolute top-4 right-4 z-10">
        <TopRightIcons />
      </div>

      {/* CONTENT
          Mobile: add extra top padding so nothing sits under the floating left menu button.
          Desktop: keep perfectly centered.
      */}
      <main className="pt-20 md:pt-0 md:flex md:min-h-screen md:items-center md:justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center md:mt-12">
          {/* Heading */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-heading text-[32px] sm:text-[36px] font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
              WELCOME TO RAISC
            </h1>
            <p className="text-heading2 text-[22px] sm:text-[28px] mt-2">
              Your safe space to begin therapy
            </p>
          </header>

          {/* Hero AI card */}
          <section className="w-full max-w-3xl mx-auto mb-8 sm:mb-10">
            <AIChat />
          </section>

          {/* CTA row */}
          <section className="w-full max-w-3xl mx-auto pb-8">
            <CTAButtons />
          </section>
        </div>
      </main>
    </div>
  );
}
