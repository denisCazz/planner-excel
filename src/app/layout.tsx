import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tabella Semplice — Editor facile come Excel",
  description:
    "Crea tabelle semplici con righe e colonne. Allineamento, grassetto, colori. Importa da Excel, salva in JSON.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} h-full overflow-x-hidden`}>
      <body className="min-h-full flex flex-col font-sans antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}
