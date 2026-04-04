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
    <div className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center bg-[#020617] overflow-y-auto font-sans px-3 sm:px-4">

      {/* Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 rounded-3xl shadow-2xl shadow-blue-500/10">

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg mb-5">
              <ShieldCheck className="text-white" size={28} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white italic">
              FINANCE<span className="text-blue-400">VM</span>
            </h1>

            <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-2">
              {view === "login" && "Acesso Seguro ao Sistema"}
              {view === "register" && "Inicializar Novo Perfil"}
              {view === "forgot_password" && "Protocolo de Recuperação"}
            </p>
          </div>

          {/* Alerts */}
          {erro && (
            <div className="text-red-400 text-xs text-center mb-4">{erro}</div>
          )}
          {sucesso && (
            <div className="text-emerald-400 text-xs text-center mb-4">{sucesso}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {(view === "login" || view === "register") && (
              <input
                type="text"
                required
                className="w-full p-3 sm:p-4 rounded-xl bg-white/5 text-white text-sm sm:text-base"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            {(view === "register" || view === "forgot_password") && (
              <input
                type="email"
                required
                className="w-full p-3 sm:p-4 rounded-xl bg-white/5 text-white text-sm sm:text-base"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            {(view === "login" || view === "register") && (
              <input
                type="password"
                required
                className="w-full p-3 sm:p-4 rounded-xl bg-white/5 text-white text-sm sm:text-base"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-blue-600 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {view === "login" ? (
              <button onClick={() => changeView("register")}>Criar conta</button>
            ) : (
              <button onClick={() => changeView("login")}>Voltar</button>
            )}
          </div>

        </div>

        <div className="mt-6 flex justify-center gap-6 text-slate-600">
          <Cpu size={18} />
          <Globe size={18} />
          <ShieldCheck size={18} />
        </div>

      </div>
    </div>
  );
}