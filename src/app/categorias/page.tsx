"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <-- Importação do roteador
import { Tags, Plus, Tag, Trash2 } from "lucide-react";

interface Categoria {
  id: number;
  nome: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [novaCategoria, setNovaCategoria] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter(); // <-- Instância do roteador

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("https://victorrmendes.pythonanywhere.com/api/categorias/", {
      headers: {
        "Authorization": `Bearer ${token}` // <-- Crachá adicionado
      }
    })
      .then((resposta) => {
        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          throw new Error("Não autorizado");
        }
        return resposta.json();
      })
      .then((dados) => {
        setCategorias(dados);
        setLoading(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar categorias:", erro);
        setLoading(false);
      });
  };

  const handleAdicionarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const resposta = await fetch("https://victorrmendes.pythonanywhere.com/api/categorias/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <-- Crachá adicionado
        },
        body: JSON.stringify({ nome: novaCategoria }),
      });

      if (resposta.ok) {
        setNovaCategoria(""); // Limpa o campo
        fetchCategorias(); // Recarrega a lista
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nova Função de Deletar
  const handleDeletarCategoria = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const resposta = await fetch(`https://victorrmendes.pythonanywhere.com/api/categorias/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}` // <-- Crachá adicionado
        }
      });

      if (resposta.ok) {
        fetchCategorias(); // Recarrega a lista após apagar
      } else {
        alert("Erro ao excluir. Verifique se existem lançamentos usando esta categoria.");
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Tags className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Minhas Categorias</h1>
      </div>

      {/* Formulário (já responsivo flex-col no mobile) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Adicionar nova categoria</h2>
        <form onSubmit={handleAdicionarCategoria} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nome da Categoria</label>
            <input
              type="text"
              required
              placeholder="Ex: Assinaturas, Pets, Roupas..."
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !novaCategoria.trim()}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} />
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      </div>

      {/* Lista de Categorias no formato Grid */}
      {loading ? (
        <p className="text-slate-500 animate-pulse">Carregando categorias...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categorias.length === 0 ? (
            <p className="text-slate-500 col-span-full">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 hover:border-blue-300 transition group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                    <Tag size={18} />
                  </div>
                  <span className="font-medium text-slate-700 truncate">
                    {categoria.nome}
                  </span>
                </div>
                
                {/* Botão Lixeira */}
                <button
                  onClick={() => handleDeletarCategoria(categoria.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                  title="Excluir categoria"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}