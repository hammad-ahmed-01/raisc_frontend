"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SiteInProduction() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFFFFF] text-center px-6">
      <img
        src="/wellbeing.gif"
        alt="Site in production"
        className="w-64 h-64 object-contain"
      />

      <h1 className="text-3xl md:text-4xl font-bold text-[#4ae3e6] mt-6">
        We're Launching Soon
      </h1>

      <p className="text-lg text-normal mt-3 max-w-xl">
        Our platform is currently under development to serve you better.
      </p>

      <p className="text-md text-normal mt-1">
        Thank you for your patience.
      </p>

      <Button
        className="mt-6 bg-[#4ae3e6] hover:bg-[#279597] text-white font-semibold rounded-full px-6 py-2"
        onClick={() => router.push("/")}
      >
        Back to Home
      </Button>
    </div>
  );
}
