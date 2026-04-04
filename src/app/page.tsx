"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowUpCircle, ArrowDownCircle, CreditCard, DollarSign, 
  ChevronLeft, ChevronRight, Calendar, PiggyBank, 
  Bell, AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { fetchWithAuth } from "@/lib/apiClient"; 

interface Lancamento {
  id: number;
  tipo: "entrada" | "saida" | "credito";
  valor: string;
  data: string;
  categoria: number;
}

interface Categoria {
  id: number;
  nome: string;
}

interface Caixinha {
  id: number;
  saldo_reservado: string;
}

// Nova interface para as Contas a Pagar
interface ContaPagar {
  id: number;
  descricao: string;
  valor: string;
  data_vencimento: string;
  pago: boolean;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Home() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]); 
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]); // Estado das contas
  const [loading, setLoading] = useState(true);

  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  const router = useRouter();

  useEffect(() => {
    carregarDados();
  }, [router]);

  async function carregarDados() {
    const isLogged = localStorage.getItem("is_logged");
    if (!isLogged) {
      router.push("/login");
      return;
    }

    try {
      const [resLanc, resCat, resCaix, resContas] = await Promise.all([
        fetchWithAuth("/api/lancamentos/"),
        fetchWithAuth("/api/categorias/"),
        fetchWithAuth("/api/caixinhas/"), 
        fetchWithAuth("/api/contas-pagar/"), // Puxando as contas
      ]);

      if (!resLanc.ok || !resCat.ok) {
         router.push("/login");
         return;
      }

      const dadosLancamentos = await resLanc.json();
      const dadosCategorias = await resCat.json();
      const dadosCaixinhas = resCaix.ok ? await resCaix.json() : [];
      const dadosContas = resContas.ok ? await resContas.json() : [];

      setLancamentos(Array.isArray(dadosLancamentos) ? dadosLancamentos : []);
      setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
      setCaixinhas(Array.isArray(dadosCaixinhas) ? dadosCaixinhas : []);
      setContasPagar(Array.isArray(dadosContas) ? dadosContas : []);
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setLoading(false);
    }
  }

  // --- FUNÇÃO RÁPIDA: PAGAR CONTA DIRETO DO DASHBOARD ---
  const marcarComoPaga = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/api/contas-pagar/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ pago: true }),
      });
      if (res.ok) {
        // Atualiza a tela na hora removendo a conta da lista de pendentes
        setContasPagar(contasPagar.map(c => c.id === id ? { ...c, pago: true } : c));
      }
    } catch (error) {
      console.error("Erro ao pagar conta", error);
    }
  };

  const irParaMesAnterior = () => {
    if (mesAtual === 1) { setMesAtual(12); setAnoAtual(anoAtual - 1); } 
    else { setMesAtual(mesAtual - 1); }
  };

  const irParaProximoMes = () => {
    if (mesAtual === 12) { setMesAtual(1); setAnoAtual(anoAtual + 1); } 
    else { setMesAtual(mesAtual + 1); }
  };

  const irParaHoje = () => {
    setMesAtual(new Date().getMonth() + 1);
    setAnoAtual(new Date().getFullYear());
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  };

  // --- LÓGICA DAS CONTAS A PAGAR (Widget) ---
  const hojeStr = new Date().toISOString().split('T')[0]; // Pega 'YYYY-MM-DD' de hoje
  
  // Filtra apenas as não pagas
  const contasPendentes = contasPagar.filter(c => !c.pago);
  
  const contasAtrasadas = contasPendentes.filter(c => c.data_vencimento < hojeStr);
  const contasVencemHoje = contasPendentes.filter(c => c.data_vencimento === hojeStr);
  const contasProximas = contasPendentes.filter(c => c.data_vencimento > hojeStr).slice(0, 3); // Pega as 3 próximas

  // --- LÓGICA DOS GRÁFICOS E SALDOS ---
  const lancamentosAnteriores = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    return d.getFullYear() < anoAtual || (d.getFullYear() === anoAtual && (d.getMonth() + 1) < mesAtual);
  });

  const entradasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saidasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "saida").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const creditosAnteriores = lancamentosAnteriores.filter(l => l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saldoAcumuladoAnterior = entradasAnteriores - saidasAnteriores - creditosAnteriores;

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
  });

  const totalEntradas = lancamentosFiltrados.filter((l) => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const totalSaidas = lancamentosFiltrados.filter((l) => l.tipo === "saida").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const totalCredito = lancamentosFiltrados.filter((l) => l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const resultadoDoMes = totalEntradas - totalSaidas - totalCredito;
  const saldoTotalAcumulado = saldoAcumuladoAnterior + resultadoDoMes;
  const totalInvestido = caixinhas.reduce((acc, c) => acc + parseFloat(c.saldo_reservado), 0);

  const gastos = lancamentosFiltrados.filter((l) => l.tipo === "saida" || l.tipo === "credito");
  const gastosPorCategoria = gastos.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor);
    return acc;
  }, {} as Record<number, number>);

  const dadosGrafico = Object.keys(gastosPorCategoria).map((catId) => {
    const categoriaInfo = categorias.find((c) => c.id === parseInt(catId));
    return { name: categoriaInfo ? categoriaInfo.nome : "Outros", value: gastosPorCategoria[parseInt(catId)] };
  }).sort((a, b) => b.value - a.value);

  const CORES = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

  if (loading) return <div className="text-slate-500 flex justify-center py-20">Carregando finanças...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe o resumo das suas finanças e investimentos.</p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl p-1 w-full md:w-auto justify-between">
          <button onClick={irParaMesAnterior} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center text-slate-700 font-semibold cursor-pointer" onClick={irParaHoje}>
            <Calendar size={16} className="text-blue-500" />
            <span>{MESES[mesAtual - 1]} {anoAtual}</span>
          </div>
          <button onClick={irParaProximoMes} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${saldoTotalAcumulado >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
            <p className="text-sm font-medium text-slate-500 mb-1">Saldo Líquido Atual</p>
            <div className="flex justify-between items-start">
              <h3 className={`text-3xl font-bold ${saldoTotalAcumulado >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatarMoeda(saldoTotalAcumulado)}
              </h3>
              <div className={`p-2 rounded-lg ${saldoTotalAcumulado >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}><DollarSign size={24} /></div>
            </div>
            <div className="pt-3 mt-1 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Resultado do Mês Selecionado:</span>
                  <span className={resultadoDoMes >= 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{formatarMoeda(resultadoDoMes)}</span>
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-xl border border-purple-900 shadow-md text-white">
            <p className="text-sm font-medium text-purple-100 mb-1">Total em Caixinhas (Investido)</p>
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-bold">
                {formatarMoeda(totalInvestido)}
              </h3>
              <div className="p-2 bg-purple-500/50 rounded-lg"><PiggyBank size={24} /></div>
            </div>
            <div className="pt-3 mt-1 border-t border-purple-500/50">
                <div className="flex justify-between text-[11px] text-purple-200">
                  <span>Patrimônio Total (Líquido + Investido):</span>
                  <span className="font-bold text-white">{formatarMoeda(saldoTotalAcumulado + totalInvestido)}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-500">Entradas</p>
            <ArrowUpCircle size={18} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(totalEntradas)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-500">Saídas (Débito)</p>
            <ArrowDownCircle size={18} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(totalSaidas)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-500">Fatura (Crédito)</p>
            <CreditCard size={18} className="text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(totalCredito)}</h3>
        </div>
      </div>

      {/* Grid Inferior: Gráficos e Lembretes (Transformado em 3 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lembretes de Contas (Nova Seção) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="text-amber-500" size={20} /> Lembretes
            </h2>
            <button onClick={() => router.push('/contas-pagar')} className="text-xs text-blue-600 font-medium hover:underline">Ver todas</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {contasPendentes.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-400" size={32} />
                <p className="text-sm">Tudo em dia!</p>
              </div>
            ) : (
              <>
                {/* Atrasadas */}
                {contasAtrasadas.map(c => (
                  <div key={c.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center group">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-500 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-semibold text-red-900">{c.descricao}</p>
                        <p className="text-xs text-red-600 font-medium">{formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition" title="Marcar como Paga">
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}
                
                {/* Vencem Hoje */}
                {contasVencemHoje.map(c => (
                  <div key={c.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center group">
                    <div className="flex items-start gap-3">
                      <Clock className="text-amber-500 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">{c.descricao}</p>
                        <p className="text-xs text-amber-700 font-medium">Vence Hoje • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition">
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Próximas */}
                {contasProximas.map(c => {
                   const [ano, mes, dia] = c.data_vencimento.split('-');
                   return (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center group">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{c.descricao}</p>
                        <p className="text-xs text-slate-500 font-medium">Dia {dia}/{mes} • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                      <button onClick={() => marcarComoPaga(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-200 text-slate-600 rounded-md hover:bg-emerald-100 hover:text-emerald-600 transition">
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Por Categoria</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Sem gastos neste período.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGrafico} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dadosGrafico.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Maiores Despesas */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Maiores Despesas</h2>
          {dadosGrafico.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES[index % CORES.length] }}></div>
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <span className="font-bold text-slate-800">{formatarMoeda(item.value)}</span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}