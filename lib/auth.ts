interface AuthResponse {
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}

export const checkAuth = async (): Promise<AuthResponse> => {
  const sessionKey = (localStorage.getItem("session_key") || "").trim();
  if (!sessionKey) return { isAuthenticated: false, error: "No session key found" };

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
  if (!isBackendConnected) {
    const userData = localStorage.getItem("user_data");
    return userData
      ? { isAuthenticated: true, user: JSON.parse(userData) }
      : { isAuthenticated: false, error: "No user data found" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/user/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${sessionKey}`,
      },
    });

    if (res.ok) {
      const userData = await res.json();
      return { isAuthenticated: true, user: userData };
    }
    if (res.status === 401) return { isAuthenticated: false, error: "Unauthorized access" };
    return { isAuthenticated: false, error: `Authentication failed (${res.status})` };
  } catch (e) {
    console.error("Auth check failed:", e);
    return { isAuthenticated: false, error: "Network error" };
  }
};

export const redirectToLogin = () => {
  localStorage.removeItem("session_key");
  localStorage.removeItem("user_data");
  sessionStorage.removeItem("hasReloaded");
  window.location.href = "/login";
};
