"use client";

import { useEffect, useState } from "react";
import { PieChart as ChartIcon, CalendarDays } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchWithAuth } from "@/lib/apiClient";

interface Lancamento {
  id: number;
  tipo: "entrada" | "saida" | "credito" | "deposito_caixinha" | "resgate_caixinha";
  valor: string;
  data: string;
  categoria: number | null;
}

interface Categoria {
  id: number;
  nome: string;
}

type PeriodoFiltro = "mes" | "6meses" | "ano";

export default function RelatoriosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Novo estado para controlar o período do relatório
  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoFiltro>("6meses");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resLanc, resCat] = await Promise.all([
          fetchWithAuth("/api/lancamentos/"),
          fetchWithAuth("/api/categorias/"),
        ]);

        if (resLanc.ok && resCat.ok) {
          const dadosLancamentos = await resLanc.json();
          const dadosCategorias = await resCat.json();

          setLancamentos(Array.isArray(dadosLancamentos) ? dadosLancamentos : []);
          setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  };

  if (loading) return <div className="text-slate-500 animate-pulse flex justify-center py-20">Gerando relatórios...</div>;

  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  // Calcula a data de 6 meses atrás
  const data6MesesAtras = new Date();
  data6MesesAtras.setMonth(dataAtual.getMonth() - 5);
  data6MesesAtras.setDate(1); // Começa no dia 1º daquele mês

  // FILTRO INTELIGENTE: Pega apenas os lançamentos do período selecionado
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    
    if (filtroPeriodo === "mes") {
      return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
    } else if (filtroPeriodo === "6meses") {
      return d >= data6MesesAtras;
    } else if (filtroPeriodo === "ano") {
      return d.getFullYear() === anoAtual;
    }
    return true;
  });

  // Entradas reais (exclui resgates)
  const entradasPeriodo = lancamentosFiltrados
    .filter((l) => l.tipo === "entrada")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  // Gastos reais (exclui depósitos em caixinha)
  const gastosPeriodo = lancamentosFiltrados
    .filter((l) => l.tipo === "saida" || l.tipo === "credito")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  // Total Guardado no período
  const investidoPeriodo = lancamentosFiltrados
    .filter((l) => l.tipo === "deposito_caixinha")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const saldoPeriodo = entradasPeriodo - gastosPeriodo;
  const taxaPoupanca = entradasPeriodo > 0 ? ((saldoPeriodo / entradasPeriodo) * 100).toFixed(0) : "0";

  // Gráfico de Barras: Gastos por Categoria
  const gastosPorCategoria = lancamentosFiltrados
    .filter((l) => l.tipo === "saida" || l.tipo === "credito")
    .reduce((acc, l) => {
      const catId = l.categoria || 0; 
      acc[catId] = (acc[catId] || 0) + parseFloat(l.valor);
      return acc;
    }, {} as Record<number, number>);

  const dadosCategorias = Object.keys(gastosPorCategoria)
    .map((catIdStr) => {
      const catId = parseInt(catIdStr);
      const cat = categorias.find((c) => c.id === catId);
      const valor = gastosPorCategoria[catId];
      const porcentagem = gastosPeriodo > 0 ? (valor / gastosPeriodo) * 100 : 0;
      return {
        nome: cat ? cat.nome : "Outros",
        valor,
        porcentagem,
      };
    })
    .sort((a, b) => b.valor - a.valor); 

  const maxGastoCategoria = dadosCategorias.length > 0 ? dadosCategorias[0].valor : 1;

  // Gráfico de Linha: Ajusta a quantidade de meses exibidos baseado no filtro
  const trendData = [];
  
  if (filtroPeriodo === "ano") {
    // Mostra os 12 meses do ano atual
    const mesesNomes = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    for (let i = 1; i <= 12; i++) {
      const lancMes = lancamentos.filter((l) => {
        const lDate = new Date(l.data + "T00:00:00");
        return lDate.getMonth() + 1 === i && lDate.getFullYear() === anoAtual;
      });
      const entradas = lancMes.filter((l) => l.tipo === "entrada").reduce((sum, l) => sum + parseFloat(l.valor), 0);
      const gastos = lancMes.filter((l) => l.tipo === "saida" || l.tipo === "credito").reduce((sum, l) => sum + parseFloat(l.valor), 0);
      trendData.push({ name: mesesNomes[i-1], Entradas: entradas, Gastos: gastos });
    }
  } else {
    // Mostra apenas os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const nomeMes = d.toLocaleString("pt-BR", { month: "short" }).toUpperCase();

      const lancMes = lancamentos.filter((l) => {
        const lDate = new Date(l.data + "T00:00:00");
        return lDate.getMonth() + 1 === m && lDate.getFullYear() === y;
      });

      const entradas = lancMes.filter((l) => l.tipo === "entrada").reduce((sum, l) => sum + parseFloat(l.valor), 0);
      const gastos = lancMes.filter((l) => l.tipo === "saida" || l.tipo === "credito").reduce((sum, l) => sum + parseFloat(l.valor), 0);

      trendData.push({ name: nomeMes, Entradas: entradas, Gastos: gastos });
    }
  }

  // Textos dinâmicos para os cards baseados no filtro
  const labelPeriodo = filtroPeriodo === "mes" ? "neste mês" : filtroPeriodo === "6meses" ? "em 6 meses" : "neste ano";

  return (
    <div className="max-w-6xl">
      {/* Cabeçalho com o novo Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ChartIcon className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold">Relatórios e Métricas</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <CalendarDays size={18} className="text-slate-400 ml-2" />
          <select 
            value={filtroPeriodo} 
            onChange={(e) => setFiltroPeriodo(e.target.value as PeriodoFiltro)}
            className="p-2 bg-transparent border-none outline-none text-sm font-semibold text-slate-700 cursor-pointer pr-4"
          >
            <option value="mes">Mês Atual</option>
            <option value="6meses">Últimos 6 Meses</option>
            <option value="ano">Ano Atual ({anoAtual})</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Entradas</p>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(entradasPeriodo)}</h3>
          <p className="text-xs text-slate-400 mt-1">{labelPeriodo}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Gastos</p>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(gastosPeriodo)}</h3>
          <p className="text-xs text-slate-400 mt-1">débito + crédito ({labelPeriodo})</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Taxa Poupança</p>
          <h3 className="text-xl font-bold text-blue-600">{taxaPoupanca}%</h3>
          <p className={`text-xs mt-1 font-medium ${investidoPeriodo > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
            {investidoPeriodo > 0 ? `Guardado: ${formatarMoeda(investidoPeriodo)}` : "da receita poupada"}
          </p>
        </div>
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${saldoPeriodo >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Saldo Líquido</p>
          <h3 className={`text-xl font-bold ${saldoPeriodo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatarMoeda(saldoPeriodo)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">resultado {labelPeriodo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Gastos por Categoria</h2>
          {dadosCategorias.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem gastos registrados {labelPeriodo}.</p>
          ) : (
            <div className="space-y-5">
              {dadosCategorias.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.nome}</span>
                    <span className="text-sm font-bold text-slate-800">{formatarMoeda(item.valor)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(item.valor / maxGastoCategoria) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{item.porcentagem.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Tendência de Fluxo de Caixa</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip formatter={(value) => formatarMoeda(Number(value))} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}