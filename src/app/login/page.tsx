"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, ArrowLeft, Loader2, Landmark, ArrowUpRight, TrendingUp, Wallet, CircleDollarSign, Lock } from "lucide-react";

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
  const API_URL = "https://victorrmendes.pythonanywhere.com";

  // Limpa possíveis travas de cache ou Service Workers antigos ao carregar a página
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
  }, []);

  const changeView = (newView: ViewState) => {
    setView(newView);
    setErro("");
    setSucesso("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro(""); setSucesso("");

    try {
      if (view === "login") {
        const res = await fetch(`${API_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        });

        if (res.ok) {
          localStorage.setItem("username", username);
          localStorage.setItem("is_logged", "true");
          router.push("/"); 
        } else {
          setErro("Credenciais inválidas. Verifique seu usuário e senha.");
        }
      } 
      else if (view === "register") {
        const res = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        if (res.ok) {
          setSucesso("Conta virtual criada com sucesso! Acesse agora.");
          changeView("login");
        } else {
          const dados = await res.json();
          setErro(dados.username ? dados.username[0] : "Erro ao processar registro.");
        }
      } 
      else if (view === "forgot_password") {
        const res = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setSucesso("Protocolo enviado! Verifique seu e-mail.");
          setTimeout(() => changeView("login"), 5000);
        } else {
          setErro("E-mail não localizado em nossa base de ativos.");
        }
      }
    } catch (err) {
      setErro("Falha na comunicação com o servidor financeiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] overflow-y-auto font-sans p-4">
      
      {/* EFEITOS DE FUNDO (GLOWS) */}
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[460px] py-8">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-black/50">
          
          {/* HEADER / LOGO */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-emerald-500/20">
              <Landmark className="text-slate-900" size={30} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter">
              FINANCE<span className="text-emerald-400">VM</span>
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-black">
              Private Banking & Assets
            </p>
          </div>

          {/* ALERTAS DE SISTEMA */}
          {erro && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-3 rounded-r-xl text-[11px] font-bold mb-6 animate-in fade-in slide-in-from-top-2">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-400 p-3 rounded-r-xl text-[11px] font-bold mb-6 animate-in fade-in slide-in-from-top-2">
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* CAMPO: USUÁRIO */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-700"
                    placeholder="ID DE ACESSO"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CAMPO: E-MAIL */}
            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-700"
                    placeholder="CLIENTE@EMAIL.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CAMPO: SENHA + ESQUECI MINHA SENHA */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                  {view === "login" && (
                    <button 
                      type="button" 
                      onClick={() => changeView("forgot_password")}
                      className="text-[10px] font-black text-emerald-500 hover:text-white transition-colors uppercase tracking-tighter"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="password" required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-white text-sm tracking-[0.3em] focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-700"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* BOTÃO PRINCIPAL */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>
                    {view === "login" ? "Acessar Carteira" : view === "register" ? "Abrir Conta" : "Enviar Protocolo"}
                  </span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* RODAPÉ DO CARD / ALTERNÂNCIA DE TELAS */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            {view === "login" ? (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Ainda não é cliente? 
                <button 
                  onClick={() => changeView("register")} 
                  className="text-emerald-400 underline underline-offset-4 ml-1.5 hover:text-white transition-colors"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <button 
                onClick={() => changeView("login")} 
                className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-white transition-all"
              >
                <ArrowLeft size={14} /> Voltar para o login
              </button>
            )}
          </div>
        </div>

        {/* INDICADORES DE MERCADO (DECORATIVO RESPONSIVO) */}
        <div className="mt-8 flex justify-center gap-6 text-slate-700 flex-wrap px-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Market High</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet size={14} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Secure Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign size={14} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Full Liquidity</span>
          </div>
        </div>
      </div>
    </div>
  );
}