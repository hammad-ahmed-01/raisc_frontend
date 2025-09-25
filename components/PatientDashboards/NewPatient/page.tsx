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
      {/* top-right bell/settings/etc. */}
      <TopRightIcons />

      {/* page content */}
      <main className="max-w-6xl mx-auto px-4 sm:ml-8 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Heading */}
        <header className="text-center md:text-left md:ml-8 mb-6 sm:mb-8">
          <h1 className="text-heading text-[32px] sm:text-[36px] font-bold [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)]">
            WELCOME TO RAISC
          </h1>
          <p className="text-heading2 text-center text-[22px] sm:text-[28px] mt-2">
            Your safe space to begin therapy
          </p>
        </header>

        {/* Hero AI card */}
        <section className="mb-8 md:ml-8 sm:mb-10">
          <AIChat />
        </section>

        {/* CTA row */}
        <section className="md:ml-8">
          <CTAButtons />
        </section>
      </main>
    </div>
  );
}
