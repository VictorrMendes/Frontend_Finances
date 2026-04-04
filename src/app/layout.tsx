import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50">
      {/* Sidebar aparece apenas aqui */}
      <Sidebar />
      
      {/* Conteúdo principal com as margens que você configurou */}
      <main className="flex-1 w-full pt-16 lg:pt-0 lg:ml-64 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}