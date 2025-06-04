import React from 'react';

export default function ContactSection() {
  return (
    <section id="contact" className="px-4 py-16 bg-blue-50">
      {/* Heading Section */}
      <div className="text-center mb-12">
        <h2 className="inline-block px-8 py-3 text-heading font-bold text-2xl rounded-full border border-heading bg-[#F1F4FB] shadow-md mb-2">
          Contact Us
        </h2>
        <p className="text-heading2">
          “Have questions or ready to begin your mental wellness journey? We're here to help — reach out anytime.”
        </p>
      </div>

      {/* Grid Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Contact Details */}
        <div className="p-6 rounded-xl shadow space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>

          {/* Email */}
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" fill="none" />
                <path d="M4 4l8 8 8-8" />
              </svg>
              <span className="text-lg font-medium text-gray-800">Email</span>
            </div>
            <div className="ml-9 text-gray-700">
              <p>contact@raisc.com</p>
              <p>support@raisc.com</p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.6a1 1 0 01.7.3l2.4 2.4A1 1 0 0012.4 6H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              </svg>
              <span className="text-lg font-medium text-gray-800">Phone</span>
            </div>
            <div className="ml-9 text-gray-700">
              <p>+92 XXX XXXXXXX</p>
              <p>Mon–Fri: 8am – 8pm</p>
            </div>
          </div>

          {/* Office */}
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="text-lg font-medium text-gray-800">Office</span>
            </div>
            <div className="ml-9 text-gray-700">
              <p>NSTP, NUST</p>
              <p>H-12, Islamabad</p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-[#f7fbfd] p-6 rounded-xl shadow space-y-4">
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
                rows="4"
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
      </div>
    </section>
  );
}
