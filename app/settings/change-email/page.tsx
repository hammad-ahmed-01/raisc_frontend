"use client";
import { useState, useEffect } from "react";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

export default function ChangeEmailPage() {
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [sendVerification, setSendVerification] = useState(true);
  const [saving, setSaving] = useState(false);

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
    if (newEmail !== confirmEmail) {
      alert("New email and confirmation email do not match.");
      return;
    }

    const userData = localStorage.getItem("user_data");
    const userType = userData ? JSON.parse(userData).user_type : "doctor";
    const user = userType === "doctor" ? "doctor" : "patient";

    setSaving(true);
    try {
      const sessionKey = localStorage.getItem("session_key");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/${user}/change-email/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${sessionKey}`,
          },
          body: JSON.stringify({
            current_email: currentEmail,
            new_email: newEmail,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update email.");
      alert("Verification code sent to new email.");
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 px-4 md:px-0">
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
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-left text-heading2 mb-6 md:mb-12 ml-0 md:ml-4">
        Change Email
      </h1>

      <div className="flex justify-center px-0 md:px-4">
        <div className="bg-[#E9F5FE] border border-[#2196F3] rounded-2xl shadow-xl p-4 md:p-6 w-full max-w-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-center text-blue-800 mb-1">Update Your Email</h2>
            <p className="text-center text-[#444444] mb-6">Enter Your Current Email and a New Email.</p>

            <div className="space-y-4">
              <input
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                placeholder="Current Email"
                className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New Email"
                className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirm New Email"
                className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Toggle Switch */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setSendVerification(!sendVerification)}
              >
                <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                  {sendVerification && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                </div>
                <label className="text-sm text-gray-800">Send Verification Code</label>
              </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 md:gap-4 mt-6">
            <SecondaryButton
              text="Cancel"
              onClick={() => {
                setCurrentEmail("");
                setNewEmail("");
                setConfirmEmail("");
              }}
              className="w-full sm:w-auto px-12 py-2 rounded-full text-heading2 font-semibold"
            />
            <PrimaryButton
              text="Save Changes"
              onClick={handleSaveChanges}
              className="w-full sm:w-auto px-5 py-2 rounded-full bg-heading2 font-semibold"
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
