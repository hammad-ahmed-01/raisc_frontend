import React from 'react';

interface FeatureCardProps {
  icon: string;
  text: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 bg-yellow-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-800 font-medium">{text}</span>
    </div>
  );
};

export default FeatureCard;
