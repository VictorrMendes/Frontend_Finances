"use client";

import { useEffect, useState } from "react";
import { PieChart as ChartIcon, FileSpreadsheet, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

export default function RelatoriosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

  // --- NOVA FUNÇÃO DE EXPORTAÇÃO (Resolve o erro 401) ---
  const handleExportar = async () => {
    setIsExporting(true);
    try {
      // Usamos o fetchWithAuth para garantir que os cookies sejam enviados
      const res = await fetchWithAuth("/api/finance/exportar-excel/");
      
      if (!res.ok) {
        throw new Error("Falha na autenticação ou erro no servidor.");
      }

      // Converte a resposta em um arquivo (Blob)
      const blob = await res.blob();
      
      // Cria um link temporário na memória e força o download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "meus_lancamentos.xlsx"); // Nome do arquivo
      document.body.appendChild(link);
      link.click(); // Simula o clique do usuário
      
      // Limpa a memória
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Não foi possível exportar a planilha. Verifique se você está logado.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  };

  if (loading) return <div className="text-slate-500 animate-pulse p-8">Gerando relatórios...</div>;

  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  const lancamentosMesAtual = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
  });

  const entradasMes = lancamentosMesAtual
    .filter((l) => l.tipo === "entrada")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const gastosMes = lancamentosMesAtual
    .filter((l) => l.tipo === "saida" || l.tipo === "credito")
    .reduce((acc, l) => acc + parseFloat(l.valor), 0);

  const saldoMes = entradasMes - gastosMes;
  const taxaPoupanca = entradasMes > 0 ? ((saldoMes / entradasMes) * 100).toFixed(0) : "0";

  const gastosPorCategoria = lancamentosMesAtual
    .filter((l) => l.tipo === "saida" || l.tipo === "credito")
    .reduce((acc, l) => {
      acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor);
      return acc;
    }, {} as Record<number, number>);

  const dadosCategorias = Object.keys(gastosPorCategoria)
    .map((catId) => {
      const cat = categorias.find((c) => c.id === parseInt(catId));
      const valor = gastosPorCategoria[parseInt(catId)];
      const porcentagem = gastosMes > 0 ? (valor / gastosMes) * 100 : 0;
      return {
        nome: cat ? cat.nome : "Outros",
        valor,
        porcentagem,
      };
    })
    .sort((a, b) => b.valor - a.valor); 

  const maxGastoCategoria = dadosCategorias.length > 0 ? dadosCategorias[0].valor : 1;

  const trendData = [];
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

    trendData.push({
      name: nomeMes,
      Entradas: entradas,
      Gastos: gastos,
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ChartIcon className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-slate-800">Relatório Mensal</h1>
        </div>

        <button 
          onClick={handleExportar}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isExporting ? <Download className="animate-bounce" size={18} /> : <FileSpreadsheet size={18} />}
          {isExporting ? "Gerando Arquivo..." : "Exportar Planilha (Excel)"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Entradas</p>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(entradasMes)}</h3>
          <p className="text-xs text-slate-400 mt-1">no mês atual</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Gastos</p>
          <h3 className="text-xl font-bold text-slate-800">{formatarMoeda(gastosMes)}</h3>
          <p className="text-xs text-slate-400 mt-1">débito + crédito</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Taxa Poupança</p>
          <h3 className="text-xl font-bold text-blue-600">{taxaPoupanca}%</h3>
          <p className="text-xs text-slate-400 mt-1">do salário poupado</p>
        </div>
        <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 ${saldoMes >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Saldo Líquido</p>
          <h3 className={`text-xl font-bold ${saldoMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatarMoeda(saldoMes)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">resultado do mês</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Gastos por Categoria</h2>
          {dadosCategorias.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem gastos registrados neste mês.</p>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Tendência de 6 meses</h2>
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