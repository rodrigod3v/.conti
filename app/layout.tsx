import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Contábil Gestão - Sistema de Controle",
  description: "Gerencie arquivos e contabilidade com facilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-neutral-50 font-sans antialiased dark:bg-neutral-900",
          outfit.variable
        )}
      >
        <Sidebar />
        <main className="min-h-screen p-8 transition-all sm:ml-64">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
