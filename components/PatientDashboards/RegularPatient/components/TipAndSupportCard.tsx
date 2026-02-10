"use client";

// components/TipAndSupportCard.tsx
import {
  Lightbulb,
  HelpCircle,
  Sparkles,
  Angry,
  Frown,
  Meh,
  Smile,
  Laugh,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TipData {
  title: string;
  content: string;
}

type MoodValue = "neutral" | "sad" | "happy" | "anxious";

export default function TipAndSupportCard() {
  const [tip, setTip] = useState<TipData>({
    title: "Tip of the Day",
    content: "Relax. Breathe. \nLet go a little.",
  });

  const [moodOptions, setMoodOptions] = useState<
    { value: MoodValue; label: string }[]
  >([]);
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE = (process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "").replace(/\/+$/, "");

  /* ==============================
     Tip of the Day (UNCHANGED)
  ============================== */
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_TIPS !== "true") return;

    const fetchTipData = async () => {
      try {
        if (!BASE) return;

        const response = await fetch(`${BASE}/api/tips/daily`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setTip(data);
        }
      } catch (error) {
        console.error("Failed to fetch tip data:", error);
      }
    };

    fetchTipData();
  }, [BASE]);

  /* ==============================
     ✅ GET MOOD OPTIONS + DEFAULT
     (mood-today)
  ============================== */
  useEffect(() => {
    (async () => {
      try {
        if (!BASE) return;

        const headers: Record<string, string> = {};
        const tok = localStorage.getItem("session_key");
        if (tok) headers.Authorization = `Token ${tok}`;

        const res = await fetch(`${BASE}/patients/mood-today/`, {
          headers,
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        setMoodOptions(data.moods);
        setSelectedMood(data.default);
      } catch (e) {
        console.error("Failed to load mood options:", e);
      }
    })();
  }, [BASE]);

  /* ==============================
     ✅ REHYDRATE SAVED MOOD
     (profile/)
  ============================== */
  useEffect(() => {
    (async () => {
      try {
        if (!BASE) return;

        const headers: Record<string, string> = {};
        const tok = localStorage.getItem("session_key");
        if (tok) headers.Authorization = `Token ${tok}`;

        const res = await fetch(`${BASE}/patients/profile/`, {
          headers,
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        const savedMood = data?.mood?.current_mood;

        if (savedMood) {
          setSelectedMood(savedMood);
        }
      } catch (e) {
        console.error("Failed to rehydrate mood:", e);
      }
    })();
  }, [BASE]);

  /* ==============================
     Set Mood (set-mood)
  ============================== */
  async function setMood(label: string) {
    if (submitting || !BASE) return;

    // Map UI label → backend-safe value
    const option = moodOptions.find((m) => m.label === label);
    if (!option) return;

    setSelectedMood(option.value);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const tok = localStorage.getItem("session_key");
      if (tok) headers.Authorization = `Token ${tok}`;

      await fetch(`${BASE}/patients/set-mood/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ mood: option.label }),
      });
    } catch (e) {
      console.error("Failed to set mood:", e);
    } finally {
      setSubmitting(false);
    }
  }

  /* ==============================
     UI (UNCHANGED)
  ============================== */
  const moodsUI = [
    { label: "Angry", Icon: Angry, color: "text-red-500" },
    { label: "Sad", Icon: Frown, color: "text-orange-500" },
    { label: "Neutral", Icon: Meh, color: "text-yellow-500" },
    { label: "Happy", Icon: Smile, color: "text-green-500" },
    { label: "Excited", Icon: Laugh, color: "text-blue-500" }, // maps to Happy
  ];

  return (
    <div className="flex flex-col items-center gap-6 my-8">
      <div className="space-y-6 w-full max-w-md">
        {/* Tip of the Day */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4">
          <div className="text-yellow-500">
            <Lightbulb size={40} />
          </div>
          <div>
            <h3 className="font-bold text-heading2 mb-1">{tip.title}</h3>
            <p className="text-heading2 text-sm leading-snug">
              {tip.content.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Support Box */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4">
          <div className="text-blue-700">
            <HelpCircle size={40} />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-heading2 text-base">
              Need support <br />
              right now?
            </h3>
          </div>
          <div className="text-pink-500">
            <Sparkles size={36} />
          </div>
        </div>

        {/* How are you feeling */}
        <div className="bg-[#D6F5F2] rounded-2xl shadow-md p-4 border border-[#2196F3]">
          <h3 className="font-bold text-heading2 text-center mb-3">
            How are you feeling?
          </h3>

          <div className="flex justify-center items-center gap-3">
            {moodsUI.map(({ label, Icon, color }) => {
              const option = moodOptions.find((m) => m.label === label);
              const active = option && selectedMood === option.value;

              return (
                <button
                  key={label}
                  onClick={() => setMood(label)}
                  className={`rounded-full p-2 transition transform hover:scale-110 ${
                    active ? "bg-white shadow-md" : "opacity-80"
                  }`}
                  title={label}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
