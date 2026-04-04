"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Receipt, Landmark, CreditCard, 
  PieChart, Tags, Menu, UserCircle, LogOut, PiggyBank, 
  CalendarClock, Settings, User, ChevronRight, Wallet 
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchWithAuth } from "@/lib/apiClient";

const NavLinks = ({ closeMenu }: { closeMenu?: () => void }) => {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Painel Geral", icon: LayoutDashboard },
    { href: "/lancamentos", label: "Movimentações", icon: Receipt },
    { href: "/contas-pagar", label: "Compromissos", icon: CalendarClock },
    { href: "/caixinhas", label: "Investimentos", icon: PiggyBank }, 
    { href: "/cartoes", label: "Meus Cartões", icon: CreditCard },
    { href: "/bancos", label: "Instituições", icon: Landmark },
    { href: "/categorias", label: "Categorias", icon: Tags },
    { href: "/relatorios", label: "Análise Mensal", icon: PieChart },
    { href: "/perfil", label: "Minha Conta", icon: User },
  ];

  return (
    <nav className="flex flex-col gap-1.5 px-4 py-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
              isActive
                ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <link.icon size={18} className={isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"} />
              <span>{link.label}</span>
            </div>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
          </Link>
        );
      })}
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
    if (window.confirm("Deseja encerrar sua sessão bancária?")) {
      localStorage.clear();
      setOpen(false);
      router.push("/login");
    }
  };

  if (pathname === "/login" || pathname === "/redefinir-senha") return null;

  const UserFooter = () => (
    <div className="mt-auto p-4 space-y-4">
      <div className="px-4 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-500">
           <Wallet size={14} />
           <span className="text-[10px] font-black uppercase tracking-widest">Sessão Segura</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>

      <Link 
        href="/perfil" 
        onClick={() => setOpen(false)}
        className="group flex items-center gap-3 p-3 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
      >
        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10 group-hover:border-emerald-500/50 transition-all flex items-center justify-center">
          {userData?.foto ? (
            <img src={userData.foto} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={24} className="text-slate-600" />
          )}
        </div>
        
        <div className="flex flex-col truncate flex-1 text-left">
          <span className="text-sm font-bold text-white truncate capitalize">
            {userData?.username || "Titular"}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
            Configurações <ChevronRight size={10} />
          </span>
        </div>
      </Link>
      
      <button 
        onClick={handleSair}
        className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 transition-colors"
      >
        <LogOut size={14} />
        Encerrar Acesso
      </button>
    </div>
  );

  return (
    <>
      {/* HEADER MOBILE */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-white/5 flex items-center justify-between px-6 z-[50] backdrop-blur-md">
        <div className="text-lg font-black tracking-tighter text-white">
          FINANCE<span className="text-emerald-500">VM</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-white p-2 bg-slate-900 rounded-xl border border-white/5"><Menu size={24} /></button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-slate-950 p-0 border-r border-white/5 text-white flex flex-col h-full shadow-2xl">
            <div className="p-8">
              <SheetHeader className="text-left">
                <SheetTitle className="text-white font-black text-xl italic tracking-tighter">
                  FINANCE<span className="text-emerald-500">VM</span>
                </SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks closeMenu={() => setOpen(false)} />
            </div>
            <UserFooter />
          </SheetContent>
        </Sheet>
      </header>

      {/* ASIDE DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white h-screen flex-col fixed left-0 top-0 bottom-0 border-r border-white/5 shadow-2xl z-[40]">
        <div className="p-10">
          <div className="text-2xl font-black tracking-tighter text-white italic">
            FINANCE<span className="text-emerald-500">VM</span>
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