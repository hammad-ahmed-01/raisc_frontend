// components/TopRightIcons.tsx
import { FiBell, FiSettings } from "react-icons/fi";

const goToSettings = () => {
  window.location.href = "/settings";
}

export default function TopRightIcons() {
  return (
    <div className="absolute top-5 right-5 flex gap-4 lg:gap-6 z-20">
      <button
        className="text-2xl lg:text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Notifications"
      >
        <FiBell />
      </button>
      <button
        className="text-2xl lg:text-3xl text-heading2 hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Setting"
        onClick={goToSettings}
      >
        <FiSettings />
      </button>
    </div>
  );
}
