"use client";
import { useState, useEffect } from "react";
import { checkAuth, redirectToLogin } from "@/lib/auth";

interface DoctorNotificationSettings {
  appointment_reminders: boolean;
  patient_messages: boolean;
  session_confirmations: boolean;
  schedule_changes: boolean;
  emergency_alerts: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

interface PatientNotificationSettings {
  session_alerts: boolean;
  reschedule_cancel: boolean;
  doctor_updates: boolean;
  platform_updates: boolean;
}

type NotificationSettings =
  | DoctorNotificationSettings
  | PatientNotificationSettings;

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [userType, setUserType] = useState<string>("doctor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [authError, setAuthError] = useState("");

  const isBackendConnected =
    process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const userDataRaw = localStorage.getItem("user_data");
    const userData = userDataRaw ? JSON.parse(userDataRaw) : {};
    const userTypeValue = userData?.user_type || "doctor";
    setUserType(userTypeValue);

    const fetchNotificationSettings = async () => {
      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${userTypeValue}/notifications/`,
            {
              headers: {
                Authorization: `Token ${sessionKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setSettings(data);
          }
        } catch (error) {
          console.error("Error fetching notification settings:", error);
        }
      } else {
        setSettings(getDummySettings(userTypeValue));
      }

      setLoading(false);
    };

    fetchNotificationSettings();
  }, [isBackendConnected]);

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

  const handleToggle = async (key: string) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof NotificationSettings],
    };

    setSettings(newSettings);

    if (isBackendConnected) {
      setSaving(true);
      try {
        const sessionKey = localStorage.getItem("session_key");
        await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/${userType}/notifications/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${sessionKey}`,
            },
            body: JSON.stringify(newSettings),
          }
        );
      } catch (error) {
        console.error("Error updating notification settings:", error);
      }
      setSaving(false);
    }
  };

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{authError}</div>
      </div>
    );
  }

  if (!authVerified || loading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const orderedPatientKeys = [
    "session_alerts",
    "reschedule_cancel",
    "doctor_updates",
    "platform_updates",
  ];

  // Type guard for PatientNotificationSettings
  function isPatientSettings(
    settings: NotificationSettings
  ): settings is PatientNotificationSettings {
    return (
      "session_alerts" in settings &&
      "reschedule_cancel" in settings &&
      "doctor_updates" in settings &&
      "platform_updates" in settings
    );
  }

  const settingEntries =
    userType === "patient" && settings && isPatientSettings(settings)
      ? orderedPatientKeys.map((key) => [
          key,
          settings[key as keyof PatientNotificationSettings],
        ])
      : Object.entries(settings ?? {});

  return (
    <div>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl text-left font-bold text-heading2 mb-4">
          Notifications
        </h1>

        <div className="divide-y divide-[#dce9fb] border border-[#2196F3] rounded-[20px] max-h-[600px] overflow-y-auto">
          {settingEntries.map(([key, value], idx, arr) => (
            <div
              key={String(key)}
              className={`flex items-center justify-between px-6 py-5 bg-white ${
                idx !== arr.length - 1 ? "border-b border-[#dce9fb]" : ""
              }`}
            >
              <div>
                <h3 className="font-semibold text-[#444444]">
                  {formatKeyTitle(String(key))}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getNotificationDescription(String(key), userType)}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(String(key))}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#2196F3] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          ))}
        </div>

        {saving && (
          <div className="mt-4 text-center text-blue-600 font-medium">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}

function getDummySettings(userType: string): NotificationSettings {
  if (userType === "doctor") {
    return {
      appointment_reminders: true,
      patient_messages: true,
      session_confirmations: true,
      schedule_changes: true,
      emergency_alerts: true,
      weekly_reports: false,
      marketing_emails: false,
    };
  }

  return {
    session_alerts: true,
    reschedule_cancel: true,
    doctor_updates: true,
    platform_updates: false,
  };
}

function formatKeyTitle(key: string): string {
  const map: Record<string, string> = {
    session_alerts: "Session Alerts",
    reschedule_cancel: "Reschedule / Cancel Session",
    doctor_updates: "Doctor Updates",
    platform_updates: "Platform Updates",
  };
  return map[key] || key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getNotificationDescription(key: string, userType: string): string {
  const doctorDescriptions: Record<string, string> = {
    appointment_reminders: "Get reminders about upcoming patient appointments",
    patient_messages: "Notifications for new messages from patients",
    session_confirmations: "Confirmations when patients book or cancel sessions",
    schedule_changes: "Alerts when there are changes to your schedule",
    emergency_alerts: "Critical alerts for urgent patient matters",
    weekly_reports: "Receive weekly patient progress reports",
    marketing_emails: "Receive promotional emails and platform updates",
  };

  const patientDescriptions: Record<string, string> = {
    session_alerts: "Receive reminders for upcoming sessions",
    reschedule_cancel: "Get notified if a session reschedule or canceled",
    doctor_updates: "Alert for request approval.",
    platform_updates: "Stay informed about new features and system updates.",
  };

  return userType === "doctor"
    ? doctorDescriptions[key] || ""
    : patientDescriptions[key] || "";
}
