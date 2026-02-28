import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EcoZelo Higienização - Agendamento Online",
  description:
    "Higienização e impermeabilização de estofados residencial e automotivo. Agende online de forma rápida e prática!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "16px",
              fontSize: "14px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
