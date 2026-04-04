"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/apiClient";
import { CalendarClock, CheckCircle2, Circle, Plus, Trash2, CalendarX2, RefreshCw } from "lucide-react";

interface Categoria {
  id: number;
  nome: string;
}

interface ContaPagar {
  id: number;
  descricao: string;
  valor: string;
  data_vencimento: string;
  pago: boolean;
  categoria: number | null;
}

export default function ContasAPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [categoria, setCategoria] = useState("");
  
  // Novos estados para a recorrência
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [qtdMeses, setQtdMeses] = useState("12");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resContas, resCat] = await Promise.all([
        fetchWithAuth("/api/contas-pagar/"),
        fetchWithAuth("/api/categorias/"),
      ]);

      if (resContas.ok && resCat.ok) {
        setContas(await resContas.json());
        setCategorias(await resCat.json());
      }
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    const payloadBase = {
      valor: parseFloat(valor.replace(",", ".")),
      categoria: categoria ? parseInt(categoria) : null,
      pago: false, 
    };

    // Usamos T12:00:00 para evitar que problemas de fuso horário recuem a data em 1 dia
    const baseDate = new Date(dataVencimento + "T12:00:00");
    const numMeses = isRecorrente ? parseInt(qtdMeses) : 1;

    try {
      const promises = [];

      // Laço de repetição: Cria as contas pros próximos meses automaticamente
      for (let i = 0; i < numMeses; i++) {
        // Avança os meses mantendo o mesmo dia do vencimento original
        const dataAtual = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        const dataIso = dataAtual.toISOString().split('T')[0];
        
        // Se for recorrente, adiciona a tag (1/12), (2/12)...
        const descFinal = isRecorrente ? `${descricao} (${i + 1}/${numMeses})` : descricao;

        promises.push(
          fetchWithAuth("/api/contas-pagar/", {
            method: "POST",
            body: JSON.stringify({ ...payloadBase, descricao: descFinal, data_vencimento: dataIso }),
          })
        );
      }

      // Dispara todas as requisições de uma vez
      const responses = await Promise.all(promises);

      if (responses.every(res => res.ok)) {
        // Recarrega a lista toda do servidor para garantir que a ordenação fique perfeita
        await carregarDados();
        
        // Limpa o formulário
        setDescricao(""); 
        setValor(""); 
        setDataVencimento(""); 
        setCategoria(""); 
        setIsRecorrente(false);
        setQtdMeses("12");
      }
    } catch (error) {
      console.error("Erro ao salvar conta(s)", error);
    } finally {
      setSalvando(false);
    }
  };

  const alternarStatus = async (conta: ContaPagar) => {
    try {
      const res = await fetchWithAuth(`/api/contas-pagar/${conta.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ pago: !conta.pago }),
      });

      if (res.ok) {
        setContas(contas.map(c => c.id === conta.id ? { ...c, pago: !c.pago } : c));
      }
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    }
  };

  const deletarConta = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja apagar esta conta?")) return;
    try {
      const res = await fetchWithAuth(`/api/contas-pagar/${id}/`, { method: "DELETE" });
      if (res.ok) {
        setContas(contas.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar conta", error);
    }
  };

  const formatarMoeda = (val: string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(val));
  };

  const formatarDataBr = (dataIso: string) => {
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Carregando contas...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
          <CalendarClock size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar</h1>
          <p className="text-sm text-slate-500">Gerencie seus compromissos e não perca vencimentos.</p>
        </div>
      </div>

      {/* Formulário de Nova Conta */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" /> Agendar Nova Conta
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label>
            <input required type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Aluguel, Internet..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Valor (R$)</label>
            <input required type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Vencimento Inicial</label>
            <input required type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition text-sm" />
          </div>
          <div className="pt-5">
            <button disabled={salvando} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2.5 rounded-xl transition shadow-sm disabled:opacity-50 h-[42px]">
              {salvando ? "Salvando..." : "Adicionar"}
            </button>
          </div>

          {/* NOVA OPÇÃO: CONTA RECORRENTE */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-4 mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none">
              <input 
                type="checkbox" 
                checked={isRecorrente} 
                onChange={e => setIsRecorrente(e.target.checked)} 
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" 
              />
              <RefreshCw size={16} className="text-blue-500" />
              Tornar conta recorrente (Mensal)
            </label>

            {isRecorrente && (
              <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-left-4">
                <span className="text-xs text-slate-500 font-medium border-l pl-4 border-slate-300">Por quantos meses?</span>
                <select 
                  value={qtdMeses} 
                  onChange={e => setQtdMeses(e.target.value)} 
                  className="p-1.5 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 cursor-pointer font-medium text-slate-700"
                >
                  <option value="2">2 meses</option>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">1 ano (12x)</option>
                  <option value="24">2 anos (24x)</option>
                  <option value="60">5 anos (60x)</option>
                </select>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Contas Pendentes */}
      <div>
        <h3 className="text-slate-500 font-semibold mb-3">Pendentes</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {contas.filter(c => !c.pago).length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CalendarX2 className="mx-auto mb-2 opacity-50" size={32} />
              <p>Nenhuma conta pendente.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {contas.filter(c => !c.pago).map(conta => {
                const isAtrasada = conta.data_vencimento < hojeStr;
                const isHoje = conta.data_vencimento === hojeStr;
                return (
                  <div key={conta.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition group">
                    <div className="flex items-center gap-4">
                      <button onClick={() => alternarStatus(conta)} className="text-slate-300 hover:text-emerald-500 transition">
                        <Circle size={24} />
                      </button>
                      <div>
                        <p className="font-semibold text-slate-800">{conta.descricao}</p>
                        <div className="flex items-center gap-2 text-xs font-medium mt-0.5">
                          <span className={isAtrasada ? "text-red-500 bg-red-100 px-2 py-0.5 rounded-md" : isHoje ? "text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md" : "text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"}>
                            {isAtrasada ? `Atrasada: ${formatarDataBr(conta.data_vencimento)}` : isHoje ? "Vence Hoje" : `Vence em: ${formatarDataBr(conta.data_vencimento)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800">{formatarMoeda(conta.valor)}</span>
                      <button onClick={() => deletarConta(conta.id)} className="text-slate-300 hover:text-red-500 opacity-0 lg:group-hover:opacity-100 transition p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Contas Pagas */}
      <div>
        <h3 className="text-slate-500 font-semibold mb-3">Histórico de Pagas</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {contas.filter(c => c.pago).map(conta => (
              <div key={conta.id} className="p-4 flex items-center justify-between bg-slate-50 opacity-70 hover:opacity-100 transition group">
                <div className="flex items-center gap-4">
                  <button onClick={() => alternarStatus(conta)} className="text-emerald-500">
                    <CheckCircle2 size={24} />
                  </button>
                  <div>
                    <p className="font-semibold text-slate-600 line-through decoration-slate-300">{conta.descricao}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Venceu em: {formatarDataBr(conta.data_vencimento)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-500">{formatarMoeda(conta.valor)}</span>
                  <button onClick={() => deletarConta(conta.id)} className="text-slate-300 hover:text-red-500 opacity-0 lg:group-hover:opacity-100 transition p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {contas.filter(c => c.pago).length === 0 && (
               <div className="p-6 text-center text-sm text-slate-400">Nenhum histórico recente.</div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}