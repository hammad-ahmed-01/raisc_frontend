"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../LandingPage/constants/navbar";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");

  const [associatedPsychologist, setAssociatedPsychologist] = useState("");
  const [profileData, setProfileData] = useState("");
  const [professionalInformation, setProfessionalInformation] = useState("");
  const [chatgroupNickname, setChatgroupNickname] = useState("");
  const [rates, setRates] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstStep = () => {
    setErrorMessage("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/;

    if (fullName.trim().split(" ").length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const bodyData: any = {
        username: fullName.trim().replace(/\s+/g, "_").toLowerCase(),
        password,
        email,
        user_type: userType,
      };

      if (userType === "patient") {
        bodyData.patient_profile = {
          level: 1,
          associated_psychologist: associatedPsychologist || null,
          profile_data: profileData || null,
        };
      } else {
        bodyData.doctor_profile = {
          professional_information: professionalInformation || null,
          chatgroup_nickname: chatgroupNickname || null,
          rates: rates || null,
        };
      }

      console.log("Sending registration data:", bodyData);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();
      console.log("API response:", response.status, result);

      if (response.ok) {
        console.log("Registration successful, navigating to /login");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAssociatedPsychologist("");
        setProfileData("");
        setProfessionalInformation("");
        setChatgroupNickname("");
        setRates("");
        router.push("/login");
      } else {
        if (result.details) {
          if (Array.isArray(result.details)) {
            setErrorMessage(result.details.join(" "));
          } else if (typeof result.details === "object") {
            const messages = Object.entries(result.details)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
              .join(" ");
            setErrorMessage(messages);
          } else {
            setErrorMessage(String(result.details));
          }
        } else {
          setErrorMessage(result.error || "Registration failed.");
        }
        console.error("Registration failed:", result);
      }
    } catch (err) {
      console.error("Error during registration:", err);
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
          <h1 className="text-[40px] leading-[100%] tracking-[0%] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
            Create an Account
          </h1>
          <p className="text-[36px] leading-[100%] tracking-[0%] font-[400] font-quicksand text-[#1E3CA7] text-center mt-2">
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

            {step === 1 && (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 text-base mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                    className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-base mb-2">User Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="userType"
                        value="patient"
                        checked={userType === "patient"}
                        onChange={() => setUserType("patient")}
                      />
                      Patient
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="userType"
                        value="doctor"
                        checked={userType === "doctor"}
                        onChange={() => setUserType("doctor")}
                      />
                      Doctor
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-base mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-base mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-base mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <PrimaryButton
                    text="Next"
                    onClick={handleFirstStep}
                    className="px-10 text-lg py-3 rounded-full"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {userType === "patient" && (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-1">Associated Psychologist</label>
                      <input
                        type="text"
                        value={associatedPsychologist}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setAssociatedPsychologist(e.target.value)
                        }
                        className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                        placeholder="Enter psychologist ID or name"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-1">Profile Data</label>
                      <textarea
                        value={profileData}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setProfileData(e.target.value)}
                        className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                        placeholder="Additional patient info"
                      />
                    </div>
                  </>
                )}

                {userType === "doctor" && (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-1">Professional Information</label>
                      <textarea
                        value={professionalInformation}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setProfessionalInformation(e.target.value)
                        }
                        className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                        placeholder="Your qualifications, experience, etc."
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-1">Chatgroup Nickname</label>
                      <input
                        type="text"
                        value={chatgroupNickname}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setChatgroupNickname(e.target.value)
                        }
                        className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                        placeholder="Nickname for chat groups"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-base mb-1">Rates</label>
                      <input
                        type="text"
                        value={rates}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setRates(e.target.value)}
                        className="w-full border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                        placeholder="Enter your rates"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-center gap-4 mt-6">
                  <PrimaryButton
                    text="Back"
                    onClick={() => setStep(1)}
                    className="px-10 text-lg py-3 rounded-full bg-gray-400"
                  />
                  <PrimaryButton
                    text={isLoading ? "Registering..." : "Register"}
                    onClick={handleRegister}
                    className="px-10 text-lg py-3 rounded-full"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
