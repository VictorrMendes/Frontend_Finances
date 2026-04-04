"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/apiClient";
import { PiggyBank, Plus, Target, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";

interface Caixinha {
  id: number;
  nome: string;
  objetivo: string;
  saldo_reservado: string;
  cor: string;
}

export default function CaixinhasPage() {
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário de criação
  const [novoNome, setNovoNome] = useState("");
  const [novoObjetivo, setNovoObjetivo] = useState("");
  const [novaCor, setNovaCor] = useState("#8b5cf6"); // Padrão Roxo
  
  // Estado do modal de movimentação (Guardar/Resgatar)
  const [caixinhaAtiva, setCaixinhaAtiva] = useState<Caixinha | null>(null);
  const [valorMovimento, setValorMovimento] = useState("");
  const [tipoMovimento, setTipoMovimento] = useState<"guardar" | "resgatar">("guardar");

  useEffect(() => {
    fetchCaixinhas();
  }, []);

  const fetchCaixinhas = async () => {
    try {
      const res = await fetchWithAuth("/api/caixinhas/");
      if (res.ok) setCaixinhas(await res.json());
    } catch (error) {
      console.error("Erro ao carregar caixinhas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarCaixinha = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth("/api/caixinhas/", {
        method: "POST",
        body: JSON.stringify({
          nome: novoNome,
          objetivo: novoObjetivo || "0.00",
          cor: novaCor,
        }),
      });
      if (res.ok) {
        setNovoNome("");
        setNovoObjetivo("");
        fetchCaixinhas();
      }
    } catch (error) {
      console.error("Erro ao criar caixinha", error);
    }
  };

  const handleMovimentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caixinhaAtiva || !valorMovimento) return;

    const valorAjuste = parseFloat(valorMovimento);
    const saldoAtual = parseFloat(caixinhaAtiva.saldo_reservado);
    
    // Calcula o novo saldo (impede ficar negativo)
    let novoSaldo = tipoMovimento === "guardar" ? saldoAtual + valorAjuste : saldoAtual - valorAjuste;
    if (novoSaldo < 0) novoSaldo = 0;

    try {
      const res = await fetchWithAuth(`/api/caixinhas/${caixinhaAtiva.id}/`, {
        method: "PUT", // Atualiza o registro
        body: JSON.stringify({
          ...caixinhaAtiva,
          saldo_reservado: novoSaldo.toFixed(2),
        }),
      });
      if (res.ok) {
        setCaixinhaAtiva(null);
        setValorMovimento("");
        fetchCaixinhas();
      }
    } catch (error) {
      console.error("Erro ao movimentar dinheiro", error);
    }
  };

  const handleDeletarCaixinha = async (id: number) => {
    if (!window.confirm("Deseja realmente quebrar este porquinho?")) return;
    try {
      const res = await fetchWithAuth(`/api/caixinhas/${id}/`, { method: "DELETE" });
      if (res.ok) fetchCaixinhas();
    } catch (error) {
      console.error("Erro ao deletar caixinha", error);
    }
  };

  const formatarMoeda = (valor: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor));
  };

  return (
    <div className="max-w-6xl relative">
      <div className="flex items-center gap-3 mb-8">
        <PiggyBank className="text-purple-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-800">Caixinhas</h1>
      </div>

      {/* Formulário de Nova Caixinha */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
          <Plus size={20} className="text-purple-500"/> Criar Nova Caixinha
        </h2>
        <form onSubmit={handleCriarCaixinha} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Objetivo</label>
            <input type="text" required placeholder="Ex: Viagem, Reserva..." value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Meta de Valor (R$)</label>
            <input type="number" step="0.01" required placeholder="0.00" value={novoObjetivo} onChange={(e) => setNovoObjetivo(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"/>
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium text-slate-600 mb-1">Cor</label>
            <input type="color" value={novaCor} onChange={(e) => setNovaCor(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer border-none p-0"/>
          </div>
          <button type="submit" className="w-full md:w-auto bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 font-medium transition shadow-md hover:shadow-lg">
            Criar
          </button>
        </form>
      </div>

      {/* Lista de Caixinhas */}
      {loading ? (
        <p className="text-slate-500 animate-pulse">Carregando seus investimentos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caixinhas.map((caixinha) => {
            const objetivo = Number(caixinha.objetivo);
            const saldo = Number(caixinha.saldo_reservado);
            let progresso = objetivo > 0 ? (saldo / objetivo) * 100 : 0;
            if (progresso > 100) progresso = 100;

            return (
              <div key={caixinha.id} className="relative rounded-2xl shadow-lg p-6 text-white overflow-hidden transition hover:-translate-y-1 hover:shadow-xl group" style={{ backgroundColor: caixinha.cor }}>
                {/* Efeito de brilho fundo */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

                <button onClick={() => handleDeletarCaixinha(caixinha.id)} className="absolute top-4 right-4 text-white/50 hover:text-white transition opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Target size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl tracking-wide truncate">{caixinha.nome}</h3>
                </div>

                <div className="mb-6 relative z-10">
                  <p className="text-sm text-white/80 font-medium mb-1">Saldo guardado</p>
                  <p className="text-3xl font-extrabold">{formatarMoeda(saldo)}</p>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full relative z-10 mb-6">
                  <div className="flex justify-between text-xs mb-2 font-medium text-white/90">
                    <span>{progresso.toFixed(0)}% concluído</span>
                    <span>Meta: {formatarMoeda(objetivo)}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progresso}%` }}></div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 relative z-10">
                  <button onClick={() => { setCaixinhaAtiva(caixinha); setTipoMovimento("guardar"); }} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1">
                    <ArrowUpRight size={16} /> Guardar
                  </button>
                  <button onClick={() => { setCaixinhaAtiva(caixinha); setTipoMovimento("resgatar"); }} className="flex-1 bg-black/10 hover:bg-black/20 backdrop-blur-md py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1">
                    <ArrowDownRight size={16} /> Resgatar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Movimentação */}
      {caixinhaAtiva && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {tipoMovimento === "guardar" ? "Guardar dinheiro" : "Resgatar dinheiro"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">Caixinha: <span className="font-semibold text-slate-700">{caixinhaAtiva.nome}</span></p>
            
            <form onSubmit={handleMovimentar}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Qual valor?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                  <input autoFocus type="number" step="0.01" required value={valorMovimento} onChange={(e) => setValorMovimento(e.target.value)} className="w-full pl-12 p-4 text-xl border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-slate-800" placeholder="0.00"/>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setCaixinhaAtiva(null)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition">
                  Cancelar
                </button>
                <button type="submit" className={`flex-1 py-3 text-white font-medium rounded-xl transition shadow-md ${tipoMovimento === 'guardar' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}