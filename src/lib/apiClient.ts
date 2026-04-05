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

  // Se o servidor retornar 401 (não autorizado)
  if (response.status === 401 && !endpoint.includes("/api/token/")) {
    // Tenta UMA vez o refresh
    const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Se o refresh deu certo, repete a chamada original
      return fetch(`${API_URL}${endpoint}`, { ...options, credentials: "include" });
    } else {
      // Se falhou, desloga e redireciona imediatamente sem esperar
      localStorage.removeItem("is_logged");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}