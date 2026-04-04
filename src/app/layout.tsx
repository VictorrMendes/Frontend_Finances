// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanceVM",
  description: "Controle Financeiro Pessoal Inteligente",
  icons: {
    icon: '/icon-192x192.jpg', 
    apple: '/icon-192x192.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {/* Usamos flex-col para mobile (sidebar no topo ou oculta) e flex-row para desktop */}
        <div className="flex flex-col lg:flex-row min-h-screen w-full">
          
          <Sidebar />

          {/* O segredo da correção:
              1. No Mobile: pt-16 (para o conteúdo não ficar atrás do header fixo de 64px)
              2. No Desktop: lg:ml-64 (para o conteúdo começar exatamente onde a sidebar fixa termina)
          */}
          <main className="flex-1 w-full pt-16 lg:pt-0 lg:ml-64 flex flex-col">
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
          
        </div>
      </body>
    </html>
  );
}