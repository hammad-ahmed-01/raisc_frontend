"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";


export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const performAuthCheck = async () => {
      const authResult = await checkAuth();
      if (!authResult.isAuthenticated) {
        setAuthError(authResult.error || "Authentication required");
        setTimeout(() => {
          redirectToLogin();
        }, 2000);
        return;
      }
      setAuthVerified(true);
    };
    performAuthCheck();
  }, []);

  const handleSaveChanges = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    const userData = localStorage.getItem("user_data");
    const userType = userData ? JSON.parse(userData).user_type : "doctor";

    const user = userType === "doctor" ? "doctor" : "patient";

    setSaving(true);
    try {
      const sessionKey = localStorage.getItem("session_key");
      const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${user}/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${sessionKey}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to update password.");
      alert("Password updated successfully.");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Something went wrong. Please try again.");
    }

    setSaving(false);
  };

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
          <p className="text-gray-700 mb-4">{authError}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (!authVerified) {
    return <p className="text-center text-gray-600 mt-10">Verifying session...</p>;
  }

  return (
    <div className="min-h-screen bg-[#E9F5FE] p-8">
      <h1 className="text-2xl font-bold text-left text-heading2 mb-12 ml-4">Change Password</h1>

      <div className="flex justify-center">
        <div className="bg-[#E9F5FE] border border-[#2196F3] rounded-2xl shadow-xl p-6 w-full max-w-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-center text-blue-800 mb-1">Update Your Password</h2>
            <p className="text-center text-[#444444] mb-6">Enter Your Current Password and a New Password.</p>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full p-3 pr-10 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full p-3 pr-10 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full p-3 pr-10 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex justify-end gap-4 mt-6">
            <SecondaryButton
              text="Cancel"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-12 py-2 rounded-full text-heading2 font-semibold"
            />
            <PrimaryButton
              text="Save Changes"
              onClick={handleSaveChanges}
              className="px-5 py-2 rounded-full bg-heading2 font-semibold"
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
