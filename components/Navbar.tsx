"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
    const [hydrated, setHydrated] = useState(false); // Ensure hydration before rendering

    useEffect(() => {
        // Ensure component is hydrated
        setHydrated(true);

        // Check for session_key in localStorage
        const sessionKey = localStorage.getItem("session_key");
        setIsLoggedIn(!!sessionKey);
    }, []);

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem("session_key");
        localStorage.removeItem("user_data");
        setIsLoggedIn(false); // Update login status
        router.push("/");
    };

    if (!hydrated) {
        return null; // Avoid rendering until hydration is complete
    }

    return (
        <nav className="navbar">
            {/* Logo and Title */}
            <div className="navbar-logo">
                <Link href="/">
                    <Image
                        src="/raisc-logo.jpg" // Save the provided image in public as 'raisc-logo.jpg'
                        alt="RAISC Logo"
                        width={50}
                        height={50}
                    />
                </Link>
                <h1 className="navbar-title">RAISC</h1>
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                {isLoggedIn ? (
                    <Link href="/dashboard">Profile</Link>
                ) : (
                    <Link href="/">Home</Link>
                )}
                <Link href="/groups">ChatGroups</Link>
                {isLoggedIn ? (
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <Link href="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}
