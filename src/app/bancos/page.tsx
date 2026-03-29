"use client";

import { useEffect, useState } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";

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

  const fetchBancos = () => {
    fetch("http://127.0.0.1:8000/api/bancos/")
      .then((resposta) => resposta.json())
      .then((dados) => {
        setBancos(dados);
        setLoading(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar bancos:", erro);
        setLoading(false);
      });
  };

  const handleAdicionarBanco = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resposta = await fetch("http://127.0.0.1:8000/api/bancos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome,
          saldo_inicial: novoSaldo || "0.00",
        }),
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

  // Função para deletar um banco
  const handleDeletarBanco = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este banco? Lançamentos vinculados a ele podem ser afetados.")) return;

    try {
      const resposta = await fetch(`http://127.0.0.1:8000/api/bancos/${id}/`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        fetchBancos(); // Recarrega a lista
      } else {
        alert("Não foi possível excluir o banco. Verifique se existem lançamentos vinculados a ele.");
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  const formatarMoeda = (valor: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(valor));
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Landmark className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Meus Bancos</h1>
      </div>

      {/* Formulário Responsivo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Adicionar novo banco</h2>
        <form onSubmit={handleAdicionarBanco} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Banco</label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank, Itaú..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Saldo Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoSaldo}
              onChange={(e) => setNovoSaldo(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !novoNome.trim()}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} />
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      </div>

      {/* Lista de Bancos Responsiva */}
      {loading ? (
        <p className="text-slate-500 animate-pulse">Carregando seus bancos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bancos.length === 0 ? (
            <p className="text-slate-500 col-span-full">Nenhum banco cadastrado ainda.</p>
          ) : (
            bancos.map((banco) => (
              <div
                key={banco.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-blue-300 transition relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold truncate pr-8">
                    {banco.nome}
                  </span>
                  {/* Botão de Excluir */}
                  <button
                    onClick={() => handleDeletarBanco(banco.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"
                    title="Excluir banco"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <span className="text-2xl font-bold text-slate-800">
                  {formatarMoeda(banco.saldo_inicial)}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Saldo Inicial
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}