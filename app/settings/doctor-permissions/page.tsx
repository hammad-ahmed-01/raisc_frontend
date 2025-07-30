// components/DoctorPermissionsPanel.tsx
"use client";

import { useState } from "react";

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

export default function DoctorPermissionsPanel() {
  const initialState = {
    editProfile: true,
    seePatients: true,
    exportData: false,
    deleteSession: false,
    viewReports: true,
  };

  const [permissionState, setPermissionState] = useState(initialState);
  const [changed, setChanged] = useState(false);

  function togglePermission(key: string) {
    setPermissionState((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const isChanged = Object.keys(initialState).some(
        (k) => updated[k as keyof typeof updated] !== initialState[k as keyof typeof initialState]
      );
      setChanged(isChanged);
      return updated;
    });
  }

  function handleCancel() {
    setPermissionState(initialState);
    setChanged(false);
  }

  function handleSave() {
    // Placeholder for backend integration
    Object.assign(initialState, permissionState);
    setChanged(false);
  }

  return (
      <div className="min-h-screen w-full">
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
            <button
              onClick={handleSave}
              className="bg-gradient-to-b from-heading2 to-[#131413] hover:bg-heading text-white font-semibold px-6 py-2 rounded-full"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-white border border-heading2 text-heading2 hover:bg-slate-100 font-semibold px-6 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
  );
}
