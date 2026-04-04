"use client";

import { useEffect, useState, useRef } from "react";
import { PieChart as ChartIcon, CalendarDays, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchWithAuth } from "@/lib/apiClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ... (Interfaces e estados permanecem os mesmos)

export default function RelatoriosPage() {
  // ... (Estados permanecem os mesmos)
  const [isExporting, setIsExporting] = useState(false);
  const relatorioRef = useRef<HTMLDivElement>(null);

  const exportarPDF = async () => {
    if (!relatorioRef.current) return;
    setIsExporting(true);

    try {
      const elemento = relatorioRef.current;
      
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
        // O SEGREDO ESTÁ AQUI: O 'onclone' permite limpar o CSS do documento clonado
        onclone: (clonedDoc) => {
          const container = clonedDoc.querySelector('[data-report-container="true"]') as HTMLElement;
          
          if (container) {
            // 1. Força cores seguras em todos os elementos para evitar o erro oklch
            const allElements = container.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              // Remove bordas e sombras que o Tailwind v4 gera com oklch
              htmlEl.style.boxShadow = "none";
              htmlEl.style.borderColor = "#e2e8f0";
              
              // Se o elemento for um texto, garante cor sólida
              const style = window.getComputedStyle(htmlEl);
              if (style.color.includes("oklch")) {
                 htmlEl.style.color = "#1e293b";
              }
            });

            // 2. Resolve o erro do Recharts (width -1)
            // Encontra os containers de gráfico e força um tamanho fixo no clone
            const charts = container.querySelectorAll('.recharts-responsive-container');
            charts.forEach((chart) => {
              (chart as HTMLElement).style.width = "800px";
              (chart as HTMLElement).style.height = "350px";
            });
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-${filtroPeriodo}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF. Certifique-se de usar cores sólidas (Hex/RGB).");
    } finally {
      setIsExporting(false);
    }
  };

  // ... (Lógica de filtragem e dados permanece a mesma)

  return (
    <div className="max-w-6xl">
      {/* Cabeçalho permanece igual */}
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold flex items-center gap-2">
           <ChartIcon className="text-blue-600" /> Relatórios
         </h1>
         <button 
           onClick={exportarPDF} 
           disabled={isExporting}
           className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
         >
           <Download size={18} /> {isExporting ? "Processando..." : "Baixar PDF"}
         </button>
      </div>

      {/* ÁREA DE CAPTURA - ADICIONADO DATA ATTRIBUTE E CORES HEXADECIMAIS MANUAIS */}
      <div 
        ref={relatorioRef} 
        data-report-container="true"
        className="p-6 rounded-2xl"
        style={{ 
          backgroundColor: '#f8fafc', // Hexadecimal (Seguro)
          color: '#1e293b'            // Hexadecimal (Seguro)
        }} 
      >
        {/* Título do Relatório no PDF */}
        <div className="mb-8 border-b pb-4" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            Relatório Financeiro - {filtroPeriodo.toUpperCase()}
          </h2>
          <p style={{ color: '#64748b' }}>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Entradas', valor: entradasPeriodo, cor: '#10b981' },
            { label: 'Gastos', valor: gastosPeriodo, cor: '#ef4444' },
            { label: 'Saldo', valor: saldoPeriodo, cor: '#3b82f6' },
            { label: 'Poupança', valor: `${taxaPoupanca}%`, cor: '#8b5cf6' }
          ].map((card, i) => (
            <div 
              key={i} 
              className="bg-white p-5 rounded-xl border" 
              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderLeft: `4px solid ${card.cor}` }}
            >
              <p className="text-xs font-bold uppercase mb-1" style={{ color: '#64748b' }}>{card.label}</p>
              <h3 className="text-xl font-bold" style={{ color: '#1e293b' }}>
                {typeof card.valor === 'number' ? formatarMoeda(card.valor) : card.valor}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categorias */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
            <h3 className="font-bold mb-4" style={{ color: '#1e293b' }}>Gastos por Categoria</h3>
            <div className="space-y-4">
              {dadosCategorias.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#475569' }}>{cat.nome}</span>
                    <span className="font-bold">{formatarMoeda(cat.valor)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${cat.porcentagem}%`, backgroundColor: '#3b82f6' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
            <h3 className="font-bold mb-4" style={{ color: '#1e293b' }}>Evolução Mensal</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {/* Cores fixas em Hexadecimal para as linhas */}
                  <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}