"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

// Componente Interno que usa os SearchParams
function RedefinirForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/api/usuarios/redefinir-senha/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, password }),
      });

      if (res.ok) {
        setSucesso("Senha alterada com sucesso!");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const dados = await res.json();
        setErro(dados.erro || "Link inválido ou expirado.");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Tudo pronto!</h2>
        <p className="text-slate-500 text-sm">Sua senha foi redefinida. Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock size={18} />
          </div>
          <input
            type="password" required minLength={6}
            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ShieldCheck size={18} />
          </div>
          <input
            type="password" required
            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
          />
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
          <AlertCircle size={16} /> {erro}
        </div>
      )}

      <button
        type="submit" disabled={loading || !uid || !token}
        className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Redefinir Senha"}
      </button>
    </form>
  );
}


export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Nova Senha</h1>
          <p className="text-sm text-slate-500 mt-1">Crie uma senha forte e segura.</p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-500">Carregando formulário...</div>}>
          <RedefinirForm />
        </Suspense>
      </div>
    </div>
  );
}