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
  themeColor: "#0f172a", // Slate-900 para combinar com o novo design
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex flex-col lg:flex-row min-h-screen">
          <Sidebar />
          {/* O margin-left 64 só deve existir se a sidebar existir. 
              Como a sidebar some no login, o conteúdo deve ocupar a tela toda */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}