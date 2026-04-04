"use client";

import { useEffect, useState, useRef } from "react";
import { PieChart as ChartIcon, CalendarDays, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchWithAuth } from "@/lib/apiClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoFiltro>("6meses");
  const [isExporting, setIsExporting] = useState(false);
  
  const relatorioRef = useRef<HTMLDivElement>(null);

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

  const exportarPDF = async () => {
    if (!relatorioRef.current) return;
    setIsExporting(true);

    try {
      const elemento = relatorioRef.current;
      
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc", // Hexadecimal fix para oklch
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-financeiro-${filtroPeriodo}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Houve um erro ao gerar o PDF. Verifique o console.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="text-slate-500 animate-pulse flex justify-center py-20">Gerando relatórios...</div>;

  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  const data6MesesAtras = new Date();
  data6MesesAtras.setMonth(dataAtual.getMonth() - 5);
  data6MesesAtras.setDate(1);

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const d = new Date(l.data + "T00:00:00");
    if (filtroPeriodo === "mes") return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
    if (filtroPeriodo === "6meses") return d >= data6MesesAtras;
    if (filtroPeriodo === "ano") return d.getFullYear() === anoAtual;
    return true;
  });

  const entradasPeriodo = lancamentosFiltrados.filter((l) => l.tipo === "entrada").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const gastosPeriodo = lancamentosFiltrados.filter((l) => l.tipo === "saida" || l.tipo === "credito").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const investidoPeriodo = lancamentosFiltrados.filter((l) => l.tipo === "deposito_caixinha").reduce((acc, l) => acc + parseFloat(l.valor), 0);
  const saldoPeriodo = entradasPeriodo - gastosPeriodo;
  const taxaPoupanca = entradasPeriodo > 0 ? ((saldoPeriodo / entradasPeriodo) * 100).toFixed(0) : "0";

  const gastosPorCategoria = lancamentosFiltrados.filter((l) => l.tipo === "saida" || l.tipo === "credito").reduce((acc, l) => {
    const catId = l.categoria || 0; 
    acc[catId] = (acc[catId] || 0) + parseFloat(l.valor);
    return acc;
  }, {} as Record<number, number>);

  const dadosCategorias = Object.keys(gastosPorCategoria).map((catIdStr) => {
    const catId = parseInt(catIdStr);
    const cat = categorias.find((c) => c.id === catId);
    const valor = gastosPorCategoria[catId];
    return {
      nome: cat ? cat.nome : "Outros",
      valor,
      porcentagem: gastosPeriodo > 0 ? (valor / gastosPeriodo) * 100 : 0,
    };
  }).sort((a, b) => b.valor - a.valor); 

  const maxGastoCategoria = dadosCategorias.length > 0 ? dadosCategorias[0].valor : 1;

  const trendData = [];
  if (filtroPeriodo === "ano") {
    const mesesNomes = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    for (let i = 1; i <= 12; i++) {
      const lancMes = lancamentos.filter((l) => {
        const lDate = new Date(l.data + "T00:00:00");
        return lDate.getMonth() + 1 === i && lDate.getFullYear() === anoAtual;
      });
      trendData.push({ 
        name: mesesNomes[i-1], 
        Entradas: lancMes.filter(l => l.tipo === "entrada").reduce((sum, l) => sum + parseFloat(l.valor), 0),
        Gastos: lancMes.filter(l => l.tipo === "saida" || l.tipo === "credito").reduce((sum, l) => sum + parseFloat(l.valor), 0)
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; const y = d.getFullYear();
      const nomeMes = d.toLocaleString("pt-BR", { month: "short" }).toUpperCase();
      const lancMes = lancamentos.filter((l) => {
        const lDate = new Date(l.data + "T00:00:00");
        return lDate.getMonth() + 1 === m && lDate.getFullYear() === y;
      });
      trendData.push({ 
        name: nomeMes, 
        Entradas: lancMes.filter(l => l.tipo === "entrada").reduce((sum, l) => sum + parseFloat(l.valor), 0),
        Gastos: lancMes.filter(l => l.tipo === "saida" || l.tipo === "credito").reduce((sum, l) => sum + parseFloat(l.valor), 0)
      });
    }
  }

  const labelPeriodo = filtroPeriodo === "mes" ? "neste mês" : filtroPeriodo === "6meses" ? "em 6 meses" : "neste ano";

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ChartIcon className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold">Relatórios e Métricas</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportarPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Download size={18} />
            {isExporting ? "Gerando..." : "Baixar PDF"}
          </button>

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
      </div>

      {/* ÁREA DE CAPTURA - AJUSTE DE COR INLINE PARA EVITAR ERRO OKLCH */}
      <div 
        ref={relatorioRef} 
        className="bg-slate-50 rounded-2xl p-4 md:p-6"
        style={{ backgroundColor: '#f8fafc' }} 
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#1e293b' }}>
            Resumo Financeiro - {filtroPeriodo.toUpperCase()}
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Documento gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Total Entradas</p>
            <h3 className="text-xl font-bold" style={{ color: '#1e293b' }}>{formatarMoeda(entradasPeriodo)}</h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{labelPeriodo}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Total Gastos</p>
            <h3 className="text-xl font-bold" style={{ color: '#1e293b' }}>{formatarMoeda(gastosPeriodo)}</h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>débito + crédito ({labelPeriodo})</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Taxa Poupança</p>
            <h3 className="text-xl font-bold" style={{ color: '#2563eb' }}>{taxaPoupanca}%</h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>da receita poupada</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4" 
               style={{ backgroundColor: '#ffffff', borderLeftColor: saldoPeriodo >= 0 ? '#10b981' : '#ef4444' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Saldo Líquido</p>
            <h3 className="text-xl font-bold" style={{ color: saldoPeriodo >= 0 ? '#10b981' : '#ef4444' }}>
              {formatarMoeda(saldoPeriodo)}
            </h3>
            <p className="text-xs" style={{ color: '#94a3b8' }}>resultado {labelPeriodo}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#1e293b' }}>Gastos por Categoria</h2>
            {dadosCategorias.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Sem gastos registrados.</p>
            ) : (
              <div className="space-y-5">
                {dadosCategorias.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium" style={{ color: '#334155' }}>{item.nome}</span>
                      <span className="text-sm font-bold" style={{ color: '#1e293b' }}>{formatarMoeda(item.valor)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(item.valor / maxGastoCategoria) * 100}%`,
                            backgroundColor: '#3b82f6' 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs w-8 text-right" style={{ color: '#94a3b8' }}>{item.porcentagem.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#1e293b' }}>Tendência de Fluxo</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}