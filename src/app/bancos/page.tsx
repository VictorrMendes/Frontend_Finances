"use client";

import { useEffect, useState } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/apiClient"; 

interface Banco {
  id: number;
  nome: string;
  saldo_inicial: string;
}

export default function BancosPage() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novoSaldo, setNovoSaldo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBancos();
  }, []);

  const fetchBancos = async () => {
    try {
      const resposta = await fetchWithAuth("/api/bancos/");
      if (resposta.ok) {
        const dados = await resposta.json();
        setBancos(dados);
      }
    } catch (erro) {
      console.error("Erro ao buscar bancos:", erro);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarBanco = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resposta = await fetchWithAuth("/api/bancos/", {
        method: "POST",
        body: JSON.stringify({ nome: novoNome, saldo_inicial: novoSaldo || "0.00" }),
      });
      if (resposta.ok) {
        setNovoNome("");
        setNovoSaldo("");
        fetchBancos(); 
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletarBanco = async (id: number) => {
    if (!window.confirm("Deseja excluir este banco?")) return;
    try {
      const resposta = await fetchWithAuth(`/api/bancos/${id}/`, { method: "DELETE" });
      if (resposta.ok) fetchBancos();
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  const formatarMoeda = (valor: string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(valor));
  };

  return (
    <div className="max-w-5xl p-6">
      <div className="flex items-center gap-3 mb-8">
        <Landmark className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Meus Bancos</h1>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleAdicionarBanco} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Banco</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Saldo Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full p-2 border border-slate-300 rounded-lg"
              value={novoSaldo}
              onChange={(e) => setNovoSaldo(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "..." : "Adicionar"}
          </button>
        </form>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bancos.map((banco) => (
            <div key={banco.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <button onClick={() => handleDeletarBanco(banco.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                <Trash2 size={18} />
              </button>
              <span className="text-sm text-slate-500 font-semibold">{banco.nome}</span>
              <div className="text-2xl font-bold text-slate-800">{formatarMoeda(banco.saldo_inicial)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}