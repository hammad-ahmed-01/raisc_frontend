// components/TopRightIcons.tsx
import { FiBell, FiSettings } from "react-icons/fi";

export default function TopRightIcons() {
  return (
    <div className="absolute top-3 sm:top-5 right-3 sm:right-5 flex gap-3 sm:gap-6 z-20">
      <button
        className="text-xl sm:text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Notifications"
      >
        <FiBell />
      </button>
      <button
        className="text-xl sm:text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Setting"
      >
        <FiSettings />
      </button>
    </div>
  );
}
