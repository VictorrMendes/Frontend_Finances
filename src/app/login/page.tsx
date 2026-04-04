"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Mail, ArrowLeft, Loader2, Wallet, ShieldCheck, TrendingUp } from "lucide-react";

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
          setErro("Usuário ou senha incorretos.");
        }
      } 
      
      else if (view === "register") {
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (resposta.ok) {
          setSucesso("Conta criada com sucesso! Faça login.");
          changeView("login");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Erro ao criar conta.");
        }
      }

      else if (view === "forgot_password") {
        const resposta = await fetch(`${API_URL}/api/usuarios/recuperar-senha/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resposta.ok) {
          setSucesso("Se o e-mail estiver correto, você receberá um link em instantes.");
          setTimeout(() => changeView("login"), 4000);
        } else {
          setErro("Ocorreu um erro ao processar sua solicitação.");
        }
      }

    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* 🌟 LADO ESQUERDO: BRANDING & MARKETING (Oculto no Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative flex-col justify-between p-12 overflow-hidden">
        {/* Efeitos de Luz no Background */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">FinanceVM</span>
        </div>

        {/* Copy */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Assuma o controle da sua <span className="text-blue-400">vida financeira.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Gerencie seus gastos, acompanhe seus cartões e alcance suas metas com a plataforma inteligente projetada para o seu bolso.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400">
                <Wallet size={20} />
              </div>
              <p className="font-medium">Controle total de entradas e saídas</p>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-blue-400">
                <TrendingUp size={20} />
              </div>
              <p className="font-medium">Relatórios e gráficos inteligentes</p>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-purple-400">
                <ShieldCheck size={20} />
              </div>
              <p className="font-medium">Segurança e privacidade de ponta a ponta</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-slate-500 text-sm">
          © {new Date().getFullYear()} FinanceVM. Todos os direitos reservados.
        </div>
      </div>

      {/* 📝 LADO DIREITO: FORMULÁRIO DE AUTENTICAÇÃO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 lg:bg-white">
        
        {/* Versão Mobile do Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
            F
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">FinanceVM</span>
        </div>

        <div className="w-full max-w-[420px] bg-white lg:bg-transparent p-8 lg:p-0 rounded-3xl shadow-xl lg:shadow-none border border-slate-100 lg:border-none mt-12 lg:mt-0 transition-all duration-300">
          
          <div className="mb-10 lg:text-left text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {view === "login" && "Bem-vindo de volta"}
              {view === "register" && "Crie sua conta"}
              {view === "forgot_password" && "Recuperar Senha"}
            </h1>
            <p className="text-slate-500">
              {view === "login" && "Insira suas credenciais para acessar seu painel."}
              {view === "register" && "Junte-se a nós e transforme sua gestão financeira."}
              {view === "forgot_password" && "Informe seu e-mail e enviaremos um link seguro."}
            </p>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <span className="mt-0.5 text-lg">⚠️</span>
              <p>{erro}</p>
            </div>
          )}
          
          {sucesso && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              <span className="mt-0.5 text-lg">✨</span>
              <p>{sucesso}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input de Usuário */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 block">Nome de Usuário</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="text" required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Seu usuário"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Input de E-mail */}
            {(view === "register" || view === "forgot_password") && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                <label className="text-sm font-semibold text-slate-700 block">E-mail Corporativo/Pessoal</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="email" required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com.br"
                  />
                </div>
              </div>
            )}

            {/* Input de Senha */}
            {(view === "login" || view === "register") && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 block">Senha</label>
                  {view === "login" && (
                    <button 
                      type="button" 
                      onClick={() => changeView("forgot_password")} 
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-md hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {!loading && view === "login" && "Entrar na plataforma"}
              {!loading && view === "register" && "Criar conta gratuita"}
              {!loading && view === "forgot_password" && "Enviar link de recuperação"}
            </button>
          </form>

          {/* Links de Rodapé do Form */}
          <div className="mt-8 text-center sm:text-left">
            {view === "login" ? (
              <p className="text-slate-600 font-medium">
                Novo por aqui?{" "}
                <button onClick={() => changeView("register")} className="text-blue-600 font-bold hover:underline underline-offset-4 transition-all">
                  Crie sua conta
                </button>
              </p>
            ) : (
              <button 
                onClick={() => changeView("login")} 
                className="text-slate-600 font-bold flex items-center gap-2 hover:text-blue-600 transition-colors mx-auto lg:mx-0 group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Voltar para o login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}