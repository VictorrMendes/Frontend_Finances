export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_URL = "https://victorrmendes.pythonanywhere.com";
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: "include", // <--- ISSO DEVE ESTAR EM TODAS AS CHAMADAS
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Tenta o refresh também com credentials: "include"
    const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      return fetch(url, { ...options, credentials: "include" });
    }
    // Se falhar, limpa e desloga
    localStorage.clear();
    window.location.href = "/login";
  }

  return response;
}