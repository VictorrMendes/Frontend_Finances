"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Verifica se a rota atual começa com /login
  const isLoginPage = pathname?.startsWith("/login");

  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} antialiased`}>
        {isLoginPage ? (
          // Se for login, não renderiza Sidebar nem classes de fundo global
          // Deixa o layout da pasta /login controlar o visual total
          <main>{children}</main>
        ) : (
          // Estrutura do Dashboard para todas as outras páginas
          <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50 text-slate-900">
            <Sidebar />
            <main className="flex-1 w-full pt-16 lg:pt-0 lg:ml-64 flex flex-col">
              <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}