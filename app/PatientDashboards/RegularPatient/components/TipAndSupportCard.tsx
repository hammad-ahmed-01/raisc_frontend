// components/TipAndSupportCard.tsx

import { Lightbulb, HelpCircle, Sparkles } from "lucide-react";

export default function TipAndSupportCard() {
  return (
    <div className="flex flex-col items-center gap-6 my-8">
      <div className="space-y-6 w-full max-w-md">
        {/* Tip of the Day */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4">
          <div className="text-yellow-500">
            <Lightbulb size={40} />
          </div>
          <div>
            <h3 className="font-bold text-heading2 mb-1">Tip of the Day</h3>
            <p className="text-heading2 text-sm leading-snug">
              Relax. Breathe. <br />
              Let go a little.
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
      </div>
    </div>
  );
}
