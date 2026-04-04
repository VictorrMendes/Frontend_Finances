"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Receipt, Landmark, CreditCard, 
  PieChart, Tags, Menu, UserCircle, LogOut, PiggyBank, CalendarClock, Settings, User 
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchWithAuth } from "@/lib/apiClient";

const NavLinks = ({ closeMenu }: { closeMenu?: () => void }) => {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lancamentos", label: "Lançamentos", icon: Receipt },
    { href: "/contas-pagar", label: "Contas a Pagar", icon: CalendarClock },
    { href: "/caixinhas", label: "Caixinhas", icon: PiggyBank }, 
    { href: "/cartoes", label: "Cartões", icon: CreditCard },
    { href: "/bancos", label: "Bancos", icon: Landmark },
    { href: "/categorias", label: "Categorias", icon: Tags },
    { href: "/relatorios", label: "Relatórios", icon: PieChart },
    { href: "/perfil", label: "Meu Perfil", icon: User },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeMenu}
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
  const [userData, setUserData] = useState<{username: string, email: string, foto?: string} | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await fetchWithAuth("/api/usuarios/perfil/");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            username: data.username,
            email: data.email,
            // Atualizado para usar foto_url
            foto: data.perfil?.foto_url 
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil no sidebar:", error);
      }
    }
    carregarPerfil();
  }, [pathname]);

  const handleSair = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("is_logged");
      localStorage.removeItem("username");
      setOpen(false);
      router.push("/login");
    }
  };

  if (pathname === "/login" || pathname === "/redefinir-senha" || pathname === "/recuperar-senha") return null;

  const UserFooter = () => (
    <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
      <Link 
        href="/perfil" 
        onClick={() => setOpen(false)}
        className="group flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600 group-hover:border-blue-400 transition-colors flex items-center justify-center">
          {userData?.foto ? (
            <img src={userData.foto} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={24} className="text-slate-400" />
          )}
        </div>
        
        <div className="flex flex-col truncate flex-1">
          <span className="text-sm font-semibold text-white truncate capitalize">
            {userData?.username || "Carregando..."}
          </span>
          <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1 group-hover:text-blue-300 transition-colors">
            <Settings size={10} /> Editar Perfil
          </span>
        </div>
      </Link>
      
      <button 
        onClick={handleSair}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group"
      >
        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
        Sair
      </button>
    </div>
  );

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="text-lg font-bold text-blue-400">FinanceVM</div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-slate-900 p-4 pt-6 border-slate-800 text-white flex flex-col h-full">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-blue-400 font-bold text-xl">FinanceVM</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
              <NavLinks closeMenu={() => setOpen(false)} />
            </nav>

            <UserFooter />
          </SheetContent>
        </Sheet>
      </header>

      <aside className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen p-4 flex-col fixed left-0 top-0 bottom-0 border-r border-slate-800 shadow-2xl">
        <div className="text-xl font-bold mb-8 px-4 text-blue-400 mt-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base">F</div>
          FinanceVM
        </div>
        
        <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
          <NavLinks />
        </nav>

        <UserFooter />
      </aside>
    </>
  );
}