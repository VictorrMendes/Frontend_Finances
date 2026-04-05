"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, ArrowLeft, Loader2, Wallet, 
  TrendingUp, Landmark, ArrowUpRight, 
  CircleDollarSign, Lock 
} from "lucide-react";

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

  // 🛡️ MATA O LOOP DE ERRO: Limpa o cache de ferramentas de dev do navegador que travam a tela
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
      // Tenta forçar a parada de scripts residuais de browser-sync
      (window as any).___browserSync___ = null;
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
          setErro("Acesso negado. Credenciais inválidas.");
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
    // min-h-screen e bg-[#020617] garantem que o fundo escuro cubra 100% da tela
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] font-sans p-4 relative overflow-x-hidden">
      
      {/* 🟢 EFEITOS DE GLOW (Fundo Tecnológico) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[460px] py-8">
        
        {/* CARD ESTILO PRIVATE BANK */}
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl">
          
          {/* HEADER / LOGO */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-emerald-500/20">
              <Landmark className="text-slate-900" size={30} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter uppercase">
              Finance<span className="text-emerald-400">VM</span>
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-black">
              Private Banking & Assets
            </p>
          </div>

          {/* ALERTAS */}
          {(erro || sucesso) && (
            <div className={`border-l-4 px-4 py-3 rounded-r-xl text-[11px] font-bold mb-6 animate-in fade-in slide-in-from-top-2 ${
              erro ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            }`}>
              {erro || sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* CAMPO USUÁRIO */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-800"
                    placeholder="ID DE ACESSO"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CAMPO E-MAIL */}
            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-800"
                    placeholder="CLIENTE@EMAIL.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CAMPO SENHA + LINK ESQUECI */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                  {view === "login" && (
                    <button 
                      type="button" 
                      onClick={() => changeView("forgot_password")}
                      className="text-[10px] font-black text-emerald-500 hover:text-white transition-colors"
                    >
                      ESQUECEU?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="password" required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm tracking-[0.3em] focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-800"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>
                    {view === "login" ? "Acessar Carteira" : view === "register" ? "Abrir Conta" : "Protocolo de Recuperação"}
                  </span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* RODAPÉ DO CARD / ALTERNÂNCIA */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            {view === "login" ? (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Ainda não é cliente? 
                <button onClick={() => changeView("register")} className="text-emerald-400 underline underline-offset-4 ml-2 hover:text-white transition-colors">Cadastre-se</button>
              </p>
            ) : (
              <button onClick={() => changeView("login")} className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-white transition-all">
                <ArrowLeft size={14} /> Voltar para o login
              </button>
            )}
          </div>
        </div>

        {/* INDICADORES DE MERCADO (DECORATIVO) */}
        <div className="mt-8 flex justify-center gap-6 text-slate-700 opacity-40 flex-wrap">
          <div className="flex items-center gap-2"><TrendingUp size={14} /><span className="text-[9px] font-bold uppercase">Markets</span></div>
          <div className="flex items-center gap-2"><Wallet size={14} /><span className="text-[9px] font-bold uppercase">Assets</span></div>
          <div className="flex items-center gap-2"><CircleDollarSign size={14} /><span className="text-[9px] font-bold uppercase">Secure</span></div>
        </div>
      </div>
    </div>
  );
}