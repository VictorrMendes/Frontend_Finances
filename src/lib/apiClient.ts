// src/lib/apiClient.ts
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_URL = "https://victorrmendes.pythonanywhere.com";
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // <--- ESSENCIAL PARA MANDAR O COOKIE
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Tenta renovar o token silenciosamente
    const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Se renovou, tenta a chamada original MAIS UMA VEZ
      return fetch(`${API_URL}${endpoint}`, { ...options, credentials: "include" });
    } else {
      // SÓ DESLOGA SE O REFRESH REALMENTE FALHAR
      localStorage.removeItem("is_logged");
      window.location.href = "/login";
    }
  }

  return response;
}