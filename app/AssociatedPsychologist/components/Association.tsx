// app/AssociatedPsychologist/components/Association.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecondaryButton from "@/components/Buttons/SecondaryButton";
import { getToken } from "@/lib/auth";

/* ----------------------- helpers ----------------------- */
const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

type AnyDoc = {
  id?: number;
  username?: string;
  name?: string;
  location?: string;
  phone?: string;
  affiliated_organization?: string;
  professional_information?: Record<string, any>;
};

function pickPhone(d: AnyDoc | null): string {
  if (!d) return "";
  const p = (d.professional_information ?? {}) as Record<string, any>;
  return (
    safeStr(d.phone) ||
    safeStr(p.phone) ||
    safeStr(p.phone_number) ||
    safeStr(p.contact) ||
    safeStr(p.contact_number) ||
    ""
  );
}

function pickOrg(d: AnyDoc | null): string {
  if (!d) return "";
  const p = (d.professional_information ?? {}) as Record<string, any>;
  return (
    safeStr(d.affiliated_organization) ||
    safeStr(p.affiliated_organization) ||
    safeStr(p.affiliation) ||
    safeStr(p.organization) ||
    safeStr(p.hospital) ||
    ""
  );
}

function pickCity(d: AnyDoc | null): string {
  if (!d) return "";
  const p = (d.professional_information ?? {}) as Record<string, any>;
  return safeStr(d.location) || safeStr(p.location) || "";
}

async function hydrateFromDirectory(seed: AnyDoc | null): Promise<AnyDoc | null> {
  try {
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Token ${token}` } : {};
    const res = await fetch("/api/doctors/list", { headers, cache: "no-store" });
    if (!res.ok) return seed;
    const list = (await res.json().catch(() => [])) as AnyDoc[];
    if (!Array.isArray(list) || list.length === 0) return seed;

    // Prefer id match; else username/name fallback
    const byId = seed?.id ? list.find((x) => Number(x.id) === Number(seed!.id)) : null;
    if (byId) return byId;

    const u = safeStr(seed?.username).toLowerCase();
    const n = safeStr(seed?.name).toLowerCase();
    const byUser =
      (u && list.find((x) => safeStr(x.username).toLowerCase() === u)) ||
      (n && list.find((x) => safeStr(x.name).toLowerCase() === n)) ||
      null;

    return byUser ?? seed;
  } catch {
    return seed;
  }
}

/* ----------------------- component ----------------------- */

interface AssociationData {
  name: string;
  description: string;
  address: string;
  phone?: string;
  hours?: string;
  website?: string;
  logoUrl?: string;
}

export default function Association() {
  const router = useRouter();
  const [association, setAssociation] = useState<AssociationData>({
    name: "Pakistan Institute of Mental Health (PIMH)",
    description:
      "PIMH is a leading mental health facility offering compassionate, evidence-based care. We support individuals with therapy, counseling, and psychiatric services in a safe and inclusive environment.",
    address: "—, Pakistan",
    phone: "No number",
    website: "Not added",
    hours: "Not added",
    logoUrl: "/PIMH.jpeg",
  });

  useEffect(() => {
    (async () => {
      let doc: AnyDoc | null = null;
      try {
        const raw = localStorage.getItem("selectedDoctor");
        doc = raw ? (JSON.parse(raw) as AnyDoc) : null;
      } catch {
        doc = null;
      }

      // If phone is missing/empty, hydrate from directory API
      if (!pickPhone(doc)) {
        doc = await hydrateFromDirectory(doc);
      }

      const orgName =
        pickOrg(doc) || "Pakistan Institute of Mental Health (PIMH)";
      const city = pickCity(doc) || "—";
      const phone = pickPhone(doc) || "No number";

      setAssociation((prev) => ({
        ...prev,
        name: orgName,
        address: `${city}, Pakistan`,
        phone,
        website: "Not added", // placeholders as requested
        hours: "Not added",
      }));
    })();
  }, []);

  return (
    <div className="bg-[#FEF9E7] rounded-2xl p-3 sm:p-6 shadow-sm">
      {/* Header */}
      <h2 className="text-[#0039A6] text-sm sm:text-xl font-bold text-center mb-2 sm:mb-3">
        Affiliated Organization
      </h2>

      {/* Organization card with logo */}
      <div className="flex flex-col items-center">
        <div className="mb-1 sm:mb-2">
          <Image
            src={association.logoUrl || "/PIMH.jpeg"}
            alt="Organization Logo"
            width={40}
            height={40}
            className="object-contain w-10 h-10"
          />
        </div>

        <h3 className="text-[#0039A6] text-sm sm:text-lg font-bold text-center">
          {association.name}
        </h3>

        <p className="text-[#0039A6] text-xs sm:text-sm text-center my-2 sm:my-3">
          {association.description}
        </p>

        {/* Contact Info */}
        <div className="w-full text-[#0039A6] mt-2 sm:mt-4 space-y-1">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="text-red-500">📍</span>
            <span>{association.address}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="text-gray-600">🕒</span>
            <span>{association.hours}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="text-gray-600">📞</span>
            <span>{association.phone}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="text-blue-500">🌐</span>
            <span>{association.website}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 sm:mt-6 w-full flex justify-center">
          <SecondaryButton
            text="Choose Another Therapist"
            onClick={() => router.push("/Doctors")}
            className="font-semibold px-3 sm:px-5 py-2 sm:py-3 rounded-full w-full max-w-xs text-center text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
