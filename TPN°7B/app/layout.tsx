import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inicializa la fuente Inter (recomendada por Next.js)
const inter = Inter({ subsets: ["latin"] });

// Metadata del proyecto
export const metadata: Metadata = {
  title: "Next.js Network Monitor (Kafka Simulator)",
  description: "Real-time network monitoring application built with Next.js, TypeScript, and Recharts.",
};

// Componente Layout principal
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Header o Navbar */}
        
        {/*la página (page.tsx) */}
        {children}
        
        {/* Footer */}
      </body>
    </html>
  );
}