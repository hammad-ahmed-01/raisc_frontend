"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen w-full">
      {/* === HEADER === */}
      <div className="w-full bg-gradient-to-b from-[#1E3CA7] to-[#0C1741] text-white items-start text-left py-14 px-6">
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold mb-4 text-left text-white">
          Privacy Policy
        </h1>
        <p className="max-w-2xl text-white/90 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed mb-4">
          We&apos;re committed to protecting your privacy and ensuring
          transparency about how we collect, use, and safeguard your personal
          information on our educational platform.
        </p>
        <p className="text-sm text-white/70">
          Last updated: <strong>December, 2025</strong>
        </p>
      </div>

      {/* === CONTENT === */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 space-y-10 text-[clamp(0.95rem,1.5vw,1.05rem)] leading-relaxed">
        {/* Section: Introduction */}
        <div className="bg-white border border-[#AFC8FF] rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 sm:p-10">
          <h2 className="text-heading2 font-bold mb-3">Introduction</h2>
          <p>
            Welcome to RAISC. This Privacy Policy outlines how we collect, use,
            store, and protect your information when you access our mental
            health platform and use our services. <br />
            By using RAISC, you agree to the collection and handling of your
            information under the terms described here. We value your privacy
            and are committed to ensuring your data is treated with
            confidentiality, care, and responsibility.
          </p>

          {/* Section: Data Collection */}
          <h2 className="text-heading2 font-bold mb-3">Data Collection</h2>
          <p>
            We collect personal information you provide directly to us, such as
            when you:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Create a RAISC account or complete your profile</li>
            <li>Book sessions with psychologists</li>
            <li>Interact with the AI chatbot or use self-help modules</li>
            <li>
              Submit wellness assessments, journal entries, or progress logs
            </li>
            <li>Contact us for support, feedback, or queries</li>
            <li>Subscribe to updates, newsletters, or notifications</li>
          </ul>
          <p className="mt-3">
            The data we may collect includes (but is not limited to): your name,
            email address, contact information, account details, mental health
            preferences, session history, language choice, interaction data with
            our services, and any information you choose to share during usage.
          </p>

          {/* Section: Use of Data */}

          <h2 className="text-heading2 font-bold mb-3">Use of Data</h2>
          <p>
            We use your data to help improve your wellness experience and
            maintain smooth platform operations. Your information may be used
            to:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Provide and personalize services on our platform</li>
            <li>
              Facilitate appointments and communication with psychologists
            </li>
            <li>Improve AI responses and user experience</li>
            <li>Send session reminders, updates, or wellness content</li>
            <li>
              Track progress, emotional patterns, and engagement analytics
            </li>
            <li>Ensure platform security and prevent misuse</li>
            <li>Comply with legal obligations wherever required</li>
          </ul>
          <p className="mt-3">
            We do not sell personal information to third parties.
          </p>

          {/* Section: Cookies and Tracking */}

          <h2 className="text-heading2 font-bold mb-3">Cookies and Tracking</h2>
          <p>
            RAISC uses cookies and similar technologies to enhance user
            experience and optimize platform performance. Cookies help us
            understand your preferences and session history for smoother
            navigation.
          </p>
          <p className="mt-3 font-semibold">Types of cookies we may use:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Essential Cookies:</strong> Required for core
              functionality such as login access.
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand platform
              usage and improve efficiency.
            </li>
            <li>
              <strong>Preference Cookies:</strong> Save settings like theme,
              language, or reminders.
            </li>
            <li>
              <strong>Analytics/Behavior Cookies:</strong> Used to personalize
              wellness journeys and recommendations.
            </li>
          </ul>
          <p className="mt-3">
            You may disable cookies through your browser settings, though some
            features may not function properly without them.
          </p>

          {/* Section: Third-Party Services */}
          <h2 className="text-heading2 font-bold mb-3">Third-Party Services</h2>
          <p>
            RAISC may work with trusted third-party providers to deliver certain
            features. These services have their own privacy policies and may
            collect limited data to operate effectively.
          </p>
          <p className="mt-3 font-semibold">Examples include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Appointment scheduling and payment gateways</li>
            <li>Secure cloud storage for session data</li>
            <li>Email and SMS communication tools</li>
            <li>Analytics platforms for product improvement</li>
            <li>Video/voice platforms for online therapy sessions</li>
          </ul>
          <p className="mt-3">
            We ensure our partners maintain confidentiality and data protection
            compliance.
          </p>

          {/* Section: Your Rights */}
          <h2 className="text-heading2 font-bold mb-3">Your Rights</h2>
          <p>
            You have the right to manage your data at any time. You may request:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Access: A copy of the personal data we store</li>
            <li>Correction: Updates to inaccurate or incomplete information</li>
            <li>Deletion: Removal of your account and stored records</li>
            <li>Portability: Transfer of your data in a structured format</li>
            <li>Restriction: Limit how we process certain information</li>
            <li>
              Objection: Opt-out of non-essential communication or tracking
            </li>
          </ul>
          <p className="mt-3">
            To exercise your rights, contact us using the details below.
          </p>

          {/* Section: Contact Us */}
          <h2 className="text-heading2 font-bold mb-3">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, our data practices,
            or wish to submit a privacy request, you may reach us at:
          </p>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            <li className="flex items-center gap-2">
              <Mail size={18} /> <strong>Email:</strong> privacy@raisc.org
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} /> <strong>Phone:</strong> +92 XXX-XXXXXXX
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={18} /> <strong>Address:</strong> NSTP, NUST,
              Islamabad
            </li>
            <li className="flex items-center gap-2">
              <Clock size={18} /> <strong>Hours:</strong> Monday – Friday, 9:00
              AM – 6:00 PM PKT
            </li>
          </ul>
          <p className="mt-6 text-[0.95rem] text-heading2/80">
            We aim to respond to data-related requests within 30 days of
            receiving them.
          </p>
        </div>
      </div>
    </section>
  );
}
