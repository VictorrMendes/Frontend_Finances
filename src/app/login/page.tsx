"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, ArrowLeft, Loader2, Wallet, TrendingUp, Landmark, ArrowUpRight, CircleDollarSign, Lock } from "lucide-react";

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

  // Mata qualquer loop de browser-sync que tenha ficado no cache do navegador
  useEffect(() => {
    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
  }, []);

  const changeView = (newView: ViewState) => {
    setView(newView); setErro(""); setSucesso(""); setPassword("");
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
        } else { setErro("Credenciais inválidas."); }
      } 
      else if (view === "register") {
        const res = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        if (res.ok) { setSucesso("Conta criada!"); changeView("login"); }
        else { setErro("Erro no registro."); }
      }
      else if (view === "forgot_password") {
        const res = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) { setSucesso("Verifique seu e-mail."); setTimeout(() => changeView("login"), 4000); }
        else { setErro("E-mail não encontrado."); }
      }
    } catch (err) { setErro("Erro de conexão."); } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[460px] px-4 py-8">
      {/* Brilhos de fundo suaves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-emerald-500/20">
            <Landmark className="text-slate-900" size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter uppercase">Finance<span className="text-emerald-400">VM</span></h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-black text-center">Private Banking & Assets</p>
        </div>

        {(erro || sucesso) && (
          <div className={`border-l-4 px-4 py-3 rounded-r-xl text-[11px] font-bold mb-6 ${erro ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"}`}>
            {erro || sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {(view === "login" || view === "register") && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50" placeholder="ID DE ACESSO" />
              </div>
            </div>
          )}

          {(view === "register" || view === "forgot_password") && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/50" placeholder="CLIENTE@EMAIL.COM" />
              </div>
            </div>
          )}

          {(view === "login" || view === "register") && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha</label>
                {view === "login" && <button type="button" onClick={() => changeView("forgot_password")} className="text-[10px] font-black text-emerald-500 hover:text-white transition-colors">Esqueceu?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm tracking-[0.3em] focus:outline-none focus:border-emerald-500/50" placeholder="••••••••" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Continuar</span><ArrowUpRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] font-bold uppercase tracking-widest">
          {view === "login" ? (
            <button onClick={() => changeView("register")} className="text-slate-500 hover:text-emerald-400 transition-colors">Ainda não é cliente? Cadastre-se</button>
          ) : (
            <button onClick={() => changeView("login")} className="text-slate-400 flex items-center justify-center gap-2 mx-auto"><ArrowLeft size={14} /> Voltar ao Login</button>
          )}
        </div>
      </div>
    </div>
  );
}