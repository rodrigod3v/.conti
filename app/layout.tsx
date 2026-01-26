import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google"; // Import Manrope
import "./globals.css";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/main-layout"; // Import MainLayout

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" }); // Configure Manrope

export const metadata: Metadata = {
  title: ".conti",
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
          outfit.variable,
          manrope.variable // Add variable
        )}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
