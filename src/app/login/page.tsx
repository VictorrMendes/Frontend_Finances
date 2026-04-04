"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Mail, ArrowLeft, Loader2, Cpu, Globe, ShieldCheck, Zap } from "lucide-react";

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
          setErro("Acesso negado. Verifique suas credenciais.");
        }
      } 
      else if (view === "register") {
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (resposta.ok) {
          setSucesso("Protocolo de registro concluído. Faça login.");
          changeView("login");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Falha na criação do perfil.");
        }
      }
      else if (view === "forgot_password") {
        const resposta = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resposta.ok) {
          setSucesso("Link de redefinição enviado para o terminal de e-mail.");
          setTimeout(() => changeView("login"), 4000);
        } else {
          setErro("Erro ao processar solicitação de recuperação.");
        }
      }
    } catch (error) {
      setErro("Falha na conexão com a rede central.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full max-w-[450px] p-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl shadow-blue-500/10">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/40 mb-6">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2 italic">
              FINANCE<span className="text-blue-400">VM</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
              {view === "login" && "Secure Data Access"}
              {view === "register" && "Initialize Profile"}
              {view === "forgot_password" && "Reset Protocol"}
            </p>
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold mb-6 text-center">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl text-xs font-bold mb-6 text-center">
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {(view === "login" || view === "register") && (
              <div className="group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    placeholder="USERNAME"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "register" || view === "forgot_password") && (
              <div className="group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    placeholder="EMAIL ADDRESS"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "login" || view === "register") && (
              <div className="group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    placeholder="PASSWORD"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {view === "login" && (
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => changeView("forgot_password")} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>
                    {view === "login" ? "Authorize Login" : 
                     view === "register" ? "Confirm Registration" : "Send Recovery"}
                  </span>
                  <Zap size={16} fill="white" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-4">
            {view === "login" ? (
              <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">
                Novo Agente? <button type="button" onClick={() => changeView("register")} className="text-blue-400 hover:text-white ml-1 transition-colors">Cadastre-se</button>
              </p>
            ) : (
              <button type="button" onClick={() => changeView("login")} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                <ArrowLeft size={14} /> Back to Auth
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-slate-700">
           <Cpu size={20} />
           <Globe size={20} />
           <ShieldCheck size={20} />
        </div>
      </div>
    </div>
  );
}

