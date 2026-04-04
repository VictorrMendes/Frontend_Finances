"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, UserPlus, Mail } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Novo estado para o e-mail
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErro("");
    setSucesso("");
    setPassword("");
    // Limpa o e-mail ao voltar pro login
    if (!isLogin) setEmail(""); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      if (isLogin) {
        // --- LOGIN COM COOKIES ---
        const resposta = await fetch(`${API_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include", // ESSENCIAL para receber o cookie
        });

        if (resposta.ok) {
          // Os tokens agora estão protegidos no navegador (HttpOnly)
          localStorage.setItem("username", username);
          localStorage.setItem("is_logged", "true");
          
          // Limpa lixo de versões antigas do localStorage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          router.push("/"); 
        } else {
          setErro("Usuário ou senha incorretos.");
        }
      } else {
        // --- CADASTRO (Agora enviando o e-mail) ---
        const resposta = await fetch(`${API_URL}/api/usuarios/registrar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }), // E-mail incluído no payload
        });

        if (resposta.ok) {
          setSucesso("Conta criada com sucesso! Faça login.");
          setIsLogin(true); 
          setPassword(""); 
          setEmail("");
        } else {
          const dadosErro = await resposta.json();
          setErro(dadosErro.username ? dadosErro.username[0] : "Erro ao criar conta. Verifique os dados.");
        }
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl transition-all">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isLogin ? <Lock size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin ? "Acesse seu painel financeiro" : "Comece a organizar suas finanças hoje"}
          </p>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100 animate-in fade-in">{erro}</div>}
        {sucesso && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm mb-6 text-center border border-emerald-100 animate-in fade-in">{sucesso}</div>}

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
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário"
              />
            </div>
          </div>

          {/* NOVO CAMPO: E-MAIL (Aparece apenas se não for Login) */}
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}

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
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? "Processando..." : isLogin ? "Entrar no Sistema" : "Criar Conta"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
          {isLogin ? (
            <p>Não tem uma conta? <button onClick={toggleMode} className="text-blue-600 font-semibold hover:underline">Cadastre-se</button></p>
          ) : (
            <p>Já possui uma conta? <button onClick={toggleMode} className="text-blue-600 font-semibold hover:underline">Faça Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}