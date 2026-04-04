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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden font-sans px-4">
      
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-20%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
        </div>
      </div>

      {/* Container central */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/5 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/40">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
              <Landmark className="text-slate-900" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Finance<span className="text-emerald-400">VM</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 text-center">
              Gestão de Ativos Inteligente
            </p>
          </div>

          {(erro || sucesso) && (
            <div className={`border-l-4 px-3 py-2 rounded-r-lg text-xs font-semibold mb-4 ${
              erro ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            }`}>
              {erro || sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {(view === "login" || view === "register") && (
              <div>
                <label className="text-xs text-slate-400">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text" required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Usuário"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "register" || view === "forgot_password") && (
              <div>
                <label className="text-xs text-slate-400">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email" required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(view === "login" || view === "register") && (
              <div>
                <div className="flex justify-between">
                  <label className="text-xs text-slate-400">Senha</label>
                  {view === "login" && (
                    <button type="button" onClick={() => changeView("forgot_password")} className="text-xs text-emerald-400">
                      Esqueceu?
                    </button>
                  )}
                </div>
                <input
                  type="password" required
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-3 rounded-xl font-bold flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {view === "login" ? (
              <p className="text-slate-400 text-sm">
                Não tem conta?{" "}
                <button onClick={() => changeView("register")} className="text-emerald-400">
                  Criar
                </button>
              </p>
            ) : (
              <button onClick={() => changeView("login")} className="text-slate-400 text-sm flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Voltar
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-slate-600 text-xs">
          <div className="flex items-center gap-1"><TrendingUp size={14}/>Market</div>
          <div className="flex items-center gap-1"><Wallet size={14}/>Assets</div>
          <div className="flex items-center gap-1"><CircleDollarSign size={14}/>Liquidity</div>
        </div>
      </div>
    </div>
  );
}