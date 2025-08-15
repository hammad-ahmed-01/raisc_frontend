"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../LandingPage/constants/navbar";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setErrorMessage(
        "Password must contain at least one special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage("");

    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const errorData = await response.json();
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
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your full name"
              />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Enter your password"
              />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-gray-700 text-base mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                placeholder="Confirm your password"
              />
            </div>
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
              <a
                href="/login"
                className="text-heading2 font-medium hover:underline"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
