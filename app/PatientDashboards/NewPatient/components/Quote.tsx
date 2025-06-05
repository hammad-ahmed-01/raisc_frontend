import { FaFeatherAlt } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Quote() {
  return (
    <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex items-center justify-between max-w-4xl mx-auto mt-12 text-[#1E3CA7]">
      {/* Back Arrow */}
      <button
        className="text-3xl text-[#1E3CA7] hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Previous quote"
      >
        <IoIosArrowBack />
      </button>

      {/* Quote Content */}
      <div className="flex flex-col text-center sm:text-left flex-1 px-6">
        <div className="flex items-center justify-center sm:justify-start text-center gap-3 text-lg sm:text-xl font-medium">
          <FaFeatherAlt className="text-pink-400 sm:text-5xl" />
          <span>
            “Your mind will answer most questions if you learn to relax and wait for the answer.”
          </span>
        </div>
        <span className="text-sm sm:text-base text-center text-gray-600 mt-4 font-normal">
          — William S. Burroughs
        </span>
      </div>

      {/* Forward Arrow */}
      <button
        className="text-3xl text-[#1E3CA7] hover:opacity-80 transition bg-transparent border-none p-0"
        style={{ background: "none", border: "none" }}
        aria-label="Next quote"
      >
        <IoIosArrowForward />
      </button>
    </div>
  );
}
