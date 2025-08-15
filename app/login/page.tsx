  "use client";
  import { useState, ChangeEvent, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import Navbar from "../LandingPage/constants/navbar";
  import PrimaryButton from "@/components/Buttons/PrimaryButton";

  export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const router = useRouter();

    // Redirect to dashboard if already logged in
    useEffect(() => {
      if (typeof window !== "undefined") {
        const key = localStorage.getItem("session_key");
        if (key && key !== "null" && key !== "") {
          router.push("/production");
        }
      }
    }, [router]);


    const isBackendConnected =
      process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

    const handleLogin = async () => {
      setErrorMessage("");
      setIsLoading(true);

      if (!isBackendConnected) {
        const dummyUser = {
          id: 2,
          username: "demo_user",
          email: "demo@example.com",
          user_type: "patient",
           patient_profile: {
             level: 1,
             associated_psychologist: "dr_john_doe",
             associated_psychologist_name: "Dr. John Doe",
             sent_requests: []
           }
          // doctor_profile: {
          //   professional_information: {
          //     specialization: "Psychiatry",
          //     experience: "5 years",
          //     qualifications: "MD, PhD"
          //   },
          //   chatgroup_nickname: "DocDemo",
          //   rates: "$100/hr"
          // }
          // organization_profile: {
          //   name: "Pakistan Institute of Mental Health",
          //   total_psychologists: 10,
          //   total_patients: 30,
          //   sessions_today: 4,
          //   new_join_requests: 2,
          //   todays_sessions: [
          //     { doctor: "Dr. Ali Hamza", therapy_type: "Cognitive Therapy", time: "9:00 AM" },
          //     { doctor: "Dr. Alisha", therapy_type: "Cognitive Therapy", time: "11:00 AM" },
          //     { doctor: "Dr. Sara Ali", therapy_type: "Cognitive Therapy", time: "10:00 AM" },
          //     { doctor: "Dr. Zahra", therapy_type: "Cognitive Therapy", time: "3:00 PM" }
          //   ]
          // }
        };

        localStorage.setItem("session_key", "dummy-session-key");
        localStorage.setItem("user_data", JSON.stringify(dummyUser));
        
        // Route based on user type
        router.push("/production");

        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/login/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("session_key", data.token);
          localStorage.setItem("user_data", JSON.stringify(data.user));
          
          router.push("/production");

        } else {
          setErrorMessage("Invalid username or password.");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrorMessage("Something went wrong. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        {/* Navbar */}
        <Navbar />

        <div className="flex flex-col min-h-screen bg-[url('/bg/patientbg.png')] bg-cover bg-center px-4 py-24">
          <div className="text-center mb-10 mt-4">
            <h1 className="text-[48px] leading-[100%] tracking-[0%] font-[700] font-quicksand text-[#1E3CA7] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
              Welcome to RAISC
            </h1>
            <p className="text-[40px] leading-[100%] tracking-[0%] font-[400] font-quicksand text-[#1E3CA7] text-center mt-2">
              Healing begins with one step.
            </p>
          </div>

          <div className="flex justify-center items-center flex-1">
            {/* Outer gradient container */}
            <div className="w-full max-w-2xl rounded-[32px] bg-[#D0E3FF1A] bg-opacity-70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-[#7EA8FF] p-8 md:p-16">
              <div>
                {errorMessage && (
                  <div className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">
                    {errorMessage}
                  </div>
                )}

                <div className="mb-6 text-left">
                  <label className="block text-gray-700 text-base mb-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
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

                <div className="flex justify-between items-center mb-6 text-sm">
                  <label className="flex items-center text-heading2 font-medium">
                    <input type="checkbox" className="mr-2 accent-blue-600" />
                    Remember me
                  </label>
                  <a href="#" className="text-heading2 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <div className="flex justify-center">
                  <PrimaryButton
                    text="Login"
                    onClick={handleLogin}
                    className={`px-10 text-lg py-3 rounded-full`}
                    disabled={isLoading}
                  />
                </div>

                <p className="mt-6 text-center text-sm text-gray-700">
                  {"Don't have an account yet?   "}
                  <a
                    href="/register"
                    className="text-heading2 font-medium hover:underline"
                  >
                      Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
