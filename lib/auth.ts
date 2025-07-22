interface AuthResponse {
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}

export const checkAuth = async (): Promise<AuthResponse> => {
  const sessionKey = localStorage.getItem("session_key");
  
  if (!sessionKey) {
    return { isAuthenticated: false, error: "No session key found" };
  }

  const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";
  
  if (!isBackendConnected) {
    // For development/testing when backend is not connected
    const userData = localStorage.getItem("user_data");
    if (userData) {
      return { isAuthenticated: true, user: JSON.parse(userData) };
    }
    return { isAuthenticated: false, error: "No user data found" };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/data/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${sessionKey}`,
        },
      }
    );

    if (response.ok) {
      const userData = await response.json();
      return { isAuthenticated: true, user: userData };
    } else if (response.status === 401) {
      return { isAuthenticated: false, error: "Unauthorized access" };
    } else {
      return { isAuthenticated: false, error: "Authentication failed" };
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    return { isAuthenticated: false, error: "Network error" };
  }
};

export const redirectToLogin = () => {
  localStorage.removeItem("session_key");
  localStorage.removeItem("user_data");
  sessionStorage.removeItem("hasReloaded");
  window.location.href = "/login";
};
