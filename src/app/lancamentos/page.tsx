"use client";

import { useEffect, useState } from "react";
import { 
  Receipt, Plus, ArrowDownCircle, ArrowUpCircle, CreditCard as CardIcon, 
  Trash2, PiggyBank, Reply, Edit2, X, Search, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { fetchWithAuth } from "@/lib/apiClient";

interface Categoria { id: number; nome: string; }
interface Banco { id: number; nome: string; }
interface Cartao { id: number; nome: string; }
interface Caixinha { id: number; nome: string; }

interface Lancamento {
  id: number;
  tipo: "entrada" | "saida" | "credito" | "deposito_caixinha" | "resgate_caixinha";
  descricao: string;
  valor: string;
  data: string;
  categoria: number;
  banco: number | null;
  cartao: number | null;
  caixinha: number | null;
  parcelas: number;
  parcela_atual: number;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function LancamentosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros e Busca
  const [busca, setBusca] = useState("");
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Estados do Formulário
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<"entrada" | "saida" | "credito" | "deposito_caixinha" | "resgate_caixinha">("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [categoriaId, setCategoriaId] = useState("");
  const [bancoId, setBancoId] = useState("");
  const [cartaoId, setCartaoId] = useState("");
  const [caixinhaId, setCaixinhaId] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      const [resLanc, resCat, resBanc, resCart, resCaix] = await Promise.all([
        fetchWithAuth("/api/lancamentos/"),
        fetchWithAuth("/api/categorias/"),
        fetchWithAuth("/api/bancos/"),
        fetchWithAuth("/api/cartoes/"),
        fetchWithAuth("/api/caixinhas/"),
      ]);

      if (resLanc.ok) setLancamentos(await resLanc.json());
      if (resCat.ok) setCategorias(await resCat.json());
      if (resBanc.ok) setBancos(await resBanc.json());
      if (resCart.ok) setCartoes(await resCart.json());
      if (resCaix.ok) setCaixinhas(await resCaix.json());
      
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setTipo("saida");
    setDescricao("");
    setValor("");
    setData(new Date().toISOString().split("T")[0]);
    setCategoriaId("");
    setBancoId("");
    setCartaoId("");
    setCaixinhaId("");
    setParcelas("1");
  };

  const handleSalvarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      tipo,
      descricao,
      valor: parseFloat(valor.replace(",", ".")), // Garante que o valor vá correto
      data,
      categoria: (tipo === "deposito_caixinha" || tipo === "resgate_caixinha") ? null : (categoriaId ? parseInt(categoriaId) : null),
      banco: (tipo === "saida" || tipo === "entrada" || tipo === "resgate_caixinha") && bancoId ? parseInt(bancoId) : null,
      cartao: tipo === "credito" && cartaoId ? parseInt(cartaoId) : null,
      caixinha: (tipo === "deposito_caixinha" || tipo === "resgate_caixinha") && caixinhaId ? parseInt(caixinhaId) : null,
      parcelas: tipo === "credito" ? parseInt(parcelas) : 1,
      parcela_atual: editandoId ? undefined : 1, // Na edição, não resetamos a parcela atual
    };

    try {
      const url = editandoId ? `/api/lancamentos/${editandoId}/` : "/api/lancamentos/";
      const method = editandoId ? "PATCH" : "POST";

      const resposta = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (resposta.ok) {
        limparFormulario();
        carregarTudo(); 
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    } finally {
      setIsSubmitting(false);
    }
  };

  const iniciarEdicao = (l: Lancamento) => {
    setEditandoId(l.id);
    setTipo(l.tipo);
    setDescricao(l.descricao);
    setValor(l.valor);
    setData(l.data);
    setCategoriaId(l.categoria?.toString() || "");
    setBancoId(l.banco?.toString() || "");
    setCartaoId(l.cartao?.toString() || "");
    setCaixinhaId(l.caixinha?.toString() || "");
    setParcelas(l.parcelas.toString());
    
    // Rola a tela suavemente para o topo onde está o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletarLancamento = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja apagar este lançamento?")) return;

    try {
      const resposta = await fetchWithAuth(`/api/lancamentos/${id}/`, {
        method: "DELETE",
      });
      if (resposta.ok) carregarTudo();
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  // --- Funções de Navegação de Data ---
  const irParaMesAnterior = () => {
    if (mesAtual === 1) { setMesAtual(12); setAnoAtual(anoAtual - 1); } 
    else { setMesAtual(mesAtual - 1); }
  };

  const irParaProximoMes = () => {
    if (mesAtual === 12) { setMesAtual(1); setAnoAtual(anoAtual + 1); } 
    else { setMesAtual(mesAtual + 1); }
  };

  // --- Filtros ---
  const lancamentosFiltrados = lancamentos.filter((l) => {
    // Filtro de Mês e Ano
    const d = new Date(l.data + "T00:00:00");
    const matchMesAno = d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
    
    // Filtro de Busca (Texto)
    const termoBusca = busca.toLowerCase();
    const matchBusca = l.descricao.toLowerCase().includes(termoBusca) || 
                       (getNomeCategoria(l.categoria).toLowerCase().includes(termoBusca));

    return matchMesAno && matchBusca;
  });

  const formatarMoeda = (valor: string | number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor));
  };

  const getNomeCategoria = (id: number) => categorias.find((c) => c.id === id)?.nome || "Sem categoria";

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Receipt size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Lançamentos</h1>
      </div>

      {/* PAINEL DO FORMULÁRIO (Novo ou Edição) */}
      <div className={`p-6 rounded-xl border shadow-sm mb-8 transition-colors ${editandoId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${editandoId ? 'text-amber-800' : 'text-slate-800'}`}>
            {editandoId ? <><Edit2 size={18} /> Editando Lançamento</> : 'Novo Lançamento'}
          </h2>
          {editandoId && (
            <button onClick={limparFormulario} className="text-sm font-medium text-slate-500 hover:text-red-500 flex items-center gap-1 transition">
              <X size={16} /> Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSalvarLancamento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tipo da Operação</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
              >
                <option value="saida">Saída (Débito)</option>
                <option value="entrada">Entrada (Receita)</option>
                <option value="credito">Crédito (Cartão)</option>
                <option value="deposito_caixinha" className="text-purple-600 font-bold">💰 Guardar na Caixinha</option>
                <option value="resgate_caixinha" className="text-blue-600 font-bold">🔄 Resgatar da Caixinha</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
              <input
                type="text" required 
                placeholder={(tipo === 'deposito_caixinha' || tipo === 'resgate_caixinha') ? "Ex: Reserva de emergência" : "Ex: Mercado, Salário..."}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={descricao} onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
              <input
                type="number" step="0.01" required placeholder="0.00"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={valor} onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data</label>
              <input
                type="date" required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={data} onChange={(e) => setData(e.target.value)}
              />
            </div>

            {/* CAMPOS ESPECÍFICOS POR TIPO */}
            {tipo === "deposito_caixinha" && (
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-purple-600 mb-1">Para qual Caixinha?</label>
                <select
                  required className="w-full p-2 border border-purple-300 bg-purple-50 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={caixinhaId} onChange={(e) => setCaixinhaId(e.target.value)}
                >
                  <option value="">Selecione o destino...</option>
                  {caixinhas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}

            {tipo === "resgate_caixinha" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-purple-600 mb-1">De qual Caixinha?</label>
                  <select
                    required className="w-full p-2 border border-purple-300 bg-purple-50 rounded-lg focus:ring-2 focus:ring-purple-500"
                    value={caixinhaId} onChange={(e) => setCaixinhaId(e.target.value)}
                  >
                    <option value="">Selecione a origem...</option>
                    {caixinhas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-600 mb-1">Vai para qual Banco?</label>
                  <select
                    required className="w-full p-2 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={bancoId} onChange={(e) => setBancoId(e.target.value)}
                  >
                    <option value="">Selecione o banco de destino...</option>
                    {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
              </>
            )}

            {tipo === "credito" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                  <select
                    required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Cartão</label>
                  <select
                    required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Parcelas</label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={parcelas} onChange={(e) => setParcelas(e.target.value)}
                  >
                    <option value="1">À vista (1x)</option>
                    {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
              </>
            )}

            {(tipo === "entrada" || tipo === "saida") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                  <select
                    required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Banco</label>
                  <select
                    required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={bancoId} onChange={(e) => setBancoId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit" disabled={isSubmitting}
              className={`text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-sm ${editandoId ? 'bg-amber-600 hover:bg-amber-700' : ((tipo === 'deposito_caixinha' || tipo === 'resgate_caixinha') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700')}`}
            >
              {editandoId ? <Edit2 size={18} /> : <Plus size={18} />}
              {isSubmitting ? "Salvando..." : (editandoId ? "Atualizar Lançamento" : "Adicionar Lançamento")}
            </button>
          </div>
        </form>
      </div>

      {/* ÁREA DA TABELA (COM FILTROS) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* CABEÇALHO DA TABELA (Pesquisa e Mês) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 w-full md:w-72 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar lançamento..." 
              className="w-full outline-none text-sm bg-transparent"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-lg p-1 w-full md:w-auto justify-between">
            <button onClick={irParaMesAnterior} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center text-sm text-slate-700 font-semibold cursor-pointer">
              <Calendar size={14} className="text-blue-500" />
              <span>{MESES[mesAtual - 1]} {anoAtual}</span>
            </div>
            <button onClick={irParaProximoMes} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition"><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* TABELA DE DADOS */}
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Carregando lançamentos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm min-w-[500px]">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Descrição</th>
                  <th className="px-4 py-3 font-semibold">Categoria / Origem</th>
                  <th className="px-4 py-3 font-semibold text-right">Valor</th>
                  <th className="px-4 py-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      {busca ? "Nenhum resultado encontrado para a sua busca." : "Nenhum lançamento registrado neste mês."}
                    </td>
                  </tr>
                ) : (
                  [...lancamentosFiltrados].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((l) => (
                    <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition group">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(l.data + "T00:00:00").toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          {l.tipo === 'entrada' && <ArrowUpCircle size={16} className="text-emerald-500 shrink-0" />}
                          {l.tipo === 'credito' && <CardIcon size={16} className="text-orange-500 shrink-0" />}
                          {l.tipo === 'saida' && <ArrowDownCircle size={16} className="text-red-500 shrink-0" />}
                          {l.tipo === 'deposito_caixinha' && <PiggyBank size={16} className="text-purple-500 shrink-0" />}
                          {l.tipo === 'resgate_caixinha' && <Reply size={16} className="text-blue-500 shrink-0" />}
                          
                          <span className="truncate max-w-[150px] sm:max-w-[250px]">{l.descricao}</span>
                          
                          {l.parcelas > 1 && (
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold shrink-0">
                              {l.parcela_atual}/{l.parcelas}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-medium whitespace-nowrap ${(l.tipo === 'deposito_caixinha' || l.tipo === 'resgate_caixinha') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {(l.tipo === 'deposito_caixinha' || l.tipo === 'resgate_caixinha') ? 'Caixinha' : getNomeCategoria(l.categoria)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${(l.tipo === 'entrada' || l.tipo === 'resgate_caixinha') ? 'text-emerald-600' : (l.tipo === 'deposito_caixinha' ? 'text-purple-600' : 'text-slate-800')}`}>
                        {(l.tipo === 'entrada' || l.tipo === 'resgate_caixinha') ? '+' : '-'}{formatarMoeda(l.valor)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => iniciarEdicao(l)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar lançamento"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeletarLancamento(l.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Excluir lançamento"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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