"use client";
import { useState, useEffect } from "react";

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

type NotificationSettings = DoctorNotificationSettings | PatientNotificationSettings;

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [userType, setUserType] = useState<string>("doctor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

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

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto h-fit">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Notifications</h1>

        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div>
                <h3 className="font-medium text-gray-800">
                  {formatKeyTitle(key)}
                </h3>
                <p className="text-sm text-gray-600">
                  {getNotificationDescription(key, userType)}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(key)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        {saving && (
          <div className="mt-4 text-center text-blue-600">
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
  return key
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
    reschedule_cancel: "Get notified if a session is rescheduled or canceled",
    doctor_updates: "Alert for request approval",
    platform_updates: "Stay informed about new features and system updates",
  };

  return userType === "patient"
    ? doctorDescriptions[key] || ""
    : patientDescriptions[key] || "";
}
