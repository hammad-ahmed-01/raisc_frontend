"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("session_key", data.token);
                localStorage.setItem("user_data", JSON.stringify(data.user));
                router.push("/dashboard");
            } else {
                setErrorMessage("Invalid username or password. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100">
            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">
                <h2 className="text-4xl font-bold text-blue-600 text-center mb-6">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-6">
                    Please log in to continue to your dashboard.
                </p>

                {/* Error Message */}
                {errorMessage && (
                    <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md transition">
                        {errorMessage}
                    </p>
                )}

                {/* Username Field */}
                <div className="mb-4 relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                </div>

                {/* Password Field */}
                <div className="mb-6 relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                </div>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white font-semibold p-3 rounded-md transition duration-300 shadow-md hover:bg-blue-500 focus:outline-none ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:underline font-medium">
                        Sign up here
                    </a>
                </p>
            </div>
        </div>
    );
}