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

  // Otimizado: Só limpa se houver erro persistente, sem bloquear o render inicial
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Impede que o browser-sync local trave a thread principal
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
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      // Criamos um controller para dar timeout se a rede estiver em loop (15 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let endpoint = "/api/token/";
      let body = JSON.stringify({ username, password });

      if (view === "register") {
        endpoint = "/api/usuarios/registrar/";
        body = JSON.stringify({ username, email, password });
      } else if (view === "forgot_password") {
        endpoint = "/api/usuarios/recuperar-senha/";
        body = JSON.stringify({ email });
      }

      const resposta = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        credentials: "include",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resposta.ok) {
        if (view === "login") {
          localStorage.setItem("username", username);
          localStorage.setItem("is_logged", "true");
          router.push("/");
          router.refresh(); // Força o Next.js a atualizar o estado do layout
        } else {
          setSucesso(view === "register" ? "Conta criada! Acesse agora." : "Verifique seu e-mail.");
          if (view === "register") changeView("login");
        }
      } else {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.detail || "Falha na operação. Verifique os dados.");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setErro("O servidor demorou muito para responder. Tente novamente.");
      } else {
        setErro("Erro de conexão com o banco de dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] font-sans p-4 relative overflow-hidden">
      
      {/* BACKGROUND (Otimizado sem blur pesado no mobile) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/5 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <Landmark className="text-slate-950" size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter uppercase">
              Finance<span className="text-emerald-400">VM</span>
            </h1>
            <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] mt-1 font-bold">Sua gestão pessoal</p>
          </div>

          {erro && <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 rounded-r-lg text-[10px] font-bold mb-6">{erro}</div>}
          {sucesso && <div className="bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400 p-3 rounded-r-lg text-[10px] font-bold mb-6">{sucesso}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(view === "login" || view === "register") && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="ID de Acesso" />
                </div>
              </div>
            )}

            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="email@exemplo.com" />
                </div>
              </div>
            )}

            {(view === "login" || view === "register") && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                  {view === "login" && <button type="button" onClick={() => changeView("forgot_password")} className="text-[9px] font-bold text-emerald-500">Esqueceu?</button>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <span>{view === "login" ? "Entrar" : view === "register" ? "Criar" : "Recuperar"}</span>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            {view === "login" ? (
              <button onClick={() => changeView("register")} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Não é cliente? <span className="text-emerald-500 underline">Cadastre-se</span></button>
            ) : (
              <button onClick={() => changeView("login")} className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"><ArrowLeft size={12} /> Voltar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}