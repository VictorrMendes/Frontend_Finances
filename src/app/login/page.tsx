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
    <div className="fixed inset-0 z-[999] w-full h-full flex items-center justify-center bg-[#020617] overflow-y-auto font-sans px-3 sm:px-4">

      {/* BACKGROUND */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 w-full max-w-md sm:max-w-lg">

        {/* CARD */}
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-5 sm:p-8 lg:p-12 rounded-3xl shadow-2xl">

          {/* HEADER */}
          <div className="flex flex-col items-center mb-8 sm:mb-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4">
              <Landmark className="text-slate-900" size={28} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Finance<span className="text-emerald-400">VM</span>
            </h1>

            <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest mt-2">
              Gestão de Ativos Inteligente
            </p>
          </div>

          {/* ALERTAS */}
          {erro && <div className="text-red-400 text-xs mb-4">{erro}</div>}
          {sucesso && <div className="text-emerald-400 text-xs mb-4">{sucesso}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

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
              className="w-full py-3 sm:py-4 bg-emerald-500 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
            </button>

          </form>

          {/* LINKS */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {view === "login" ? (
              <button onClick={() => changeView("register")}>Criar conta</button>
            ) : (
              <button onClick={() => changeView("login")}>Voltar</button>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-center gap-6 sm:gap-10 text-slate-700 flex-wrap">
          <TrendingUp size={16} />
          <Wallet size={16} />
          <CircleDollarSign size={16} />
        </div>

      </div>
    </div>
  );
}