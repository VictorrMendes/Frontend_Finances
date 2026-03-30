"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <-- Importação adicionada
import { CreditCard, Plus, Trash2 } from "lucide-react";

interface Cartao {
  id: number;
  nome: string;
  limite: string;
  dia_vencimento: number;
  dia_fechamento: number;
}

export default function CartoesPage() {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário
  const [novoNome, setNovoNome] = useState("");
  const [novoLimite, setNovoLimite] = useState("");
  const [novoVencimento, setNovoVencimento] = useState("");
  const [novoFechamento, setNovoFechamento] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter(); // <-- Roteador adicionado

  useEffect(() => {
    fetchCartoes();
  }, []);

  const fetchCartoes = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("https://victorrmendes.pythonanywhere.com/api/cartoes/", {
      headers: {
        "Authorization": `Bearer ${token}` // <-- Crachá adicionado
      }
    })
      .then((resposta) => {
        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          throw new Error("Não autorizado");
        }
        return resposta.json();
      })
      .then((dados) => {
        setCartoes(dados);
        setLoading(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar cartões:", erro);
        setLoading(false);
      });
  };

  const handleAdicionarCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const resposta = await fetch("https://victorrmendes.pythonanywhere.com/api/cartoes/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <-- Crachá adicionado
        },
        body: JSON.stringify({
          nome: novoNome,
          limite: novoLimite || "0.00",
          dia_vencimento: parseInt(novoVencimento),
          dia_fechamento: parseInt(novoFechamento),
        }),
      });

      if (resposta.ok) {
        setNovoNome("");
        setNovoLimite("");
        setNovoVencimento("");
        setNovoFechamento("");
        fetchCartoes();
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para deletar um cartão
  const handleDeletarCartao = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão? Lançamentos vinculados a ele podem ser afetados.")) return;

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const resposta = await fetch(`https://victorrmendes.pythonanywhere.com/api/cartoes/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}` // <-- Crachá adicionado
        }
      });

      if (resposta.ok) {
        fetchCartoes(); // Recarrega a lista
      } else {
        alert("Não foi possível excluir o cartão. Verifique se existem lançamentos vinculados a ele.");
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
        <CreditCard className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Meus Cartões</h1>
      </div>

      {/* Formulário de Adicionar Cartão Responsivo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Adicionar novo cartão</h2>
        <form onSubmit={handleAdicionarCartao} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Cartão</label>
            <input
              type="text" required placeholder="Ex: Nubank, Inter..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Limite (R$)</label>
            <input
              type="number" step="0.01" required placeholder="5000.00"
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoLimite} onChange={(e) => setNovoLimite(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Venc. (Dia)</label>
            <input
              type="number" min="1" max="31" required placeholder="10"
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoVencimento} onChange={(e) => setNovoVencimento(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha (Dia)</label>
            <input
              type="number" min="1" max="31" required placeholder="3"
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novoFechamento} onChange={(e) => setNovoFechamento(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-5 flex justify-end mt-2">
            <button
              type="submit" disabled={isSubmitting || !novoNome.trim()}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={18} />
              {isSubmitting ? "Adicionando..." : "Adicionar Cartão"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Cartões Responsiva */}
      {loading ? (
        <p className="text-slate-500 animate-pulse">Carregando seus cartões...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.length === 0 ? (
            <p className="text-slate-500 col-span-full">Nenhum cartão cadastrado ainda.</p>
          ) : (
            cartoes.map((cartao) => (
              <div
                key={cartao.id}
                className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col gap-4 relative overflow-hidden group"
              >
                {/* Efeito visual para parecer um cartão físico */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white opacity-5"></div>
                <div className="absolute right-8 top-12 w-16 h-16 rounded-full bg-white opacity-5"></div>

                <div className="flex justify-between items-start z-10 pr-6">
                  <span className="text-sm text-slate-300 uppercase tracking-wider font-semibold truncate">
                    {cartao.nome}
                  </span>
                </div>

                {/* Botão de Excluir Flutuante */}
                <button
                  onClick={() => handleDeletarCartao(cartao.id)}
                  className="absolute top-5 right-5 text-slate-500 hover:text-red-400 transition z-20"
                  title="Excluir cartão"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex flex-col z-10 mt-2">
                  <span className="text-2xl font-bold">
                    {formatarMoeda(cartao.limite)}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Limite Total
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-slate-300 pt-4 border-t border-slate-800 z-10 mt-2">
                  <span>Vence dia {cartao.dia_vencimento}</span>
                  <span>Fecha dia {cartao.dia_fechamento}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}