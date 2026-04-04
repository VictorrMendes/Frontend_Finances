"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Save, Loader2 } from "lucide-react";

export default function PerfilPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://victorrmendes.pythonanywhere.com";

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/perfil/`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        if (data.perfil?.foto) setPreview(data.perfil.foto);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("email", userData.email);
    formData.append("telefone", userData.perfil?.telefone || "");
    if (fotoFile) formData.append("foto", fotoFile);

    try {
      const res = await fetch(`${API_URL}/api/usuarios/perfil/`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        alert("Perfil atualizado com sucesso!");
        // Força reload para atualizar Sidebar se necessário
        window.location.reload(); 
      }
    } catch (error) {
       console.error("Erro ao salvar:", error);
       alert("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando perfil...</div>;

  // Proteção contra a "Tela Branca" se a API falhar
  if (!userData) {
    return (
      <div className="p-8 text-center mt-10">
        <h2 className="text-xl text-red-500 font-bold mb-2">Ops! Algo deu errado.</h2>
        <p className="text-slate-600">Não foi possível carregar seus dados. Tente fazer login novamente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 mt-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Meu Perfil</h1>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 bg-slate-100 rounded-full overflow-hidden border-4 border-white shadow-md">
            {preview ? (
              <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="m-8 text-slate-300" />
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
              <Camera size={16} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFotoFile(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }} 
              />
            </label>
          </div>
          <p className="text-sm text-slate-500">Clique no ícone para alterar a foto</p>
        </div>

        {/* Dados do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
            <input type="text" disabled value={userData.username || ""} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={userData.email || ""} 
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}