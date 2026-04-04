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
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);

  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  const router = useRouter();

  useEffect(() => {
    carregarDados();
  }, [router, mesAtual, anoAtual]); 

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
        fetchWithAuth("/api/contas-pagar/"), 
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

  const marcarComoPaga = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/api/contas-pagar/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ pago: true }),
      });
      if (res.ok) {
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

  // --- LÓGICA DE DATAS E FILTROS ---
  const hojeStr = new Date().toISOString().split('T')[0];
  const contasPendentes = contasPagar.filter(c => !c.pago);
  
  const contasAtrasadas = contasPendentes.filter(c => c.data_vencimento < hojeStr);
  const contasVencemHoje = contasPendentes.filter(c => c.data_vencimento === hojeStr);
  const contasProximas = contasPendentes.filter(c => c.data_vencimento > hojeStr).slice(0, 3); 

  // --- CÁLCULO DE SALDOS (MÊS ATUAL E ANTERIOR PARA COMPARAÇÃO) ---
  const lancamentosAnteriores = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    return d.getFullYear() < anoAtual || (d.getFullYear() === anoAtual && (d.getMonth() + 1) < mesAtual);
  });

  const entradasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saidasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "saida").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const creditosAnteriores = lancamentosAnteriores.filter(l => l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saldoAcumuladoAnterior = entradasAnteriores - saidasAnteriores - creditosAnteriores;

  // Lançamentos do mês selecionado
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

  // --- LÓGICA DE SALDO PROJETADO (Nova Feature) ---
  // Soma as contas a pagar deste mês selecionado que ainda NÃO foram pagas
  const contasPendentesDoMes = contasPendentes.filter(c => {
    const d = new Date(c.data_vencimento + "T00:00:00");
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
  }).reduce((acc, c) => acc + parseFloat(c.valor), 0);

  const saldoProjetado = saldoTotalAcumulado - contasPendentesDoMes;

  // --- GRÁFICOS ---
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

  if (loading) return <div className="text-slate-500 flex justify-center py-20 font-medium">Carregando painel financeiro...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* CABEÇALHO E CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe o resumo das suas finanças e investimentos.</p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl p-1 w-full md:w-auto justify-between">
          <button onClick={irParaMesAnterior} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-2 px-4 min-w-[150px] justify-center text-slate-700 font-semibold cursor-pointer" onClick={irParaHoje}>
            <Calendar size={16} className="text-blue-500" />
            <span>{MESES[mesAtual - 1]} {anoAtual}</span>
          </div>
          <button onClick={irParaProximoMes} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* CARDS PRINCIPAIS (SALDO E INVESTIMENTO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card de Saldo Projetado */}
        <div className={`bg-white p-5 rounded-2xl border shadow-sm ${saldoProjetado >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saldo Líquido Atual</p>
              <div className={`p-2 rounded-xl ${saldoTotalAcumulado >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}><DollarSign size={24} /></div>
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${saldoTotalAcumulado >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatarMoeda(saldoTotalAcumulado)}
            </h3>
            
            {/* Barra de Projeção */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                  <span>Projeção fim do mês:</span>
                  <span className={saldoProjetado >= 0 ? 'text-blue-600 font-bold' : 'text-red-600 font-bold'}>{formatarMoeda(saldoProjetado)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full rounded-l-full" style={{ width: `${Math.max(0, 100 - (contasPendentesDoMes / (saldoTotalAcumulado || 1)) * 100)}%` }}></div>
                  <div className="bg-red-400 h-full" style={{ width: `${Math.min(100, (contasPendentesDoMes / (saldoTotalAcumulado || 1)) * 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-right">Descontando {formatarMoeda(contasPendentesDoMes)} em contas</p>
            </div>
        </div>

        <div className="bg-gradient-to-br from-purple-700 to-purple-900 p-5 rounded-2xl border border-purple-800 shadow-md text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-10"><PiggyBank size={120} /></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-purple-200 uppercase tracking-wider mb-2">Reserva em Caixinhas</p>
              <h3 className="text-3xl font-bold mb-4">{formatarMoeda(totalInvestido)}</h3>
              
              <div className="bg-purple-950/30 rounded-xl p-3 backdrop-blur-sm border border-purple-500/20">
                  <div className="flex justify-between text-xs font-medium text-purple-100 mb-1">
                    <span>Metas Ativas:</span>
                    <span className="font-bold">{caixinhas.length} Caixinhas</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-purple-100">
                    <span>Patrimônio Total:</span>
                    <span className="font-bold">{formatarMoeda(saldoTotalAcumulado + totalInvestido)}</span>
                  </div>
              </div>
            </div>
        </div>
      </div>

      {/* MINI CARDS DE FLUXO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Entradas</p>
            <h3 className="text-lg font-bold text-slate-800">{formatarMoeda(totalEntradas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <ArrowUpCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 transition">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Saídas Físicas</p>
            <h3 className="text-lg font-bold text-slate-800">{formatarMoeda(totalSaidas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <ArrowDownCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-orange-200 transition">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Cartão de Crédito</p>
            <h3 className="text-lg font-bold text-slate-800">{formatarMoeda(totalCredito)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* GRID INFERIOR (CONTAS, GRÁFICOS, LISTAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lembretes de Contas */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="text-amber-500" size={18} /> Alertas de Pagamento
            </h2>
            <button onClick={() => router.push('/contas-pagar')} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium hover:bg-slate-200 transition">Ver Todas</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {contasPendentes.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-400/50" size={36} />
                <p className="text-sm">Nenhuma conta pendente!</p>
              </div>
            ) : (
              <>
                {contasAtrasadas.map(c => (
                  <div key={c.id} className="p-2.5 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center group">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-red-100 rounded-lg text-red-500"><AlertCircle size={16} /></div>
                      <div>
                        <p className="text-xs font-bold text-red-900 line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-red-600 font-medium">Atrasada • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="p-1.5 text-red-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Marcar como Paga">
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                ))}
                
                {contasVencemHoje.map(c => (
                  <div key={c.id} className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center group">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><Clock size={16} /></div>
                      <div>
                        <p className="text-xs font-bold text-amber-900 line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-amber-700 font-medium">Vence Hoje • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="p-1.5 text-amber-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                ))}

                {contasProximas.map(c => {
                   const [ano, mes, dia] = c.data_vencimento.split('-');
                   return (
                    <div key={c.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex justify-between items-center group hover:border-blue-200 transition">
                      <div className="pl-1">
                        <p className="text-xs font-semibold text-slate-700 line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Dia {dia}/{mes} • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                      <button onClick={() => marcarComoPaga(c.id)} className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                        <CheckCircle2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">Distribuição de Gastos</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-500 text-center py-10 text-sm">Nenhum gasto registrado neste mês.</p>
          ) : (
            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGrafico} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {dadosGrafico.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Maiores Despesas */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">Top 5 Despesas</h2>
          <div className="flex-1 space-y-2">
            {dadosGrafico.length === 0 && <p className="text-slate-500 text-center py-8 text-sm">Sem dados disponíveis.</p>}
            {dadosGrafico.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: CORES[index % CORES.length] }}>
                    {index + 1}º
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{formatarMoeda(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}