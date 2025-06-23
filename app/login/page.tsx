"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../LandingPage/constants/navbar"; 

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const router = useRouter();

    const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

    const handleLogin = async () => {
        setErrorMessage("");
        setIsLoading(true);

        if (!isBackendConnected) {            const dummyUser = {
                id: 1,
                username: "demo_user",
                email: "demo@example.com",
                user_type: "patient",
                patient_profile: {
                    level: 1,
                    associated_psychologist: "dr_john_doe",
                    associated_psychologist_name: "Dr. John Doe",
                    sent_requests: [], // ID of Dr. Sara Khan who has pending request
                },
            };

            localStorage.setItem("session_key", "dummy-session-key");
            localStorage.setItem("user_data", JSON.stringify(dummyUser));
            router.push("/dashboard");
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
                router.push("/dashboard");
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

            <div className="flex min-h-screen items-center justify-center bg-[url('/bg/patientbg.png')] bg-cover bg-center relative px-4 pt-24">
                <div className="text-center absolute top-24">
                    <h1 className="text-3xl text-heading sm:text-4xl font-bold text-[heading2]">Welcome to RAISC</h1>
                    <p className="text-lg text-heading2 text-[heading2] mt-2">Healing begins with one step.</p>
                </div>

                {/* Outer gradient container */}
                <div className="w-full max-w-2xl rounded-[32px] bg-[#D0E3FF1A] bg-opacity-70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-[#7EA8FF] p-16">
                    <div>
                        {errorMessage && (
                            <div className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <div className="mb-6 text-left">
                            <label className="block text-gray-700 text-base mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                className="w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500 text-gray-700 py-2"
                                placeholder="Enter your username"
                            />
                        </div>

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

                        <div className="flex justify-between items-center mb-6 text-sm">
                            <label className="flex items-center text-heading2 font-medium">
                                <input type="checkbox" className="mr-2 accent-blue-600" />
                                Remember me
                            </label>
                            <a href="#" className="text-heading2 hover:underline">Forgot Password?</a>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleLogin}
                                disabled={isLoading}
                                className={`bg-gradient-to-b from-[#1E3CA7] to-[#131413] text-white px-6 py-2 shadow-sm rounded-full hover:opacity-90 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-700">
                            Don’t have an account yet?{" "}
                            <a href="/register" className="text-heading2 font-medium hover:underline">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
