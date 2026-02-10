"use client";

// components/PreviousSessionCard.tsx
import { Brain, NotebookText, Target, X } from "lucide-react";
import { useEffect, useState } from "react";

type KeyPoint = { icon: "brain" | "notebook" | "target"; text: string };

interface BackendSession {
  id: string | number;
  title: string;
  date: string;
  description?: string | null;
  summary?: string | string[] | null;
  session_number?: number | null;
  display_datetime?: string | null;
  feedback?: string | null;
}

interface SessionData {
  id: string | number | null;
  sessionNumber: number;
  topic: string;
  date: string;
  keyPoints: KeyPoint[];
  feedback?: string;
  description?: string | null;
}

/* ---------------- utils ---------------- */

function formatPrettyDate(d: string) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function normalizeSummaryToKeyPoints(summary?: string | string[] | null): KeyPoint[] {
  if (!summary) return [];
  const lines = Array.isArray(summary)
    ? summary
    : summary.split(/\r?\n|•|-|\u2022/g).map(s => s.trim()).filter(Boolean);

  const icons: KeyPoint["icon"][] = ["brain", "notebook", "target"];
  const points: KeyPoint[] = lines.map((text, idx) => ({
    icon: icons[Math.min(idx, 2)],
    text,
  }));
  return points.slice(0, 6);
}

/** Strip bracket tags like [time=14:00], image markdown, and obvious image URLs */
function cleanDescription(s?: string | null): string {
  if (!s) return "";
  let out = s;

  // bracket meta
  out = out.replace(/\[[^\]]+\]/g, " ").replace(/\s{2,}/g, " ").trim();

  // markdown images
  out = out.replace(/!\[[^\]]*]\([^)]*\)/g, " ").trim();

  // obvious image links
  out = out.replace(/\bhttps?:\/\/\S+\.(?:png|jpe?g|webp|gif|svg)(\?\S*)?\b/gi, "").trim();

  return out;
}

function getAuthHeaderFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const candidates = [
    localStorage.getItem("Authorization"),
    localStorage.getItem("authorization"),
    localStorage.getItem("session_key"),
    localStorage.getItem("auth_token"),
    localStorage.getItem("access_token"),
    localStorage.getItem("token"),
  ].filter(Boolean) as string[];

  const raw = candidates.find(Boolean);
  if (!raw) return {};
  const val = /^token\s+/i.test(raw) || /^bearer\s+/i.test(raw) ? raw : `Token ${raw}`;
  return { Authorization: val, "x-raisc-auth": val };
}

/* --------------- component --------------- */

export default function PreviousSessionCard() {
  const [session, setSession] = useState<SessionData>({
    id: null,
    sessionNumber: 1,
    topic: "Previous Session",
    date: "—",
    keyPoints: [{ icon: "brain", text: "No summary added yet" }],
    feedback: "",
    description: "",
  });

  const [openNotes, setOpenNotes] = useState(false);

  useEffect(() => {
    const fetchPrev = async () => {
      try {
        const headers = getAuthHeaderFromStorage();

        // 1) try STRICT previous
        let res = await fetch("/api/sessions/previous", {
          cache: "no-store",
          credentials: "include",
          headers,
        });

        // 2) if none exist yet, quietly fall back to latest (so UI still renders)
        if (res.status === 404 || !res.ok) {
          const fallback = await fetch("/api/sessions/latest", {
            cache: "no-store",
            credentials: "include",
            headers,
          });
          if (!fallback.ok) return;
          res = fallback;
        }

        const data: BackendSession = await res.json();

        const prettyDate = (data.display_datetime || "").trim() || formatPrettyDate(data.date);
        const keyPoints = normalizeSummaryToKeyPoints(data.summary);
        const desc = cleanDescription(data.description);

        setSession({
          id: data.id ?? null,
          sessionNumber:
            typeof data.session_number === "number" && data.session_number > 0 ? data.session_number : 1,
          topic: data.title || "Session",
          date: prettyDate,
          keyPoints: keyPoints.length ? keyPoints : [{ icon: "brain", text: "No summary added yet" }],
          feedback: data.feedback || undefined,
          description: desc,
        });
      } catch (e) {
        console.error("Failed to fetch previous/latest session", e);
      }
    };

    fetchPrev();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "brain":
        return <Brain size={18} className="text-heading2" />;
      case "notebook":
        return <NotebookText size={18} className="text-heading2" />;
      case "target":
        return <Target size={18} className="text-heading2" />;
      default:
        return <Brain size={18} className="text-heading2" />;
    }
  };

  return (
    <>
      <div className="max-w-sm p-6 bg-gradient-to-br border-2 border-[#bfaaff] from-purple-100 to-blue-50 rounded-3xl shadow-md">
        <h2 className="text-2xl font-bold text-heading mb-3">Previous Session</h2>
        <hr className="border-blue-200 mb-4" />

        <div className="text-heading2 space-y-4 text-left">
          <div>
            <p className="font-semibold">Session #{session.sessionNumber}:</p>
            <p className="ml-2">{session.topic}</p>
          </div>

          <div>
            <p className="font-semibold">Held on:</p>
            <p className="ml-2">{session.date}</p>
          </div>

          <div>
            <p className="font-semibold">Key Points Covered:</p>
            <div className="ml-4 space-y-2">
              {session.keyPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  {getIcon(point.icon)}
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>

          {session.feedback ? (
            <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2">
              {session.feedback}
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setOpenNotes(true)}
            className="bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 transition"
          >
            View Notes
          </button>
        </div>
      </div>

      {/* themed modal */}
      {openNotes && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal
          role="dialog"
        >
          <div className="w-[92vw] max-w-xl rounded-2xl bg-[#EDEAFF] border border-[#bfaaff] shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 rounded-t-2xl bg-gradient-to-r from-[#dcd4ff] to-[#e8f0ff]">
              <h3 className="text-lg font-semibold text-[#1E2A5E]">Session Notes</h3>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white/70 hover:bg-white px-3 py-1 text-sm text-[#1E2A5E] border border-[#bfaaff] transition"
                onClick={() => setOpenNotes(false)}
                aria-label="Close"
              >
                <X size={16} /> Close
              </button>
            </div>

            {/* body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-auto">
              <div className="rounded-xl bg-white shadow-inner border border-blue-100 p-4">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {session.description?.trim()
                    ? session.description
                    : "No notes available for this session."}
                </p>
              </div>
            </div>

            {/* accent */}
            <div className="h-2 rounded-b-2xl bg-gradient-to-r from-[#bfaaff] via-[#7aa7ff] to-[#bfaaff]" />
          </div>
        </div>
      )}
    </>
  );
}
