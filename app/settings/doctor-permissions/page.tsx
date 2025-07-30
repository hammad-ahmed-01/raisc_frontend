// components/DoctorPermissionsPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { checkAuth, redirectToLogin } from "@/lib/auth";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import SecondaryButton from "@/components/Buttons/SecondaryButton";

type Permission = {
  label: string;
  key: string;
};

const permissions: Permission[] = [
  { label: "Can edit own profile", key: "editProfile" },
  { label: "Can see all assigned patients", key: "seePatients" },
  { label: "Can export data", key: "exportData" },
  { label: "Can delete session", key: "deleteSession" },
  { label: "Can view feedback and reports", key: "viewReports" },
];

const initialPermissionState = {
  editProfile: true,
  seePatients: true,
  exportData: false,
  deleteSession: false,
  viewReports: true,
};

export default function DoctorPermissionsPanel() {
  const [permissionState, setPermissionState] = useState(initialPermissionState);
  const [changed, setChanged] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const performAuthCheck = async () => {
      try {
        const authResult = await checkAuth();
        if (!authResult.isAuthenticated) {
          setAuthError(authResult.error || "Authentication required");
          setTimeout(() => {
            redirectToLogin();
          }, 2000);
          return;
        }
        setAuthVerified(true);
      } catch {
        setAuthError("Authentication check failed");
      }
    };

    if (typeof window !== "undefined") {
      performAuthCheck();
    }
  }, []);

  function togglePermission(key: string) {
    setPermissionState((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const isChanged = Object.keys(initialPermissionState).some(
        (k) => updated[k as keyof typeof updated] !== initialPermissionState[k as keyof typeof initialPermissionState]
      );
      setChanged(isChanged);
      return updated;
    });
  }

  function handleCancel() {
    setPermissionState(initialPermissionState);
    setChanged(false);
  }

  function handleSave() {
    Object.assign(initialPermissionState, permissionState);
    setChanged(false);
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <h1 className="text-2xl font-bold text-left text-heading2 mb-1">Doctor Permissions</h1>
      <p className="text-lg font-medium text-left text-heading2 mb-6">
        Set the default permissions granted to psychologists associated with your organization.
      </p>
      <div className="bg-white border border-[#2196F3] rounded-2xl shadow-sm">
        {permissions.map((perm, idx) => (
          <div
            key={perm.key}
            className={`flex items-center justify-between px-4 py-4 ${
              idx < permissions.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="text-gray-800">{perm.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={permissionState[perm.key as keyof typeof permissionState]}
                onChange={() => togglePermission(perm.key)}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#2196F3] transition-colors duration-300"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5 shadow" />
            </label>
          </div>
        ))}
      </div>

      {changed && (
        <div className="flex justify-center space-x-4 mt-6">
          <PrimaryButton
            text="Save Admin"
            onClick={handleSave}
            className="font-semibold px-6 py-2 rounded-full"
            />

          <SecondaryButton
            text="Cancel"
            onClick={handleCancel}
            className="bg-white text-heading2 font-semibold px-6 py-2 rounded-full"
          />
        </div>
      )}
    </div>
  );
}
