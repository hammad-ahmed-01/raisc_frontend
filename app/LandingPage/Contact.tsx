import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="relative px-4 py-16 bg-blue-50 overflow-hidden min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg/contactbg.png"
          alt="Contact Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Heading Section */}
        <div className="text-center mt-0 mb-6">
          <h2 className="inline-block px-8 py-3 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md mb-2">
            Contact Us
          </h2>
        </div>

        {/* Grid Container */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Contact Form */}
          <div className="bg-transparent backdrop-blur-md p-6 rounded-xl shadow space-y-4">
            <p className="text-heading2 text-center mt-4">
              “Have questions or ready to begin your mental wellness journey? We're here to help — reach out anytime.”
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Message</label>
                <textarea
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1138d3] text-white font-semibold py-3 rounded-full shadow-md hover:bg-[#0f2fac] transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right: Contact Details */}
          <div className="flex flex-col space-y-6 px-2 md:px-10">
            <h1 className="mt-12 text-2xl font-bold">
              Contact Details
            </h1>
            <div className="ml-40">
              {/* Email */}
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 mt-1 text-gray-700" />
                <div>
                  <h4 className="text-gray-800 font-semibold mb-1">Email</h4>
                  <p className="text-sm text-gray-700">contact@raisc.com</p>
                  <p className="text-sm text-gray-700">support@raisc.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 mt-1 text-gray-700" />
                <div>
                  <h4 className="text-gray-800 font-semibold mb-1">Phone</h4>
                  <p className="text-sm text-gray-700">+92 XXX XXXXXXX</p>
                  <p className="text-sm text-gray-700">Mon–Fri: 8am – 8pm</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 mt-1 text-gray-700" />
                <div>
                  <h4 className="text-gray-800 font-semibold mb-1">Office</h4>
                  <p className="text-sm text-gray-700">NSTP, NUST</p>
                  <p className="text-sm text-gray-700">H-12, Islamabad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
