"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Para saber qual link está ativo
import { LayoutDashboard, Receipt, Landmark, CreditCard, PieChart, Tags, Menu } from "lucide-react";
import { useState } from "react";
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
          <SheetContent side="left" className="w-64 bg-slate-900 p-4 pt-6 border-slate-800 text-white">
            {/* Adicionamos este bloco aqui para resolver o erro: */}
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-blue-400 font-bold text-xl">Meu Dinheiro</SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col gap-2">
              <NavLinks closeMenu={() => setOpen(false)} />
            </nav>
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
      </aside>
    </>
  );
}