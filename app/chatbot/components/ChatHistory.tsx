"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onBackToDashboard: () => void;

  /** When true, renders as a floating card overlay for mobile */
  overlay?: boolean;
  /** Optional close handler for overlay mode */
  onCloseOverlay?: () => void;
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
  older: [],
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
  overlay = false,
  onCloseOverlay,
}) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("today");
  const [hasChosenFilter, setHasChosenFilter] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => CHAT_DATA[filter] ?? [], [filter]);

  // Close dropdown on outside click
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

  // Close overlay on outside click
  useEffect(() => {
    if (!overlay) return;
    const onDocClick = (e: MouseEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) onCloseOverlay?.();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [overlay, onCloseOverlay]);

  // Esc handling
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) setOpen(false);
        else if (overlay) onCloseOverlay?.();
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, overlay, onCloseOverlay]);

  const setFilterAndKeepOpen = (k: FilterKey) => {
    setFilter(k);
    setHasChosenFilter(true);
  };

  const showList = open || hasChosenFilter;

  /* ---------------------- MOBILE OVERLAY (fixed-size 350×400) ---------------------- */
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* subtle backdrop */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Sidebar card: fixed size, left edge square, right rounded */}
        <div
          ref={cardRef}
          className="absolute left-0 top-0 w-[320px] h-[400px] overflow-hidden rounded-none rounded-r-[28px] border bg-[#EAF4FF] border-[#6AA8F3] shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
        >
          {/* Robot fixed at the back & bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-0 flex flex-col items-center">
            <Image
              src="/chatbot.png"
              alt="Chatbot"
              width={210}
              height={340}
              className="w-[180px] h-auto drop-shadow-md"
              priority
            />
          </div>

          {/* Foreground content (scrolls; extra bottom pad to avoid robot overlap) */}
          <div className="relative z-10 flex h-full flex-col">
            {/* top controls row */}
            <div className="flex items-center justify-between px-3 pt-3">
              {/* same sidebar (hamburger) button as header; clicking closes */}
              <button
                type="button"
                aria-label="Toggle sidebar"
                className="p-2 -ml-2 rounded-md active:scale-95 transition text-heading2"
                onClick={() => onCloseOverlay?.()}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="#1E3CA7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* back to dashboard (no bg) */}
              <button
                onClick={onBackToDashboard}
                aria-label="Back to dashboard"
                className="flex items-center gap-1 text-heading2 font-bold px-3 py-2 bg-[#CDD2F480] rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-md">Dashboard</span>
              </button>
            </div>

            {/* body scroll area */}
            <div className="px-4 pt-2 pb-20 flex-1 overflow-y-auto">
              {/* centered Chat History pill + panel */}
              <div className="relative w-full flex flex-col items-center">
                <button
                  ref={btnRef}
                  onClick={() => setOpen((s) => !s)}
                  className="inline-flex items-center justify-between rounded-2xl px-4 py-2 bg-[#B2D5F1] text-heading2 font-extrabold shadow-[0_2px_0_0_#2F6FD6] border border-[#5E9CEB] w-60 mx-auto"
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  aria-controls="chat-history-panel"
                >
                  <span className="mx-auto">Chat History</span>
                  <ChevronDown
                    className={`ml-3 h-5 w-5 text-heading2 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open && (
                  <div
                    id="chat-history-panel"
                    ref={menuRef}
                    className="mt-3 w-60 rounded-2xl border border-[#D6E8FA] bg-white shadow-lg"
                    role="dialog"
                    aria-label="Chat history"
                  >
                    {/* Filters (top) */}
                    <div className="max-h-36 overflow-y-auto">
                      {(
                        ["today", "last7Days", "last30Days", "older"] as FilterKey[]
                      ).map((key) => (
                        <button
                          key={key}
                          onClick={() => setFilterAndKeepOpen(key)}
                          className={`w-full text-left px-4 py-3 text-heading2 hover:bg-[#F2F8FF] transition ${
                            filter === key ? "bg-[#EEF6FF] font-semibold" : ""
                          }`}
                        >
                          {FILTER_LABELS[key]}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-[#E9F2FF]" />

                    {/* Chats (bottom) */}
                    <div className="max-h-40 overflow-y-auto p-2">
                      {items.length === 0 ? (
                        <div className="text-xs text-heading2/70 bg-[#F8FBFF] border border-[#D6E8FA] rounded-xl px-3 py-2">
                          No chats in this range.
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {items.map((chat) => (
                            <li key={chat.id}>
                              <button
                                onClick={() => {
                                  onSelectChat(chat.id);
                                  onCloseOverlay?.();
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-sm text-heading2 bg-white hover:bg-[#F1F6FF] border border-transparent hover:border-[#D6E8FA] transition"
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
                )}
              </div>

              {/* Optional selected list preview when panel closed */}
              {!open && showList && (
                <div className="mt-3 w-60 mx-auto">
                  <div className="text-sm font-semibold text-heading2 mb-2 text-center">
                    {FILTER_LABELS[filter]}
                  </div>
                  {items.length === 0 ? (
                    <div className="text-sm text-heading2/70 bg-white/70 border border-[#D6E8FA] rounded-xl px-3 py-2 text-center">
                      No chats in this range.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {items.map((chat) => (
                        <li key={chat.id}>
                          <button
                            onClick={() => {
                              onSelectChat(chat.id);
                              onCloseOverlay?.();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm text-heading2 bg-white hover:bg-[#F1F6FF] border border-transparent hover:border-[#D6E8FA] transition"
                            title={chat.title}
                          >
                            {chat.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------- DESKTOP (unchanged; text-heading2) ---------------------- */
  return (
    <aside className="w-full md:w-full md:min-h-full bg-[#EAF4FF] text-heading2 rounded-none md:rounded-tr-3xl md:rounded-br-3xl p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#B2D5F1]">
      <div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-heading2 font-bold text-xl sm:text-2xl px-1 py-2 mb-4"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Dashboard</span>
        </button>

        <div className="relative mb-3">
          <button
            ref={btnRef}
            onClick={() => setOpen((s) => !s)}
            className="w-full inline-flex items-center justify-between rounded-2xl px-4 py-2.5 bg-[#B2D5F1] text-heading2 font-bold shadow-sm outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85C6FF] transition"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="chat-history-filter-menu"
          >
            <span className="mx-auto">Chat History</span>
            <ChevronDown
              className={`ml-3 h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              id="chat-history-filter-menu"
              ref={menuRef}
              className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-lg border border-[#D6E8FA] overflow-hidden"
              role="listbox"
              aria-label="Chat history ranges"
            >
              {(["today", "last7Days", "last30Days", "older"] as FilterKey[]).map(
                (key) => (
                  <button
                    key={key}
                    role="option"
                    aria-selected={filter === key}
                    onClick={() => {
                      setFilter(key);
                      setHasChosenFilter(true);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-heading2 hover:bg-[#F2F8FF] transition ${
                      filter === key ? "bg-[#EEF6FF] font-semibold" : ""
                    }`}
                  >
                    {FILTER_LABELS[key]}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {(open || hasChosenFilter) && (
          <div className="mt-2">
            <div className="text-sm font-semibold text-heading2 mb-2 text-center">
              {FILTER_LABELS[filter]}
            </div>
            {items.length === 0 ? (
              <div className="text-sm text-heading2/70 bg-white/60 border border-[#D6E8FA] rounded-xl px-3 py-2 text-center">
                No chats in this range.
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((chat) => (
                  <li key={chat.id}>
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-heading2 bg-white hover:bg-[#F1F6FF] border border-transparent hover:border-[#D6E8FA] transition"
                      title={chat.title}
                    >
                      {chat.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
            className="w-[160px] sm:w-[200px] h-auto drop-shadow-md"
            priority
          />
        </button>
      </div>
    </aside>
  );
};

export default ChatHistory;
