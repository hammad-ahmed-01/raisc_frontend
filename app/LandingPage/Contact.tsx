'use client';
import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation (mandatory)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+92|92|0)?[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
        newErrors.phone = 'Please enter a valid Pakistani phone number';
      }
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
        setErrors({});
      } else {
        setSubmitStatus('error');
        console.error('Server error:', result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative px-4 pt-20 pb-32 bg-blue-50 h-screen overflow-hidden">
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
              <p>+92 302 2222363</p>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <h4 className="flex items-center space-x-2 font-semibold">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </h4>
              <p>info@raisc.org</p>
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
          
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you! Your message has been sent successfully. We'll get back to you soon.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Sorry, there was an error sending your message. Please check all fields and try again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name *"
                  className={`w-full px-4 py-2 rounded-full border shadow focus:outline-none bg-[#FFF8EC] ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-4">{errors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name *"
                  className={`w-full px-4 py-2 rounded-full border shadow focus:outline-none bg-[#FFF8EC] ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-4">{errors.lastName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com *"
                  className={`w-full px-4 py-2 rounded-full border shadow focus:outline-none bg-[#FFF8EC] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03XX-XXXXXXX *"
                  className={`w-full px-4 py-2 rounded-full border shadow focus:outline-none bg-[#FFF8EC] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 ml-4">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="How can we help you? (minimum 10 characters) *"
                rows={4}
                className={`w-full px-4 py-3 rounded-2xl border shadow focus:outline-none bg-[#E6E6FA] ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1 ml-4">{errors.message}</p>}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-3">* All fields are required</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 font-semibold rounded-full shadow transition ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#D9D9D9] text-[#1c2c8c] hover:shadow-lg'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
