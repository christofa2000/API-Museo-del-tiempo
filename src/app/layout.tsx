// src/app/layout.tsx
import type { ReactNode } from "react";
import Header from "./components/Header";
import "./globals.css";

export const metadata = {
  title: "Museo del Tiempo",
  description: "Arte, historia y música por década.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="relative min-h-dvh overflow-x-hidden text-white">
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
