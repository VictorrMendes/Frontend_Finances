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
  const isLoginPage = pathname === "/login";

  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-900 antialiased overflow-x-hidden`}>
        {isLoginPage ? (
          // Se for login, renderiza apenas o conteúdo (sem sidebar, sem margens)
          <main className="w-full min-h-screen">
            {children}
          </main>
        ) : (
          // Se não for login, renderiza a estrutura completa com Sidebar
          <div className="flex flex-col lg:flex-row min-h-screen w-full">
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