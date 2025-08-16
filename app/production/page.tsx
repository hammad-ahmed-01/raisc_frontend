"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SiteInProduction() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Guard: only allow when a valid session_key is present
    const key =
      typeof window !== "undefined" ? localStorage.getItem("session_key") : null;

    const ok =
      !!key &&
      key !== "null" &&
      key !== "undefined" &&
      key.toString().trim() !== "";

    if (!ok) {
      setAllowed(false);
      router.replace("/"); // kick out + prevent back navigation into this page
    } else {
      setAllowed(true);
    }
  }, [router]);

  // While checking (or redirecting), render nothing to avoid flicker/hydration issues
  if (allowed !== true) return null;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20 bg-[url('/bg/patientbg.png')] bg-cover bg-center text-center">
      {/* Transparent logo watermark */}
      <img
        src="/raisc-logo.png"
        alt="RAISC Logo"
        className="absolute inset-0 w-full h-full object-contain opacity-5 z-0"
      />

      {/* Foreground content */}
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-2xl md:text-4xl font-bold text-heading2 mb-6">
          Thank You For Believing in RAISC!
        </h1>

        <p className="text-normal text-lg">We’re thrilled to have you on board.</p>

        <p className="text-normal text-base mb-6">
          Our team is working hard to bring you a platform that offers accessible and
          efficient mental health support.
        </p>

        <p className="text-normal text-base">You’ll be among the first to know when we launch.</p>

        <p className="text-normal text-base mb-6">
          In the meantime, take a deep breath—your journey to better mental health is about to begin.
        </p>

        <p className="text-xl md:text-xl font-bold text-heading2 mb-6">
          We’ll notify you via email once RAISC is live.
        </p>

        <Button
          className="bg-heading2 hover:bg-heading text-white font-semibold rounded-full px-6 py-2"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}