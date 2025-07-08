import React from 'react';
import { Home, Calendar, Users, MessageSquare, FileText, User, Zap } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Calendar, label: 'Calendar' },
    { icon: Users, label: 'Patients' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: FileText, label: 'Reports' },
    { icon: User, label: 'Profile' },
    { icon: Zap, label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-[#1E3CA7] flex flex-col items-center py-6 z-10">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#1E3CA7] font-bold text-lg">R</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              item.active
                ? 'bg-white text-[#1E3CA7]'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>
    </div>
  );
};
