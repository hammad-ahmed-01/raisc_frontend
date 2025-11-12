"use client";

import React, { useState } from "react";
import TopRightIcons from "@/components/TopRightIcons";
import { ArrowLeft } from "lucide-react";

export default function AddPsychologistForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    profilePic: null as File | null,
    specialization: "",
    experience: "",
    availability: "",
    affiliation: "",
    degree: null as File | null,
    license: null as File | null,
    cnic: null as File | null,
    recommendation: null as File | null,
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, files } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fullName = `${form.firstName} ${form.lastName}`;
    try {
      const body = {
        user_type: "doctor",
        email: form.email,
        full_name: fullName,
        password: "Doctor123!",
        doctor_profile: {
          location: "Not Specified",
          specialization: form.specialization,
          experience: form.experience,
          phone: form.phone,
          gender: form.gender,
          availability: form.availability,
          affiliation: form.affiliation,
          rates: "1.00",
        },
      };

      const res = await fetch("/api/organization/register-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${
            typeof window !== "undefined"
              ? localStorage.getItem("session_key")
              : ""
          }`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(
          errorData?.errors?.error ||
            errorData?.detail ||
            "Failed to register psychologist."
        );
        return;
      }

      alert("Psychologist registered successfully!");
      window.location.href = "/organization";
    } catch (err) {
      alert("Something went wrong while registering psychologist.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#F0F9FF] min-h-screen px-4 sm:px-6 md:px-10 pt-4 pb-16 relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <TopRightIcons />
        {/* Desktop Back Button */}
        <button
          onClick={() => window.history.back()}
          className="hidden sm:flex items-center gap-2 text-[#1E3CA7] font-bold text-sm sm:text-md border-2 border-[#1E3CA7] px-4 sm:px-6 py-2 rounded-full bg-white hover:bg-[#f0f8ff] shadow-sm"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      <div className="mb-8 max-w-4xl mx-auto px-2 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-heading">
          Add Psychologist To Organization
        </h2>
        <p className="mb-6 text-base sm:text-lg text-heading2">
          Please fill in the following details to register a new licensed
          psychologist with your organization.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl rounded-xl border border-blue-100 bg-white p-4 sm:p-6 shadow"
      >
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-bold text-heading2 mb-4">
              Personal Info <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "firstName", label: "First Name", required: true },
                { name: "lastName", label: "Last Name", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                {
                  name: "phone",
                  label: "Phone Number",
                  type: "tel",
                  required: true,
                },
                { name: "gender", label: "Gender", required: true },
              ].map(({ name, label, type = "text", required }) => (
                <div key={name} className="flex flex-col">
                  <label className="text-sm font-medium mb-1" htmlFor={name}>
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    required={required}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#2196F3] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2196F3]"
                  />
                </div>
              ))}
              <div className="flex flex-col">
                <label
                  className="text-sm font-medium mb-1"
                  htmlFor="profilePic"
                >
                  Upload Profile Pic <span className="text-red-500">*</span>
                </label>
                <input
                  id="profilePic"
                  name="profilePic"
                  type="file"
                  required
                  onChange={handleChange}
                  className="file-input border border-[#2196F3] text-sm rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="text-lg font-bold text-heading2 mb-4">
              Professional Info <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "specialization", label: "Specialization", required: true },
                {
                  name: "experience",
                  label: "Years of Experience",
                  type: "number",
                  required: true,
                },
                { name: "availability", label: "Availability (Optional)" },
                {
                  name: "affiliation",
                  label: "Affiliation Type",
                  placeholder: "(e.g. Full Time / Consultant)",
                  required: true,
                },
              ].map(({ name, label, type = "text", required }) => (
                <div key={name} className="flex flex-col">
                  <label className="text-sm font-medium mb-1" htmlFor={name}>
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    required={required}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#2196F3] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2196F3]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Verification Documents */}
          <div>
            <h3 className="text-lg font-bold text-heading2 mb-4">
              Verification Documents <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              {[
                { name: "degree", label: "Degree Certificate", required: true },
                { name: "license", label: "License/Registration" },
                { name: "cnic", label: "CNIC/ID Proof", required: true },
                {
                  name: "recommendation",
                  label: "Recommendation Letter (Optional)",
                },
              ].map(({ name, label, required }) => (
                <div
                  key={name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <label
                    htmlFor={name}
                    className="font-semibold text-md text-black sm:w-1/2"
                  >
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="file"
                    required={required}
                    onChange={handleChange}
                    className="file-input w-full sm:w-1/2 border border-[#2196F3] text-sm rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-heading2 px-6 py-2 font-semibold text-white hover:bg-heading border-2 border-heading2 shadow-md disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="rounded-md border-2 border-heading2 bg-white px-6 py-2 text-heading2 hover:bg-blue-50 shadow-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Mobile Back Button */}
      <div className="sm:hidden static bottom-4 mt-4 left-0 w-full flex justify-center z-50">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[#1E3CA7] font-bold text-sm border-2 border-[#1E3CA7] px-6 py-2 rounded-full bg-white hover:bg-[#f0f8ff] shadow-md"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
