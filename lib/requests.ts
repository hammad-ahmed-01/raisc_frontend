// lib/requests.ts
export async function sendDoctorRequest(doctorId: number, message: string) {
  const token = localStorage.getItem("session_key") || localStorage.getItem("authToken") || "";
  const res = await fetch(`/api/doctors/${doctorId}/request/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || "Failed to send request");
  }
  return res.json();
}
