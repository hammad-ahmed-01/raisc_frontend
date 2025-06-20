import React from 'react';
import { FileText, Heart, Headphones } from 'lucide-react';

export const Resources: React.FC = () => (
  <div className="bg-[#FFF8EC] p-4 rounded-2xl shadow-md w-full max-w-xs">
    <h2 className="text-heading font-bold text-xl text-center mb-4">Resources</h2>
    <ul className="space-y-3">
      <li className="bg-white rounded-full shadow px-4 py-2 flex items-center gap-2">
        <FileText className="text-blue-800" size={20} /> Articles.......
      </li>
      <li className="bg-white rounded-full shadow px-4 py-2 flex items-center gap-2">
        <Heart className="text-blue-800" size={20} /> Exercises.....
      </li>
      <li className="bg-white rounded-full shadow px-4 py-2 flex items-center gap-2">
        <Headphones className="text-blue-800" size={20} /> Audio.....
      </li>
    </ul>
    <p className="text-blue-600 text-sm mt-3 text-center underline cursor-pointer">See all resources</p>
  </div>
);