import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "MicroSaaS de Controle Financeiro Pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
  <Sidebar />

  <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </main>
</body>
    </html>
  );
}