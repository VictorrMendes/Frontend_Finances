export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center">
      {children}
    </div>
  );
}