"use client";
import { useState, useEffect } from "react";

interface NotificationSettings {
  appointment_reminders: boolean;
  patient_messages: boolean;
  session_confirmations: boolean;
  schedule_changes: boolean;
  emergency_alerts: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    appointment_reminders: true,
    patient_messages: true,
    session_confirmations: true,
    schedule_changes: true,
    emergency_alerts: true,
    weekly_reports: false,
    marketing_emails: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (isBackendConnected) {
        try {
          const sessionKey = localStorage.getItem("session_key");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/notifications/`,
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
      }
      setLoading(false);
    };

    fetchNotificationSettings();
  }, [isBackendConnected]);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);

    if (isBackendConnected) {
      setSaving(true);
      try {
        const sessionKey = localStorage.getItem("session_key");
        await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/notifications/`,
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

  if (loading) {
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
                  {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <p className="text-sm text-gray-600">
                  {getNotificationDescription(key)}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(key as keyof NotificationSettings)}
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

function getNotificationDescription(key: string): string {
  const descriptions: Record<string, string> = {
    appointment_reminders: "Get reminders about upcoming patient appointments",
    patient_messages: "Notifications for new messages from patients",
    session_confirmations: "Confirmations when patients book or cancel sessions",
    schedule_changes: "Alerts when there are changes to your schedule",
    emergency_alerts: "Critical alerts for urgent patient matters",
    weekly_reports: "Receive weekly patient progress reports",
    marketing_emails: "Receive promotional emails and platform updates",
  };

  return descriptions[key] || "";
}
