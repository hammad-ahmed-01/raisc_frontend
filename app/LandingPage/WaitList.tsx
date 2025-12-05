"use client";

import Image from "next/image";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function JoinWaitlistSection() {
  return (
    <section className="w-full py-20 px-4 sm:px-8 md:px-16 bg-blue-50 flex flex-col items-center text-center text-heading">
      {/* Icon */}
      <div className="mb-6">
        <Image
          src="/waitlist.png"
          alt="Waitlist Icon"
          width={80}
          height={80}
          className="mx-auto"
        />
      </div>

      {/* Heading */}
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-heading mb-2">
        Join the Waitlist
      </h2>
      <p className="text-heading2 text-[clamp(0.95rem,1.5vw,1.1rem)] mb-10">
        Be the first to experience RAISC
      </p>

      {/* Box Section */}
      <div className="max-w-2xl w-full bg-[#9FCFC040] border border-[#AFC8FF] rounded-2xl p-8 sm:p-10 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <p className="text-[#202020] leading-relaxed mb-6">
          Join our waitlist to get early access to <strong>RAISC</strong>, a supportive
          space designed to connect you with trusted mental health experts and
          resources. <br />
          Be among the first to explore a calm, personalized platform that makes
          mental health care more accessible and compassionate.
        </p>

        <p className="text-heading2 font-semibold mb-6">
          Registration is Now Live!
        </p>

        {/* Centered Button */}
        <div className="flex justify-center">
          <PrimaryButton
            text="Register Now"
            className="px-8 py-3 rounded-full shadow-[0_4px_0_#00000030]"
          />
        </div>
      </div>
    </section>
  );
}
