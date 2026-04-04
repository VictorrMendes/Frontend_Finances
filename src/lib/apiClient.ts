// src/lib/apiClient.ts
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_URL = "https://victorrmendes.pythonanywhere.com";
  
  if (!localStorage.getItem("is_logged") && endpoint !== "/api/token/") {
    return new Response(JSON.stringify({ error: "Sessão encerrada" }), { status: 401 });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (window.location.pathname === "/login") return response;

    try {
      const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        return await fetch(`${API_URL}${endpoint}`, { ...options, credentials: "include" });
      } else {
        localStorage.clear();
        if (window.location.pathname !== "/login") {
          window.location.replace("/login"); 
        }
      }
    } catch (e) {
      console.error("Erro crítico na rede de autenticação.");
      return response;
    }
  }

  return response;
}