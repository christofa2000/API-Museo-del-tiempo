// src/app/layout.tsx
import type { ReactNode } from "react";
import ParticlesBg from "./components/backgrounds/ParticlesBg";
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
        {/* Background de partículas (queda detrás de todo) */}
        <ParticlesBg
          particleCount={300}
          particleSpread={12}
          speed={0.08}
          particleColors={["#9a8cff", "#b2a7ff"]}
          alphaParticles={true}
          particleBaseSize={80}
          sizeRandomness={0.8}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          className="fixed inset-0 z-0 pointer-events-none"
        />

        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
