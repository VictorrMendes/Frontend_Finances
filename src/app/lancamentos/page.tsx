"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, ArrowDownCircle, ArrowUpCircle, CreditCard as CardIcon, Trash2 } from "lucide-react";

// Interfaces baseadas no nosso backend Django
interface Categoria { id: number; nome: string; }
interface Banco { id: number; nome: string; }
interface Cartao { id: number; nome: string; }
interface Lancamento {
  id: number;
  tipo: "entrada" | "saida" | "credito";
  descricao: string;
  valor: string;
  data: string;
  categoria: number; // ID da categoria
  banco: number | null;
  cartao: number | null;
  parcelas: number;
  parcela_atual: number;
}

export default function LancamentosPage() {
  // Estados para as listas vindas da API
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [tipo, setTipo] = useState<"entrada" | "saida" | "credito">("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]); // Data de hoje
  const [categoriaId, setCategoriaId] = useState("");
  const [bancoId, setBancoId] = useState("");
  const [cartaoId, setCartaoId] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca todos os dados quando a página carrega
  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      // Fazemos as 4 buscas ao mesmo tempo para ser mais rápido
      const [resLanc, resCat, resBanc, resCart] = await Promise.all([
        fetch("https://victorrmendes.pythonanywhere.com/api/lancamentos/"),
        fetch("https://victorrmendes.pythonanywhere.com/api/categorias/"),
        fetch("https://victorrmendes.pythonanywhere.com/api/bancos/"),
        fetch("https://victorrmendes.pythonanywhere.com/api/cartoes/"),
      ]);

      setLancamentos(await resLanc.json());
      setCategorias(await resCat.json());
      setBancos(await resBanc.json());
      setCartoes(await resCart.json());
      
      setLoading(false);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      setLoading(false);
    }
  };

  const handleAdicionarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Monta o pacote de dados exato que o Django espera
    const payload = {
      tipo,
      descricao,
      valor,
      data,
      categoria: categoriaId ? parseInt(categoriaId) : null,
      banco: tipo !== "credito" && bancoId ? parseInt(bancoId) : null,
      cartao: tipo === "credito" && cartaoId ? parseInt(cartaoId) : null,
      parcelas: tipo === "credito" ? parseInt(parcelas) : 1,
      parcela_atual: 1,
    };

    try {
      const resposta = await fetch("https://victorrmendes.pythonanywhere.com/api/lancamentos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resposta.ok) {
        // Limpa form e atualiza lista
        setDescricao("");
        setValor("");
        carregarTudo(); 
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para deletar um lançamento
  const handleDeletarLancamento = async (id: number) => {
    // Pede uma confirmação rápida para evitar cliques acidentais
    if (!window.confirm("Tem certeza que deseja apagar este lançamento?")) return;

    try {
      const resposta = await fetch(`https://victorrmendes.pythonanywhere.com/api/lancamentos/${id}/`, {
        method: "DELETE",
      });

      if (resposta.ok) {
        carregarTudo(); // Recarrega a tabela automaticamente
      } else {
        console.error("Erro ao deletar lançamento.");
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  const formatarMoeda = (valor: string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(valor));
  };

  // Função auxiliar para achar o nome da categoria na lista
  const getNomeCategoria = (id: number) => categorias.find((c) => c.id === id)?.nome || "Sem categoria";

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Receipt className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Lançamentos</h1>
      </div>

      {/* Formulário de Novo Lançamento */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Novo lançamento</h2>
        <form onSubmit={handleAdicionarLancamento} className="space-y-4">
          
          {/* Linha 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "entrada" | "saida" | "credito")}
              >
                <option value="saida">Saída (Débito)</option>
                <option value="entrada">Entrada (Receita)</option>
                <option value="credito">Crédito (Cartão)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
              <input
                type="text" required placeholder="Ex: Mercado, Salário..."
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
              <input
                type="number" step="0.01" required placeholder="0.00"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={valor} onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          {/* Linha 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
              <input
                type="date" required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={data} onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
              <select
                required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {/* Renderização Condicional: Mostra Banco ou Cartão dependendo do Tipo */}
            {tipo === "credito" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Cartão</label>
                  <select
                    required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Parcelas</label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={parcelas} onChange={(e) => setParcelas(e.target.value)}
                  >
                    <option value="1">À vista (1x)</option>
                    {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Banco</label>
                <select
                  required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={bancoId} onChange={(e) => setBancoId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit" disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={18} />
              {isSubmitting ? "Salvando..." : "Adicionar lançamento"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Lançamentos Responsiva e Compacta para Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 text-sm md:text-base">
          Histórico de Lançamentos
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        ) : (
          <div className="overflow-x-auto">
            {/* Reduzimos o min-w e diminuimos a fonte no celular (text-xs) */}
            <table className="w-full text-left text-xs md:text-sm min-w-[450px] md:min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  {/* Trocamos p-4 por px-2 py-3 no mobile, md:p-4 nas telas maiores */}
                  <th className="px-2 py-3 md:p-4 font-medium">Data</th>
                  <th className="px-2 py-3 md:p-4 font-medium">Descrição</th>
                  <th className="px-2 py-3 md:p-4 font-medium">Categoria</th>
                  <th className="px-2 py-3 md:p-4 font-medium text-right">Valor</th>
                  <th className="px-2 py-3 md:p-4 font-medium text-center w-10 md:w-16">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum lançamento registrado.</td>
                  </tr>
                ) : (
                  // Invertemos a ordem para mostrar os mais novos primeiro
                  [...lancamentos].reverse().map((l) => (
                    <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-2 py-3 md:p-4 text-slate-500 whitespace-nowrap">
                        {new Date(l.data + "T00:00:00").toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-2 py-3 md:p-4 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          {l.tipo === 'entrada' && <ArrowUpCircle size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4" />}
                          {l.tipo === 'credito' && <CardIcon size={14} className="text-orange-500 shrink-0 md:w-4 md:h-4" />}
                          {l.tipo === 'saida' && <ArrowDownCircle size={14} className="text-red-500 shrink-0 md:w-4 md:h-4" />}
                          
                          {/* O truncate max-w evita que descrições gigantes quebrem o layout no mobile */}
                          <span className="truncate max-w-[120px] sm:max-w-none">{l.descricao}</span>
                          
                          {l.parcelas > 1 && (
                            <span className="text-[10px] md:text-xs text-slate-400 font-normal shrink-0">
                              ({l.parcela_atual}/{l.parcelas})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 md:p-4 text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-1 md:px-2 md:py-1 rounded-md text-[10px] md:text-xs whitespace-nowrap">
                          {getNomeCategoria(l.categoria)}
                        </span>
                      </td>
                      <td className={`px-2 py-3 md:p-4 text-right font-medium whitespace-nowrap ${l.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {l.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(l.valor)}
                      </td>
                      <td className="px-2 py-3 md:p-4 text-center">
                        <button 
                          onClick={() => handleDeletarLancamento(l.id)}
                          className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Excluir lançamento"
                        >
                          {/* Ícone um pouquinho menor no mobile */}
                          <Trash2 size={16} className="md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}