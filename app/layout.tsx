import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "GarantíasApp — Gestiona tus garantías",
  description: "Registra y controla las garantías de todos tus productos en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
