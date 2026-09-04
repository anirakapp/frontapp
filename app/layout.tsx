import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import "./styles/homepage.css";

export const metadata: Metadata = {
  title: "¿Cuánto Compro? — Calculá fácil para tu reunión",
  description:
    "Te ayudamos a saber cuánto comprar y dónde conseguirlo cerca tuyo.",
  icons: {
    icon: "favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}