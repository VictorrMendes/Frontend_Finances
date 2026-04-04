"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowUpCircle, ArrowDownCircle, CreditCard, DollarSign, 
  ChevronLeft, ChevronRight, Calendar, PiggyBank, 
  Bell, AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
  }, [mesAtual, anoAtual]); 

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

  // --- LÓGICA DE DATAS E FILTROS DE ALERTAS (MÊS ATUAL SELECIONADO) ---
  const hojeStr = new Date().toISOString().split('T')[0];
  
  // 1. Filtra contas pertencentes apenas ao mês e ano selecionados
  const contasDoMesSelecionado = contasPagar.filter(c => {
    const [ano, mes] = c.data_vencimento.split('-');
    return parseInt(ano) === anoAtual && parseInt(mes) === mesAtual;
  });

  // 2. Define as pendências apenas dentro desse conjunto filtrado
  const contasPendentesNoMes = contasDoMesSelecionado.filter(c => !c.pago);
  
  const contasAtrasadas = contasPendentesNoMes.filter(c => c.data_vencimento < hojeStr);
  const contasVencemHoje = contasPendentesNoMes.filter(c => c.data_vencimento === hojeStr);
  const contasProximas = contasPendentesNoMes
    .filter(c => c.data_vencimento > hojeStr)
    .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));

  // --- CÁLCULO DE SALDOS ACUMULADOS ---
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

  // Projeção: Saldo atual menos o que ainda falta pagar NESTE mês
  const valorPendenteMes = contasPendentesNoMes.reduce((acc, c) => acc + parseFloat(c.valor), 0);
  const saldoProjetado = saldoTotalAcumulado - valorPendenteMes;

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

  const CORES = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

  if (loading) return <div className="text-emerald-500 flex justify-center py-20 font-bold animate-pulse">AUTENTICANDO ACESSO...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* CABEÇALHO E CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-800 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 text-sm font-medium">Competência de {MESES[mesAtual - 1]} de {anoAtual}</p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-2xl p-1 w-full md:w-auto justify-between">
          <button onClick={irParaMesAnterior} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-500 transition"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-2 px-6 min-w-[160px] justify-center text-slate-700 font-bold cursor-pointer" onClick={irParaHoje}>
            <Calendar size={16} className="text-emerald-500" />
            <span className="text-sm uppercase tracking-widest">{MESES[mesAtual - 1]}</span>
          </div>
          <button onClick={irParaProximoMes} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-500 transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* CARDS DE SALDO (ESTILO FINTECH) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`bg-white p-6 rounded-[2rem] border shadow-sm ${saldoProjetado >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disponibilidade Líquida</p>
              <div className={`p-2.5 rounded-2xl ${saldoTotalAcumulado >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}><DollarSign size={20} /></div>
            </div>
            <h3 className={`text-3xl font-black mb-6 ${saldoTotalAcumulado >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatarMoeda(saldoTotalAcumulado)}
            </h3>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  <span>Projeção Final do Mês</span>
                  <span className={saldoProjetado >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatarMoeda(saldoProjetado)}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${Math.max(0, 100 - (valorPendenteMes / (saldoTotalAcumulado || 1)) * 100)}%` }}></div>
                  <div className="bg-red-400 h-full" style={{ width: `${Math.min(100, (valorPendenteMes / (saldoTotalAcumulado || 1)) * 100)}%` }}></div>
                </div>
            </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-5 text-emerald-500"><PiggyBank size={140} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em] mb-4">Capital de Reserva</p>
              <h3 className="text-3xl font-black mb-6 text-white">{formatarMoeda(totalInvestido)}</h3>
              
              <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/5">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Patrimônio Consolidado</span>
                    <span className="text-emerald-400">{formatarMoeda(saldoTotalAcumulado + totalInvestido)}</span>
                  </div>
              </div>
            </div>
        </div>
      </div>

      {/* MINI CARDS DE FLUXO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-500/20 transition-all">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
            <h3 className="text-lg font-black text-slate-800">{formatarMoeda(totalEntradas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ArrowUpCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-500/20 transition-all">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saídas (Débito)</p>
            <h3 className="text-lg font-black text-slate-800">{formatarMoeda(totalSaidas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
            <ArrowDownCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-500/20 transition-all">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cartão de Crédito</p>
            <h3 className="text-lg font-black text-slate-800">{formatarMoeda(totalCredito)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* GRID INFERIOR - ALERTAS E GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alertas de Pagamento - FILTRADO PELO MÊS DA TELA */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
            <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
              <Bell className="text-orange-500" size={16} /> Alertas de Pagamento
            </h2>
            <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full font-black uppercase">
              {MESES[mesAtual - 1]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px] max-h-[400px]">
            {contasPendentesNoMes.length === 0 ? (
              <div className="text-center text-slate-400 py-16">
                <CheckCircle2 className="mx-auto mb-4 text-emerald-500/30" size={48} />
                <p className="text-xs font-bold uppercase tracking-widest">Sem pendências no período</p>
              </div>
            ) : (
              <>
                {/* Atrasadas */}
                {contasAtrasadas.map(c => (
                  <div key={c.id} className="p-4 bg-red-50/50 border border-red-100 rounded-[1.25rem] flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-red-500 rounded-xl text-white shadow-lg shadow-red-200"><AlertCircle size={16} /></div>
                      <div>
                        <p className="text-xs font-black text-red-900 uppercase tracking-tight line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-red-600 font-bold">{formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="p-2 text-red-300 hover:text-emerald-500 transition-colors">
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                ))}
                
                {/* Vencem Hoje */}
                {contasVencemHoje.map(c => (
                  <div key={c.id} className="p-4 bg-amber-50/50 border border-amber-100 rounded-[1.25rem] flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200"><Clock size={16} /></div>
                      <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-amber-700 font-bold">{formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                    </div>
                    <button onClick={() => marcarComoPaga(c.id)} className="p-2 text-amber-300 hover:text-emerald-500 transition-colors">
                      <CheckCircle2 size={24} />
                    </button>
                  </div>
                ))}

                {/* Próximas do mês */}
                {contasProximas.map(c => {
                   const dia = c.data_vencimento.split('-')[2];
                   return (
                    <div key={c.id} className="p-4 bg-white border border-slate-100 rounded-[1.25rem] flex justify-between items-center group hover:border-emerald-500/20 transition-all">
                      <div className="pl-1">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight line-clamp-1">{c.descricao}</p>
                        <p className="text-[11px] text-slate-400 font-bold">Vencimento: Dia {dia} • {formatarMoeda(parseFloat(c.valor))}</p>
                      </div>
                      <button onClick={() => marcarComoPaga(c.id)} className="p-2 text-slate-200 hover:text-emerald-500 transition-colors">
                        <CheckCircle2 size={24} />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <button onClick={() => router.push('/contas-pagar')} className="w-full mt-6 py-3 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all">Acessar Agenda Financeira</button>
        </div>

        {/* Gráfico de Pizza */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 mb-6 pb-4 border-b border-slate-50 text-center lg:text-left">Análise de Gastos</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-400 text-center py-24 text-[10px] font-black uppercase tracking-widest">Aguardando dados...</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                    {dadosGrafico.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatarMoeda(Number(value))} 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Top Categorias */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800 mb-6 pb-4 border-b border-slate-50">Ranking de Consumo</h2>
          <div className="flex-1 space-y-4">
            {dadosGrafico.length === 0 && <p className="text-slate-400 text-center py-12 text-[10px] font-black uppercase tracking-widest">Nenhuma categoria ativa</p>}
            {dadosGrafico.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 rounded-full group-hover:scale-y-125 transition-transform" style={{ backgroundColor: CORES[index % CORES.length] }}></div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{formatarMoeda(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}