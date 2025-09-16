// app/chat/components/ChatHistory.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onBackToDashboard: () => void;
}

type FilterKey = "today" | "last7Days" | "last30Days" | "older";

const CHAT_DATA: Record<FilterKey, { id: string; title: string }[]> = {
  today: [{ id: "1", title: "Intro and Initial Discussion" }],
  last7Days: [
    { id: "2", title: "Recommend breathing exercises" },
    { id: "3", title: "Help in Therapy follow-up" },
  ],
  last30Days: [
    { id: "4", title: "How to reduce stress" },
    { id: "5", title: "Assist me in feeling better" },
  ],
  older: [
    // Keep empty or fill if you have older chats
  ],
};

const FILTER_LABELS: Record<FilterKey, string> = {
  today: "Today",
  last7Days: "Previous 7 days",
  last30Days: "Previous 30 days",
  older: "Older Chats",
};

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onSelectChat,
  onNewChat,
  onBackToDashboard,
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("today");
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const items = useMemo(() => CHAT_DATA[filter] ?? [], [filter]);

  // Close on click outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        open &&
        !menuRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Esc to close
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const setFilterAndClose = (k: FilterKey) => {
    setFilter(k);
    setOpen(false);
  };

  return (
    <aside className="w-full md:w-[300px] min-h-full bg-[#EAF4FF] text-heading rounded-tr-3xl rounded-br-3xl p-4 sm:p-6 flex flex-col justify-between border-r border-[#B2D5F1]">
      {/* Top: Back + Dropdown */}
      <div>
        {/* Back to Dashboard */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-heading font-bold text-xl sm:text-2xl px-1 py-2 mb-4"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Dashboard</span>
        </button>

        {/* Chat History dropdown */}
        <div className="relative mb-5">
          <button
            ref={btnRef}
            onClick={() => setOpen((s) => !s)}
            className="w-full inline-flex items-center justify-between rounded-2xl px-4 py-2.5 bg-[#B2D5F1] text-heading font-bold shadow-sm outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85C6FF] transition"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span>Chat History</span>
            <ChevronDown
              className={`ml-3 h-5 w-5 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div
              ref={menuRef}
              className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-lg border border-[#D6E8FA] overflow-hidden"
              role="listbox"
              aria-label="Chat history ranges"
            >
              {(
                [
                  "today",
                  "last7Days",
                  "last30Days",
                  "older",
                ] as FilterKey[]
              ).map((key) => (
                <button
                  key={key}
                  role="option"
                  aria-selected={filter === key}
                  onClick={() => setFilterAndClose(key)}
                  className={`w-full text-left px-4 py-3 text-heading hover:bg-[#F2F8FF] transition ${
                    filter === key ? "bg-[#EEF6FF] font-semibold" : ""
                  }`}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of conversations for current filter */}
        <div>
          <div className="text-sm font-semibold text-heading mb-2">
            {FILTER_LABELS[filter]}
          </div>

          {items.length === 0 ? (
            <div className="text-sm text-[#5B6B8C] bg-white/60 border border-[#D6E8FA] rounded-xl px-3 py-2">
              No chats in this range.
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map((chat) => (
                <li key={chat.id}>
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-[#1E2A5E] bg-white hover:bg-[#F1F6FF] border border-transparent hover:border-[#D6E8FA] transition"
                    title={chat.title}
                  >
                    {chat.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom: Robot image (starts new chat) */}
      <div className="pt-6 flex justify-center">
        <button
          onClick={onNewChat}
          aria-label="Start a new chat"
          className="rounded-3xl transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Image
            src="/chatbot.png"
            alt="Chatbot"
            width={200}
            height={350}
            className="w-[200px] h-auto drop-shadow-md"
            priority
          />
        </button>
      </div>
    </aside>
  );
};

export default ChatHistory;
