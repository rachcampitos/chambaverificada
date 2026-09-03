import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "chambaverificada — Verifica una oferta antes de postular",
  description:
    "Pega una oferta de trabajo y revisa señales de riesgo antes de postular: empresa verificable, salario de mercado, sin pedidos de datos bancarios por adelantado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
