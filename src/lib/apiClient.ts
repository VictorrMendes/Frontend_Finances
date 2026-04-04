// src/lib/apiClient.ts
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const API_URL = "https://victorrmendes.pythonanywhere.com";
  
  // 1. Bloqueia requisições se não houver flag de login (evita loops de 401 no background)
  if (!localStorage.getItem("is_logged") && endpoint !== "/api/token/") {
    return new Response(JSON.stringify({ error: "Sessão encerrada" }), { status: 401 });
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Importante para os cookies do Django
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Se falhar dentro da tela de login, não tenta refresh para não travar a UI
    if (window.location.pathname === "/login") return response;

    try {
      const refreshRes = await fetch(`${API_URL}/api/token/refresh/`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Se o refresh funcionou, repete a chamada original
        return await fetch(`${API_URL}${endpoint}`, { ...options, credentials: "include" });
      } else {
        // Se o refresh falhou, limpa tudo e manda pro login de forma limpa
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