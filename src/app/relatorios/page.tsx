"use client";

import { useEffect, useState, useRef } from "react";
import { PieChart as ChartIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchWithAuth } from "@/lib/apiClient";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const reportRef = useRef<HTMLDivElement>(null);

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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const baixarPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2, // melhora qualidade
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const largura = 210;
    const altura = (canvas.height * largura) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, largura, altura);
    pdf.save("relatorio-financeiro.pdf");
  };

  if (loading)
    return <div className="text-slate-500 animate-pulse">Gerando relatórios...</div>;

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
  const taxaPoupanca =
    entradasMes > 0 ? ((saldoMes / entradasMes) * 100).toFixed(0) : "0";

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

  const maxGastoCategoria =
    dadosCategorias.length > 0 ? dadosCategorias[0].valor : 1;

  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);

    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const nomeMes = d
      .toLocaleString("pt-BR", { month: "short" })
      .toUpperCase();

    const lancMes = lancamentos.filter((l) => {
      const lDate = new Date(l.data + "T00:00:00");
      return lDate.getMonth() + 1 === m && lDate.getFullYear() === y;
    });

    const entradas = lancMes
      .filter((l) => l.tipo === "entrada")
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    const gastos = lancMes
      .filter((l) => l.tipo === "saida" || l.tipo === "credito")
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    trendData.push({
      name: nomeMes,
      Entradas: entradas,
      Gastos: gastos,
    });
  }

  return (
    <div className="max-w-6xl">
      {/* BOTÃO PDF */}
      <button
        onClick={baixarPDF}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Baixar PDF
      </button>

      {/* CONTEÚDO DO RELATÓRIO */}
      <div ref={reportRef} className="bg-white p-4">
        <div className="flex items-center gap-3 mb-8">
          <ChartIcon className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold">Relatório Mensal</h1>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card title="Total Entradas" value={formatarMoeda(entradasMes)} color="emerald" />
          <Card title="Total Gastos" value={formatarMoeda(gastosMes)} color="red" />
          <Card title="Taxa Poupança" value={`${taxaPoupanca}%`} color="blue" />
          <Card
            title="Saldo Líquido"
            value={formatarMoeda(saldoMes)}
            color={saldoMes >= 0 ? "emerald" : "red"}
          />
        </div>

        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Tendência de 6 meses
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatarMoeda(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="Entradas" stroke="#10b981" />
                <Line type="monotone" dataKey="Gastos" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTE CARD */
function Card({ title, value, color }: any) {
  return (
    <div
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-${color}-500`}
    >
      <p className="text-xs text-slate-500">{title}</p>
      <h3 className={`text-xl font-bold text-${color}-600`}>
        {value}
      </h3>
    </div>
  );
}