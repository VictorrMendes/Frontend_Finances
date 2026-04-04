"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, ArrowLeft, Loader2, Wallet, TrendingUp, Landmark, ArrowUpRight, CircleDollarSign } from "lucide-react";

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
    setLoading(true); setErro(""); setSucesso("");

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
          setErro("Credenciais inválidas. Tente novamente.");
        }
      } 
      else if (view === "register") {
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (resposta.ok) {
          setSucesso("Conta bancária virtual criada! Acesse agora.");
          changeView("login");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Erro ao processar registro.");
        }
      }
      else if (view === "forgot_password") {
        const resposta = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resposta.ok) {
          setSucesso("Verifique sua caixa de entrada para redefinir.");
          setTimeout(() => changeView("login"), 4000);
        } else {
          setErro("E-mail não encontrado em nossa base.");
        }
      }
    } catch (error) {
      setErro("Sem conexão com o servidor financeiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#020617] overflow-x-hidden font-sans px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Background */}
      <div className="fixed top-[-20%] left-[-20%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-[60px] sm:blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-20%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-blue-600/10 rounded-full blur-[60px] sm:blur-[120px] pointer-events-none"></div>
      
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">
        
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/5 p-5 sm:p-8 lg:p-10 rounded-3xl shadow-2xl shadow-black/40">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 rotate-3">
              <Landmark className="text-slate-900" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Finance<span className="text-emerald-400">VM</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-center">
              Gestão de Ativos Inteligente
            </p>
          </div>

          {/* Mensagens */}
          {(erro || sucesso) && (
            <div className={`border-l-4 px-3 py-2 rounded-r-lg text-xs font-semibold mb-4 ${
              erro ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            }`}>
              {erro || sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Identificação</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 text-sm"
                    placeholder="USUÁRIO"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                  <input
                    type="email" required
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 text-sm"
                    placeholder="EMAIL@EXEMPLO.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                  {view === "login" && (
                    <button type="button" onClick={() => changeView("forgot_password")} className="text-[10px] font-bold text-emerald-500 hover:text-white">
                      ESQUECEU?
                    </button>
                  )}
                </div>
                <input
                  type="password" required
                  className="w-full px-5 py-3 sm:py-3.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 text-sm tracking-widest"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 sm:py-3.5 rounded-xl font-bold uppercase tracking-wide hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>
                    {view === "login" ? "Acessar Carteira" : 
                     view === "register" ? "Abrir Conta" : "Recuperar Acesso"}
                  </span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-3">
            {view === "login" ? (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center">
                Não é cliente? <button type="button" onClick={() => changeView("register")} className="text-emerald-500 hover:text-white ml-1 underline">Criar Conta</button>
              </p>
            ) : (
              <button type="button" onClick={() => changeView("login")} className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6 text-slate-600">
           <div className="flex items-center gap-2">
             <TrendingUp size={14} />
             <span className="text-[9px] font-bold uppercase">Market Up</span>
           </div>
           <div className="flex items-center gap-2">
             <Wallet size={14} />
             <span className="text-[9px] font-bold uppercase">Safe Assets</span>
           </div>
           <div className="flex items-center gap-2">
             <CircleDollarSign size={14} />
             <span className="text-[9px] font-bold uppercase">Liquidity</span>
           </div>
        </div>
      </div>
    </div>
  );
}