import { Star } from "lucide-react";

const RatingStars = ({ rating = 4.6 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const totalStars = 5;

  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: totalStars }, (_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;

        return (
          <Star
            key={i}
            className="w-6 h-6"
            fill={isFilled ? "#FFD700" : isHalf ? "none" : "none"}
            stroke={isFilled ? "#FFD700" : isHalf ? "#000000" : "#000000"}
          />
        );
      })}
    </div>
  );
};

export default function Psychologist() {
  return (
    <div className="flex flex-col gap-4 mt-10">
      {/* Header Card */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <img
            src="/img/female-doc.png"
            alt="Therapist"
            className="w-20 h-20 rounded-full border-2 border-blue-300"
          />
          <div>
            <h2 className="text-lg font-semibold text-heading">Dr. Sara Khan</h2>
            <p className="text-heading2">Clinical Psychologist</p>
            <p className="text-sm text-heading2">
              Affiliated with <strong>Pakistan Institute of Mental Health (PIMH)</strong>
            </p>
          </div>
        </div>
        <button className="bg-[#FFF8ECDB] text-heading2 text-sm px-4 py-2 rounded-full shadow">
          Change Therapist
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Sub-Column */}
        <div className="flex flex-col gap-4">
          {/* About Me */}
          <div className="bg-[#FFF8ECDB] p-4 rounded-xl">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="about">👤</span> About Me
            </h3>
            <p className="text-sm text-heading2">
              Passionate about helping individuals manage anxiety and emotional challenges.
            </p>

            {/* Qualifications */}
            <h3 className="font-semibold text-heading mt-3 mb-1 flex items-center gap-2">
              <span role="img" aria-label="qualification">🎓</span> Qualification
            </h3>
            <p className="text-sm text-heading2">
              MSc in Clinical Psychology <br /> Certified CBT Therapist
            </p>
          </div>

          {/* Languages */}
          <div className="bg-[#FFFEFE] p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="languages">💬</span> Languages Spoken
            </h3>
            <p className="text-sm text-heading2">English, Urdu</p>
          </div>
        </div>

        {/* Right Sub-Column */}
        <div className="flex flex-col gap-4">
          {/* Experience */}
          <div className="bg-[#FFFEFE] p-4 rounded-xl border border-[#D7E2FE]">
            <h3 className="font-semibold text-heading mb-1 flex items-center gap-2">
              <span role="img" aria-label="experience">🧳</span> Experience
            </h3>
            <p className="text-sm text-heading2">
              10+ years of experience in trauma, cognitive behavioural therapy, family therapy, anxiety.
            </p>
          </div>

          {/* Ratings */}
          <div className="bg-[#FFFEFE] p-4 rounded-2xl border border-[#D7E2FE] shadow-sm">
            <h3 className="font-semibold text-heading2 text-lg mb-2 flex items-center gap-2">
              <span>⭐</span> Rating / Reviews
            </h3>
            <p className="text-heading2 mb-3 flex items-center gap-1">
              <span>⭐</span> 4.6 rating
            </p>
            <button className="w-full bg-[#E9F5FE] text-heading2 font-medium py-2 rounded-full hover:bg-blue-100 transition">
              Submit your rating
            </button>
            <RatingStars rating={4.6} />
          </div>
        </div>
      </div>
    </div>
  );
}
