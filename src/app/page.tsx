"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpCircle, ArrowDownCircle, CreditCard, DollarSign, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { fetchWithAuth } from "@/lib/apiClient"; // <-- IMPORTANTE: Usando seu novo cliente de API

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

  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  const router = useRouter();

  useEffect(() => {
    async function carregarDados() {
      // 1. Verificamos apenas a "bandeira" de login no localStorage
      const isLogged = localStorage.getItem("is_logged");

      if (!isLogged) {
        router.push("/login");
        return;
      }

      try {
        // 2. Usamos o fetchWithAuth que já envia os cookies automaticamente
        const [resLanc, resCat] = await Promise.all([
          fetchWithAuth("/api/lancamentos/"),
          fetchWithAuth("/api/categorias/"),
        ]);

        // 3. O fetchWithAuth já cuida do erro 401 internamente, 
        // mas garantimos a segurança aqui também.
        if (!resLanc.ok || !resCat.ok) {
           router.push("/login");
           return;
        }

        const dadosLancamentos = await resLanc.json();
        const dadosCategorias = await resCat.json();

        setLancamentos(Array.isArray(dadosLancamentos) ? dadosLancamentos : []);
        setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoading(false);
      }
    }
    carregarDados();
  }, [router]);

  // --- NAVEGAÇÃO DOS MESES (Lógica mantida igual) ---
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

  // --- CÁLCULOS (Lógica mantida igual) ---
  const lancamentosAnteriores = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    const ano = d.getFullYear();
    const mes = d.getMonth() + 1;
    return ano < anoAtual || (ano === anoAtual && mes < mesAtual);
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

  if (loading) return <div className="text-slate-500 animate-pulse flex justify-center py-20">Verificando acesso e carregando finanças...</div>;

  return (
    <div className="max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe o resumo das suas finanças.</p>
        </div>

        {/* Navegação de Mês */}
        <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-xl p-1 w-full md:w-auto justify-between">
          <button onClick={irParaMesAnterior} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center text-slate-700 font-semibold cursor-pointer" onClick={irParaHoje}>
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
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowUpCircle size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Saídas (Débito)</p>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{formatarMoeda(totalSaidas)}</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowDownCircle size={20} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Fatura (Crédito)</p>
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{formatarMoeda(totalCredito)}</h3>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><CreditCard size={20} /></div>
          </div>
        </div>

        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${saldoTotalAcumulado >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
            <p className="text-sm font-medium text-slate-500 mb-1">Saldo Atual</p>
            <div className="flex justify-between items-start">
              <h3 className={`text-2xl font-bold ${saldoTotalAcumulado >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatarMoeda(saldoTotalAcumulado)}
              </h3>
              <div className={`p-2 rounded-lg ${saldoTotalAcumulado >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}><DollarSign size={20} /></div>
            </div>
            <div className="pt-3 mt-1 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Resultado Mês:</span>
                  <span className={resultadoDoMes >= 0 ? 'text-emerald-500' : 'text-red-500'}>{formatarMoeda(resultadoDoMes)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Gastos por Categoria</h2>
          {dadosGrafico.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Sem gastos neste período.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
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
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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