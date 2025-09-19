"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopRightIcons from "@/components/TopRightIcons";
import { Header } from "./components/Header";
import { QuoteCarousel } from "./components/QuoteCarousel";
import { Resources } from "./components/Resources";
import { TherapistCard } from "./components/TherapistCard";
import { ChatBot } from "./components/ChatBot";
import { fetchMe } from "@/lib/auth";

/* ----------------------------- types ----------------------------- */

type RequestStatus = "none" | "pending" | "accepted";

interface UserShape {
  username: string;
  patient_profile?: {
    associated_psychologist?: string | number | null;
    associated_psychologist_id?: string | number | null;
    associated_psychologist_name?: string | null;
    sent_requests?: string[];
    profile_data?: Record<string, unknown> | null;
    level?: number;
  } | null;
}

/* ----------------------------- utils ----------------------------- */

const safeStr = (v: unknown) => (v == null ? "" : String(v).trim());

const readUserFromLocalStorage = (): UserShape | null => {
  try {
    const raw = localStorage.getItem("user_data");
    return raw ? (JSON.parse(raw) as UserShape) : null;
  } catch {
    return null;
  }
};

const writeUserToLocalStorage = (u: any) => {
  try {
    localStorage.setItem("user_data", JSON.stringify(u));
  } catch {}
};

/* ----------------------------- page ----------------------------- */

const Dashboard: React.FC<{ user?: any }> = ({ user }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserShape | null>(null);
  const refreshingRef = useRef(false);

  // Canonical refresh from backend (fallback to localStorage)
  const refreshUser = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const me = (await fetchMe().catch(() => null)) as UserShape | null;
      if (me) {
        setCurrentUser(me);
        writeUserToLocalStorage(me);
      } else {
        setCurrentUser(readUserFromLocalStorage());
      }
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  // first load
  useEffect(() => {
    (async () => {
      if (user) {
        setCurrentUser(user as UserShape);
      } else {
        await refreshUser();
      }
    })();
  }, [user, refreshUser]);

  // keep user fresh on visibility/storage/broadcast changes
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    document.addEventListener("visibilitychange", onVisible);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user_data") {
        setCurrentUser(readUserFromLocalStorage());
      }
    };
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("profile-sync");
      bc.onmessage = (msg: MessageEvent) => {
        const data = (msg?.data ?? {}) as { type?: string };
        if (data.type === "profile-updated") void refreshUser();
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, [refreshUser]);

  const handleViewMoreClick = () => {
    router.push("/Doctors");
  };

  // Friendly display name: prefer profile_data.display_name if present
  const displayName = useMemo(() => {
    const pd = (currentUser?.patient_profile?.profile_data ?? {}) as Record<string, unknown>;
    return (pd?.display_name as string) || currentUser?.username || "Hira";
  }, [currentUser]);

  return (
    <div
      className="flex min-h-screen bg-cover bg-center ml-8 px-2 sm:px-4 lg:px-0"
      style={{ backgroundImage: "url('/bg/returningbg.png')" }}
    >
      <div className="flex-1 px-1 sm:px-2 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <TopRightIcons />
        <Header name={displayName} />

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 mt-8 sm:mt-12 lg:mt-24 gap-3 sm:gap-4 lg:gap-6">
          {/* Column 1: Quote + Resources */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-6 order-2 lg:order-1">
            <QuoteCarousel />
            <Resources />
          </div>

          {/* Column 2: Therapist Card */}
          <div className="flex justify-center order-1 lg:order-2">
            {/* The card now fetches doctors + shows pending/accepted itself.
                No props (doctor/hasRequest/requestStatus) needed here, which
                removes the TypeScript error you were seeing. */}
            <TherapistCard onViewMoreClick={handleViewMoreClick} />
          </div>

          {/* Column 3: ChatBot */}
          <div className="flex justify-center items-center order-3">
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
