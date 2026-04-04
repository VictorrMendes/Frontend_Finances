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
    <nav className="flex flex-col gap-1 px-4 py-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeMenu}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
            pathname === link.href
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          <link.icon size={18} />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<{username: string, email: string, foto?: string} | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const publicRoutes = ["/login", "/redefinir-senha", "/recuperar-senha"];
    if (publicRoutes.includes(pathname)) return;

    async function carregarPerfil() {
      try {
        const res = await fetchWithAuth("/api/usuarios/perfil/");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            username: data.username,
            email: data.email,
            foto: data.perfil?.foto_url 
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
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

  if (pathname === "/login" || pathname === "/redefinir-senha") return null;

  const UserFooter = () => (
    <div className="mt-auto p-4 border-t border-slate-800 space-y-3">
      <Link 
        href="/perfil" 
        onClick={() => setOpen(false)}
        className="group flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border-2 border-slate-600 group-hover:border-blue-500 transition-all flex items-center justify-center">
          {userData?.foto ? (
            <img src={userData.foto} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={24} className="text-slate-400" />
          )}
        </div>
        
        <div className="flex flex-col truncate flex-1 text-left">
          <span className="text-sm font-bold text-white truncate capitalize">
            {userData?.username || "Usuário"}
          </span>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-blue-300">
            <Settings size={10} /> Ver Perfil
          </span>
        </div>
      </Link>
      
      <button 
        onClick={handleSair}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );

  return (
    <>
      {/* HEADER MOBILE (FIXO NO TOPO) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-white/5 flex items-center justify-between px-4 z-[50]">
        <div className="text-lg font-black tracking-tighter text-white italic">
          FINANCE<span className="text-blue-500">VM</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2 bg-slate-900 rounded-lg"><Menu size={24} /></button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-950 p-0 border-r border-white/5 text-white flex flex-col h-full">
            <div className="p-6">
              <SheetHeader className="text-left">
                <SheetTitle className="text-white font-black text-xl italic">FINANCE<span className="text-blue-500">VM</span></SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks closeMenu={() => setOpen(false)} />
            </div>
            <UserFooter />
          </SheetContent>
        </Sheet>
      </header>

      {/* ASIDE DESKTOP (FIXO NA ESQUERDA) */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white h-screen flex-col fixed left-0 top-0 bottom-0 border-r border-white/5 shadow-2xl z-[40]">
        <div className="p-8">
          <div className="text-2xl font-black tracking-tighter text-white italic">
            FINANCE<span className="text-blue-500">VM</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <UserFooter />
      </aside>
    </>
  );
}