"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // URL base dinâmica: usa a variável de ambiente em produção ou localhost no desenvolvimento
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      if (isLogin) {
        // --- FLUXO DE LOGIN ---
        const resposta = await fetch(`${API_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (resposta.ok) {
          const dados = await resposta.json();
          
          // ALTERAÇÃO CRÍTICA: Salvando os dois tokens com os nomes que o apiClient.ts espera
          localStorage.setItem("access_token", dados.access);
          localStorage.setItem("refresh_token", dados.refresh);
          localStorage.setItem("username", username);
          
          router.push("/"); 
        } else {
          setErro("Usuário ou senha incorretos.");
        }
      } else {
        // --- FLUXO DE CADASTRO ---
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (resposta.ok) {
          setSucesso("Conta criada com sucesso! Faça login para continuar.");
          setIsLogin(true); 
          setPassword(""); 
        } else {
          const dadosErro = await resposta.json();
          const mensagem = dadosErro.username ? dadosErro.username[0] : "Erro ao criar conta. Tente outro usuário.";
          setErro(mensagem);
        }
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isLogin ? <Lock size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? "Faça login para acessar suas finanças" : "Comece a organizar seu dinheiro hoje"}
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm mb-6 text-center border border-emerald-100">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? "Processando..." : (
              <>
                <span>{isLogin ? "Entrar no Sistema" : "Criar Conta"}</span>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErro("");
              setSucesso("");
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </div>
      </div>
    </div>
  );
}