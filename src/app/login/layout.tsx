export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center overflow-x-hidden relative">
      {/* Este container garante que o fundo escuro ocupe 100% da viewport.
         Ele ignora qualquer padding ou margem que venha de layouts superiores.
      */}
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}