"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../LandingPage/constants/navbar";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

type UserType = "patient" | "doctor";

export default function Register() {
  const router = useRouter();

  const [userType, setUserType] = useState<UserType>("patient");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Doctor-only fields
  const [displayName, setDisplayName] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [experience, setExperience] = useState<string>(""); // e.g. "8 yrs"
  const [education, setEducation] = useState<string>("");
  const [expertise, setExpertise] = useState<string>(""); // comma separated
  const [profileImage, setProfileImage] = useState<string>("");
  const [rates, setRates] = useState<string>(""); // numeric string

  const validateInputs = () => {
    if (!username.trim()) {
      setErrorMessage("Full name is required.");
      return false;
    }
    if (username.trim().length < 3) {
      setErrorMessage("Full name must be at least 3 characters long.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Invalid email format.");
      return false;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMessage("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setErrorMessage("Password must contain at least one lowercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setErrorMessage("Password must contain at least one number.");
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setErrorMessage("Password must contain at least one special character.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }

    if (userType === "doctor") {
      if (!specialization.trim()) {
        setErrorMessage("Specialization is required for doctors.");
        return false;
      }
      if (!location.trim()) {
        setErrorMessage("Location is required for doctors.");
        return false;
      }
      if (!rates || isNaN(Number(rates))) {
        setErrorMessage("Please enter a valid numeric rate.");
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage("");
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const body: any = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        user_type: userType,
      };

      if (userType === "doctor") {
        body.doctor_profile = {
          display_name: displayName.trim() || username.trim(),
          specialization: specialization.trim(),
          location: location.trim(),
          experience: experience.trim(),
          education: education.trim(),
          expertise: expertise, // send as comma-separated; backend will split
          profile_image: profileImage.trim(),
          rates: rates.trim(),
        };
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-[url('/bg/patientbg.png')] bg-cover bg-center px-4 py-24">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-[40px] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
            Create an Account
          </h1>
          <p className="text-[36px] font-[400] font-quicksand text-[#1E3CA7] text-center mt-2">
            Join us on your journey to healing.
          </p>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="w-full max-w-2xl rounded-[32px] bg-[#D0E3FF1A] bg-opacity-70 backdrop-blur-xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] border border-[#7EA8FF] p-8 md:p-16">
            {errorMessage && (
              <div className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">
                {errorMessage}
              </div>
            )}

            {/* Full Name */}
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">Full Name</label>
              <input
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your full name"
              />
            </div>

            {/* User Type (circle choices) */}
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-2">I am a</label>
              <div className="flex gap-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio"
                    name="user_type"
                    value="patient"
                    checked={userType === "patient"}
                    onChange={() => setUserType("patient")}
                  />
                  <span className="ml-2 text-gray-700">Patient</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio"
                    name="user_type"
                    value="doctor"
                    checked={userType === "doctor"}
                    onChange={() => setUserType("doctor")}
                  />
                  <span className="ml-2 text-gray-700">Doctor</span>
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Confirm your password"
              />
            </div>

            {/* Doctor-only extra fields (reuses same input aesthetics) */}
            {userType === "doctor" && (
              <>
                <div className="mb-6 text-left">
                  <label className="block text-gray-700 text-base mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="e.g., Dr. Sara Khan"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="e.g., Cognitive Therapy"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="e.g., Lahore"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Experience</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="e.g., 10 yrs"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Education</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="e.g., MSc Clinical Psych"
                    />
                  </div>
                </div>

                <div className="mb-6 mt-6 text-left">
                  <label className="block text-gray-700 text-base mb-1">Expertise (comma separated)</label>
                  <input
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="e.g., CBT, Anxiety"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Profile Image URL (optional)</label>
                    <input
                      type="text"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="/doctor_image.jpg or https://..."
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-gray-700 text-base mb-1">Rate</label>
                    <input
                      type="text"
                      value={rates}
                      onChange={(e) => setRates(e.target.value)}
                      className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                      placeholder="e.g., 500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-center mt-6">
              <PrimaryButton
                text={isLoading ? "Signing in..." : "Sign Up"}
                onClick={handleRegister}
                className="px-10 text-lg py-3 rounded-full"
                disabled={isLoading}
              />
            </div>

            <p className="mt-6 text-center text-sm text-gray-700">
              Already have an account?{" "}
              <a href="/login" className="text-heading2 font-medium hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
