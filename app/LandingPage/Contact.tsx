import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="relative px-4 pt-20 pb-32 bg-blue-50 min-h-screen overflow-hidden">
      <div className="mb-2">
         <img
           src="/contact.png" 
           alt="Services Icon"
           className="mx-auto w-30 h-20"
         />
      </div>
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-[#1c2c8c] flex items-center justify-center space-x-2">
          <Phone className="w-6 h-6" />
          <span>Contact Us</span>
        </h2>
        <p className="text-[#1c2c8c] mt-2 text-lg">We’re here to support you — reach out anytime.</p>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 border rounded-2xl border-[#2196F3] border-3 shadow-md overflow-hidden bg-white">
        {/* Left Panel */}
        <div className="p-6 md:p-10 border-r border-blue-200">
          {/* Bubble heading */}
          <div className="bg-[#E9F5FE] shadow rounded-full py-3 text-center font-semibold text-[#1c2c8c] text-lg mb-6">
            Get In Touch With Us Now!
          </div>

          {/* Grid with dividers */}
          <div className="grid grid-cols-2 divide-x divide-y divide-blue-200 border border-blue-200 rounded-md overflow-hidden text-[#1c2c8c] text-sm font-medium">
            {/* Phone */}
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <h4 className="flex items-center space-x-2 font-semibold">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </h4>
              <p>+92 XXX XXXXXXX</p>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <h4 className="flex items-center space-x-2 font-semibold">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </h4>
              <p>contact@raisc.com</p>
              <p>support@raisc.com</p>
            </div>

            {/* Location */}
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <h4 className="font-semibold">Location</h4>
              <p>NSTP, NUST</p>
              <p>H-12, Islamabad</p>
            </div>

            {/* Working Hours */}
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <h4 className="font-semibold">Working Hours</h4>
              <p>Mon–Fri: 8am - 8pm</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Contact Form */}
        <div className="p-6 md:p-10 space-y-6">
          <div className="bg-[#E9F5FE] shadow rounded-full py-3 text-center font-semibold text-[#1c2c8c] text-lg">
            Contact Us
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none bg-[#FFF8EC]"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none bg-[#FFF8EC]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none bg-[#FFF8EC]"
              />
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none bg-[#FFF8EC]"
              />
            </div>
            <textarea
              placeholder="How can we help you?"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow focus:outline-none bg-[#E6E6FA]"
            />
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-[#D9D9D9] text-[#1c2c8c] font-semibold rounded-full shadow hover:shadow-lg transition"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
