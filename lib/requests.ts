// lib/requests.ts
export async function sendDoctorRequest(doctorId: number, message: string) {
  const token = localStorage.getItem("authToken"); // or however you store it
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
    throw new Error(err?.detail || "Failed to send request");
  }
  return res.json();
}
