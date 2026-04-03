const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Já não pegamos nada do localStorage!

  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // <--- ESSENCIAL: Envia os cookies automaticamente
  });

  // Se o servidor retornar 401, o token no cookie expirou
  if (response.status === 401) {
    // Chamamos a rota de refresh (que o Django também deve processar via cookie)
    const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // O backend já terá enviado novos cookies no refreshRes, basta refazer a original
      return fetch(url, { ...options, headers, credentials: "include" });
    } else {
      // Se falhar o refresh, limpa dados de interface e vai pro login
      localStorage.removeItem("username"); 
      window.location.href = "/login";
    }
  }

  return response;
}