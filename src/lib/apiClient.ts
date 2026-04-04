// src/lib/apiClient.ts
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_URL = "https://victorrmendes.pythonanywhere.com";
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Se já estivermos no login, não fazemos nada para evitar loop
    if (window.location.pathname === "/login") {
      return response;
    }

    const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      return fetch(`${API_URL}${endpoint}`, { ...options, credentials: "include" });
    } else {
      localStorage.removeItem("is_logged");
      localStorage.removeItem("username");
      // Só redireciona se não estiver no login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}