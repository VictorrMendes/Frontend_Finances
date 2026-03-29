"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, CreditCard, DollarSign, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Home() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Filtro de Data
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resLanc, resCat] = await Promise.all([
          fetch("https://victorrmendes.pythonanywhere.com/api/lancamentos/"),
          fetch("https://victorrmendes.pythonanywhere.com/api/categorias/"),
        ]);
        setLancamentos(await resLanc.json());
        setCategorias(await resCat.json());
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // --- NAVEGAÇÃO DOS MESES ---
  const irParaMesAnterior = () => {
    if (mesAtual === 1) {
      setMesAtual(12);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const irParaProximoMes = () => {
    if (mesAtual === 12) {
      setMesAtual(1);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  const irParaHoje = () => {
    setMesAtual(new Date().getMonth() + 1);
    setAnoAtual(new Date().getFullYear());
  };

  // --- 1. CÁLCULO DO SALDO ACUMULADO (Tudo antes do mês selecionado) ---
  const lancamentosAnteriores = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    const ano = d.getFullYear();
    const mes = d.getMonth() + 1;
    // Pega tudo que for de anos anteriores, ou do mesmo ano mas meses anteriores
    return ano < anoAtual || (ano === anoAtual && mes < mesAtual);
  });

  const entradasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saidasAnteriores = lancamentosAnteriores.filter(l => l.tipo === "saida").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const creditosAnteriores = lancamentosAnteriores.filter(l => l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  
  // Esse é o dinheiro (ou dívida) que "sobrou" e rolou para o mês atual
  const saldoAcumuladoAnterior = entradasAnteriores - saidasAnteriores - creditosAnteriores;

  // --- 2. FILTRO DO MÊS ATUAL SELECIONADO ---
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
  });

  // --- 3. CÁLCULOS DOS CARDS RESUMO (Mês Selecionado) ---
  const totalEntradas = lancamentosFiltrados.filter((l) => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const totalSaidas = lancamentosFiltrados.filter((l) => l.tipo === "saida").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const totalCredito = lancamentosFiltrados.filter((l) => l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);

  // Resultado exclusivo deste mês (sem contar o passado)
  const resultadoDoMes = totalEntradas - totalSaidas - totalCredito;
  
  // Saldo Total Final (O que rolou do passado + O que aconteceu neste mês)
  const saldoTotalAcumulado = saldoAcumuladoAnterior + resultadoDoMes;

  // --- 4. CÁLCULOS PARA O GRÁFICO (Gastos do Mês) ---
  const gastos = lancamentosFiltrados.filter((l) => l.tipo === "saida" || l.tipo === "credito");
  
  const gastosPorCategoria = gastos.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor);
    return acc;
  }, {} as Record<number, number>);

  const dadosGrafico = Object.keys(gastosPorCategoria).map((catId) => {
    const categoriaInfo = categorias.find((c) => c.id === parseInt(catId));
    return {
      name: categoriaInfo ? categoriaInfo.nome : "Outros",
      value: gastosPorCategoria[parseInt(catId)],
    };
  }).sort((a, b) => b.value - a.value);

  const CORES = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  };

  if (loading) return <div className="text-slate-500 animate-pulse">Calculando suas finanças...</div>;

  return (
    <div className="max-w-6xl">
      {/* Cabeçalho com Filtro de Mês Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe o resumo das suas finanças neste período.</p>
        </div>

        {/* Componente de Navegação de Mês */}
        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl p-1 w-full md:w-auto justify-between">
          <button onClick={irParaMesAnterior} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center text-slate-700 font-semibold cursor-pointer hover:text-blue-600 transition" onClick={irParaHoje} title="Voltar para o mês atual">
            <Calendar size={16} className="text-blue-500" />
            <span>{MESES[mesAtual - 1]} {anoAtual}</span>
          </div>
          <button onClick={irParaProximoMes} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Entradas</p>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{formatarMoeda(totalEntradas)}</h3>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0"><ArrowUpCircle size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Saídas (Débito)</p>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{formatarMoeda(totalSaidas)}</h3>
            <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0"><ArrowDownCircle size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Fatura (Crédito)</p>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{formatarMoeda(totalCredito)}</h3>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600 shrink-0"><CreditCard size={20} /></div>
          </div>
        </div>

        {/* Novo Card de Saldo Acumulado */}
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${saldoTotalAcumulado >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Saldo Atual</p>
              <h3 className={`text-2xl font-bold ${saldoTotalAcumulado >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatarMoeda(saldoTotalAcumulado)}
              </h3>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${saldoTotalAcumulado >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
              <DollarSign size={20} />
            </div>
          </div>
          
          {/* Quebra detalhada do cálculo */}
          <div className="pt-3 mt-1 border-t border-slate-100">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Resultado do Mês:</span>
              <span className={`font-medium ${resultadoDoMes >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {resultadoDoMes > 0 ? '+' : ''}{formatarMoeda(resultadoDoMes)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Mês Anterior:</span>
              <span className={`font-medium ${saldoAcumuladoAnterior >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {saldoAcumuladoAnterior > 0 ? '+' : ''}{formatarMoeda(saldoAcumuladoAnterior)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Área dos Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Gastos por Categoria</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Não há gastos registrados em {MESES[mesAtual - 1]}.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dadosGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarMoeda(Number(value as number))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Maiores Despesas do Mês</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Sem despesas neste período.</p>
          ) : (
            <div className="space-y-4">
              {dadosGrafico.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES[index % CORES.length] }}></div>
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{formatarMoeda(item.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}