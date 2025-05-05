"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        const sessionKey = localStorage.getItem("session_key");
        setIsLoggedIn(!!sessionKey);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("session_key");
        localStorage.removeItem("user_data");
        setIsLoggedIn(false);
        router.push("/");
    };

    if (!hydrated) return null;

    return (
        <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg py-4 px-6 flex justify-between items-center z-50 rounded-b-2xl">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center">
                    <div className="bg-white rounded-full p-1 w-fit">
                                          <Image
                                            src="/raisc-logo.png"
                                            alt="RAISC Logo"
                                            width={50}
                                            height={50}
                                            className="rounded-full"
                                          />
                                        </div>
                    <h1 className="text-2xl font-semibold tracking-wide ml-2">RAISC</h1>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
                <Link href="/" className="hover:text-gray-200 transition">Home</Link>
                <Link href="/about" className="hover:text-gray-200 transition">About</Link>
                <Link href="/programs" className="hover:text-gray-200 transition">Programs</Link>
                <Link href="/groups" className="hover:text-gray-200 transition">ChatGroups</Link>
                {isLoggedIn && (
                    <Link href="/dashboard" className="hover:text-gray-200 transition">Profile</Link>
                )}
            </div>

            {/* Login / Logout Button */}
            <div>
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                    >
                        Logout
                    </button>
                ) : (
                    <Link href="/login">
                        <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg shadow-md transition">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
}
