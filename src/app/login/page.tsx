"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, UserPlus, Mail, KeyRound, ArrowLeft } from "lucide-react";

type ViewState = "login" | "register" | "forgot_password";

export default function LoginPage() {
  const [view, setView] = useState<ViewState>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

  const changeView = (newView: ViewState) => {
    setView(newView);
    setErro("");
    setSucesso("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      if (view === "login") {
        const resposta = await fetch(`${API_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        });

        if (resposta.ok) {
          localStorage.setItem("username", username);
          localStorage.setItem("is_logged", "true");
          router.push("/"); 
        } else {
          setErro("Usuário ou senha incorretos.");
        }
      } 
      
      else if (view === "register") {
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (resposta.ok) {
          setSucesso("Conta criada com sucesso! Faça login.");
          changeView("login");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Erro ao criar conta.");
        }
      }

      else if (view === "forgot_password") {
        // Chamada para a nova rota do Django
        const resposta = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resposta.ok) {
          setSucesso("Se o e-mail estiver correto, você receberá um link em instantes.");
          setTimeout(() => changeView("login"), 4000);
        } else {
          setErro("Ocorreu um erro ao processar sua solicitação.");
        }
      }

    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {view === "login" && <Lock size={32} />}
            {view === "register" && <UserPlus size={32} />}
            {view === "forgot_password" && <KeyRound size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {view === "login" && "Bem-vindo de volta"}
            {view === "register" && "Crie sua conta"}
            {view === "forgot_password" && "Recuperar Senha"}
          </h1>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center border border-red-100">{erro}</div>}
        {sucesso && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-6 text-center border border-emerald-100">{sucesso}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(view === "login" || view === "register") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text" required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {(view === "register" || view === "forgot_password") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email" required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}

          {(view === "login" || view === "register") && (
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                {view === "login" && (
                  <button type="button" onClick={() => changeView("forgot_password")} className="text-xs text-blue-600 font-semibold hover:underline">
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password" required
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processando..." : (
              view === "login" ? "Entrar" : 
              view === "register" ? "Criar Conta" : "Enviar E-mail"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500 flex flex-col gap-3">
          {view === "login" ? (
            <p>Não tem conta? <button onClick={() => changeView("register")} className="text-blue-600 font-bold">Cadastre-se</button></p>
          ) : (
            <button onClick={() => changeView("login")} className="text-slate-600 font-semibold flex items-center justify-center gap-1 mx-auto">
              <ArrowLeft size={16} /> Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}