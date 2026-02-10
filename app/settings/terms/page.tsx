"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function TermsConditions() {
  return (
    <section className="w-full min-h-screen">
      {/* === HEADER === */}
      <div className="w-full bg-gradient-to-b from-[#1E3CA7] to-[#0C1741] text-white items-start text-left py-14 px-6">
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold mb-4 text-left text-white">
          Terms & Conditions
        </h1>
        <p className="max-w-2xl text-white/90 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed mb-4">
          These Terms & Conditions govern your use of RAISC and outline the
          rules and responsibilities of all users.
        </p>
        <p className="text-sm text-white/70">
          Last updated: <strong>December, 2025</strong>
        </p>
      </div>

      {/* === CONTENT === */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 space-y-10 text-[clamp(0.95rem,1.5vw,1.05rem)] leading-relaxed">
        {/* Main Card */}
        <div className="bg-white border border-[#AFC8FF] rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6 sm:p-10 space-y-8">
          {/* 1. Acceptance of Terms */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By using RAISC, you agree to comply with these Terms & Conditions.
              If you disagree with any part, please discontinue use of the
              platform.
            </p>
          </div>

          {/* 2. Service Scope */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">2. Service Scope</h2>
            <p>
              RAISC provides digital mental health support tools, including
              AI-based assistance, educational resources, and access to licensed
              professionals. The platform is not a substitute for emergency
              mental healthcare or medical diagnosis.
            </p>
          </div>

          {/* 3. User Responsibilities */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">
              3. User Responsibilities
            </h2>
            <p>Users must:</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Create and maintain accurate account information</li>
              <li>Use the platform ethically and lawfully</li>
              <li>Refrain from misuse, abusive conduct, or harmful activities</li>
            </ul>
            <p className="mt-2">
              RAISC may suspend accounts that violate guidelines.
            </p>
          </div>

          {/* 4. Data & Privacy */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">4. Data & Privacy</h2>
            <p>
              Information provided by users is handled in accordance with the{" "}
              <strong>Privacy Policy</strong>. Personal data is not shared
              without consent unless required by law.
            </p>
          </div>

          {/* 5. Consultations */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">5. Consultations</h2>
            <p>
              Professional sessions offered through RAISC are intended for
              guidance and wellness support only. Emergency conditions should be
              directed to local medical or crisis services.
            </p>
          </div>

          {/* 6. Modifications */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">6. Modifications</h2>
            <p>
              RAISC reserves the right to update features, policies, or
              functionality. Continued use after updates constitutes acceptance
              of revised terms.
            </p>
          </div>

          {/* 7. Intellectual Property */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">
              7. Intellectual Property
            </h2>
            <p>
              All platform content, branding, and material remain the property
              of RAISC and may not be reproduced without permission.
            </p>
          </div>

          {/* 8. Warranty & Liability */}
          <div>
            <h2 className="text-heading2 font-bold mb-2">
              8. Warranty & Liability
            </h2>
            <p>
              RAISC is provided “as is.” We are not liable for losses, damages,
              or decisions made based on platform interaction or content.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-heading2 font-bold mb-3">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, our data
              practices, or wish to submit a privacy request, you may reach us
              at:
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
                <Clock size={18} /> <strong>Business Hours:</strong> Monday –
                Friday, 9:00 AM – 6:00 PM PKT
              </li>
            </ul>
            <p className="mt-6 text-[0.95rem] text-heading2/80">
              We aim to respond to data-related requests within 30 days of
              receiving them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
