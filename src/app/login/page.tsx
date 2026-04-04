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
          setSucesso("Conta criada com sucesso! Realize o acesso.");
          changeView("login");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Falha ao criar conta.");
        }
      }
      else if (view === "forgot_password") {
        const resposta = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resposta.ok) {
          setSucesso("Instruções enviadas para o seu e-mail.");
          setTimeout(() => changeView("login"), 4000);
        } else {
          setErro("Erro ao processar solicitação de recuperação.");
        }
      }
    } catch (error) {
      setErro("Falha na conexão com o servidor central.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removido overflow-hidden e adicionado overflow-y-auto para permitir scroll no mobile quando o teclado abrir
    <div className="fixed inset-0 z-[100] w-full h-full flex flex-col items-center justify-start sm:justify-center bg-[#020617] overflow-y-auto font-sans p-4">
      
      {/* 🔮 Efeitos de Fundo (Fixos para não quebrarem no scroll) */}
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-900/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-900/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse delay-700 pointer-events-none"></div>
      
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      {/* Wrapper do Card: Adicionado margem superior e inferior para mobile */}
      <div className="relative z-10 w-full max-w-[450px] my-auto">
        {/* Card Principal: Ajuste de padding p-6 (mobile) para p-8 (desktop) */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-500/10">
          
          {/* Cabeçalho */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/40 mb-4 sm:mb-6">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-2 italic">
              FINANCE<span className="text-blue-400">VM</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">
              {view === "login" && "Acesso Seguro ao Sistema"}
              {view === "register" && "Inicializar Novo Perfil"}
              {view === "forgot_password" && "Protocolo de Recuperação"}
            </p>
          </div>

          {/* Alertas */}
          {(erro || sucesso) && (
            <div className={`border px-4 py-3 rounded-xl text-[11px] font-bold mb-6 text-center animate-in fade-in slide-in-from-top-1 ${
              erro ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
            }`}>
              {erro || sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Input de Usuário */}
            {(view === "login" || view === "register") && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text" required
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="USUÁRIO"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {/* Input de E-mail */}
            {(view === "register" || view === "forgot_password") && (
              <div className="relative group animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email" required
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="E-MAIL"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Input de Senha */}
            {(view === "login" || view === "register") && (
              <div className="space-y-2 group">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                    placeholder="SENHA"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {view === "login" && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => changeView("forgot_password")} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
                      Esqueceu a senha?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-xs"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>
                    {view === "login" ? "Entrar no Sistema" : 
                     view === "register" ? "Confirmar Cadastro" : "Enviar Recuperação"}
                  </span>
                  <Zap size={16} fill="white" />
                </>
              )}
            </button>
          </form>

          {/* Links de Rodapé */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
            {view === "login" ? (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                Novo por aqui? <button type="button" onClick={() => changeView("register")} className="text-blue-400 hover:text-white ml-1 transition-colors">Cadastre-se</button>
              </p>
            ) : (
              <button type="button" onClick={() => changeView("login")} className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                <ArrowLeft size={14} /> Voltar para o Início
              </button>
            )}
          </div>
        </div>

        {/* Ícones Decorativos - Ocultos em telas muito pequenas para limpar o visual */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-6 sm:gap-8 text-slate-700">
           <Cpu size={18} className="hover:text-blue-500 transition-colors cursor-help" />
           <Globe size={18} className="hover:text-blue-500 transition-colors cursor-help" />
           <ShieldCheck size={18} className="hover:text-blue-500 transition-colors cursor-help" />
        </div>
      </div>
    </div>
  );
}