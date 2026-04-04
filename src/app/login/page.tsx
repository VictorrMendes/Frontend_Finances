"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de login para exemplo
    // Aqui você inseriria sua lógica de fetch/localStorage
    setTimeout(() => {
      localStorage.setItem("is_logged", "true");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      {/* Container Principal - Responsivo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200">
            <Lock className="text-white" size={32} />
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-black text-slate-800 tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Acesse sua conta para gerenciar suas finanças
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white py-10 px-8 shadow-sm border border-slate-200 rounded-[2.5rem]">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Campo E-mail */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder:text-slate-300 font-medium"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder:text-slate-300 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Entrar */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar no Painel <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-tighter">
              <span className="bg-white px-4 text-slate-400">Acesso Restrito</span>
            </div>
          </div>
        </div>

        {/* Rodapé Mobile */}
        <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Sistema de Gestão Financeira v3.0
        </p>
      </div>
    </div>
  );
}