"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Receipt, Landmark, CreditCard, PieChart, Tags, Menu, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Função auxiliar para os links (evita repetição de código)
const NavLinks = ({ closeMenu }: { closeMenu?: () => void }) => {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lancamentos", label: "Lançamentos", icon: Receipt },
    { href: "/categorias", label: "Categorias", icon: Tags },
    { href: "/bancos", label: "Bancos", icon: Landmark },
    { href: "/cartoes", label: "Cartões", icon: CreditCard },
    { href: "/relatorios", label: "Relatórios", icon: PieChart },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeMenu} // Fecha o menu no mobile se clicar
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
            pathname === link.href
              ? "bg-slate-800 text-blue-300 font-semibold"
              : "hover:bg-slate-800 text-slate-200"
          }`}
        >
          <link.icon size={18} />
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  );
};

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>("");
  
  const pathname = usePathname();
  const router = useRouter();

  // Busca o nome do usuário salvo no computador assim que o menu carrega ou a rota muda
  useEffect(() => {
    const nomeSalvo = localStorage.getItem("username");
    setUsername(nomeSalvo);
  }, [pathname]);

  // Função para deslogar atualizada para os novos tokens
  const handleSair = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      // Remove os DOIS tokens da nova arquitetura de segurança
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      
      setOpen(false); // Fecha o menu mobile se estiver aberto
      router.push("/login");
    }
  };

  // Se estiver na tela de login, esconde a barra lateral completamente
  if (pathname === "/login") return null;

  // Componente interno para o Rodapé do Usuário (reutilizado no mobile e desktop)
  const UserFooter = () => (
    <div className="mt-auto pt-4 border-t border-slate-800">
      <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <UserCircle size={24} className="text-blue-400 shrink-0" />
        <div className="flex flex-col truncate">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Logado como</span>
          <span className="text-sm font-semibold text-white truncate capitalize">
            {username || "Usuário"}
          </span>
        </div>
      </div>
      
      <button 
        onClick={handleSair}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition"
      >
        <LogOut size={18} />
        Sair da Conta
      </button>
    </div>
  );

  return (
    <>
      {/* 📱 VIEW MOBILE (Aparece em telas pequenas) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="text-lg font-bold text-blue-400">Meu Dinheiro</div>
        
        {/* Usamos o Sheet do Shadcn para o menu hambúrguer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          {/* Adicionamos flex e flex-col para o UserFooter ficar preso embaixo */}
          <SheetContent side="left" className="w-64 bg-slate-900 p-4 pt-6 border-slate-800 text-white flex flex-col h-full">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-blue-400 font-bold text-xl">Meu Dinheiro</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col gap-2">
              <NavLinks closeMenu={() => setOpen(false)} />
            </nav>

            <UserFooter />
          </SheetContent>
        </Sheet>
      </header>

      {/* 💻 VIEW DESKTOP (Barra lateral fixa, aparece em telas grandes) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen p-4 flex-col gap-2 fixed left-0 top-0 bottom-0">
        <div className="text-xl font-bold mb-8 px-4 text-blue-400 mt-4">
          Meu Dinheiro
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavLinks />
        </nav>

        <UserFooter />
      </aside>
    </>
  );
}