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
    // Alterado para min-h-screen e overflow-y-auto para permitir scroll no mobile
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] overflow-y-auto font-sans p-4 sm:p-6 lg:p-8">
      
      {/* 🟢 Efeitos de Background (Ajustados para não quebrarem o layout) */}
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        
        {/* Card Principal */}
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/50">
          
          {/* Logo e Branding */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
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

          {/* Mensagens de Sistema */}
          {(erro || sucesso) && (
            <div className={`border-l-4 px-4 py-3 rounded-r-xl text-[11px] font-bold mb-6 animate-in fade-in slide-in-from-top-2 ${
              erro ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            }`}>
              {erro || sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            
            {/* Campo Usuário */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm"
                    placeholder="USUÁRIO"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Campo E-mail */}
            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm"
                    placeholder="EMAIL@EXEMPLO.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Campo Senha */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                  {view === "login" && (
                    <button type="button" onClick={() => changeView("forgot_password")} className="text-[10px] font-bold text-emerald-500 hover:text-white transition-colors">
                      ESQUECEU?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <input
                    type="password" required
                    className="w-full px-6 py-3.5 sm:py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm tracking-widest"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Botão Principal */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 sm:py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-3 text-xs sm:text-sm"
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

          {/* Links de Rodapé */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            {view === "login" ? (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center">
                Não é cliente? <button type="button" onClick={() => changeView("register")} className="text-emerald-500 hover:text-white ml-1 transition-colors underline underline-offset-4">Criar Conta</button>
              </p>
            ) : (
              <button type="button" onClick={() => changeView("login")} className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                <ArrowLeft size={14} /> Voltar para o login
              </button>
            )}
          </div>
        </div>

        {/* Rodapé Decorativo (Ajustado para flex-wrap no mobile) */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-10 text-slate-700">
           <div className="flex items-center gap-2">
             <TrendingUp size={14} />
             <span className="text-[9px] font-bold uppercase tracking-tighter">Market Up</span>
           </div>
           <div className="flex items-center gap-2">
             <Wallet size={14} />
             <span className="text-[9px] font-bold uppercase tracking-tighter">Safe Assets</span>
           </div>
           <div className="flex items-center gap-2">
             <CircleDollarSign size={14} />
             <span className="text-[9px] font-bold uppercase tracking-tighter">Liquidity</span>
           </div>
        </div>
      </div>
    </div>
  );
}