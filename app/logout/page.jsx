"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Redirect to home page
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Logging out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
}
