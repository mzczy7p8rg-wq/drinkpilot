import type { Metadata } from "next";
import "./globals.css";

import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "DrinkPilot",
  description: "Descubre si el paquete de bebidas merece la pena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
