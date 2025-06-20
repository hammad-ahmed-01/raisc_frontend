import React from 'react';
import { Header } from './components/Header';
import { QuoteCarousel } from './components/QuoteCarousel';
import { Resources } from './components/Resources';
import { TherapistCard } from './components/TherapistCard';
import { ChatBot } from './components/ChatBot';

const Dashboard: React.FC = () => {
  return (
    <div
      className="flex min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/returningbg.png')" }}
    >
      <div className="flex-1 px-6 py-6">
        {/* Header */}
        <Header name="Hira" />

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 mt-24 gap-6">
          {/* Column 1: Quote + Resources */}
          <div className="flex flex-col items-center justify-center gap-6">
            <QuoteCarousel />
            <Resources />
          </div>

          {/* Column 2: Therapist Card */}
          <div className="flex justify-center">
            <TherapistCard />
          </div>

          {/* Column 3: ChatBot */}
          <div className="flex justify-center items-end">
            <ChatBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
