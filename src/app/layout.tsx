import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EcoZelo Higienização - Agendamento Online",
  description:
    "Higienização e impermeabilização de estofados residencial e automotivo em Cambé e Ibiporã - PR. Agende online de forma rápida e prática!",
  keywords: ["higienização", "estofados", "limpeza", "impermeabilização", "Cambé", "Ibiporã", "EcoZelo"],
  openGraph: {
    title: "EcoZelo Higienização - Agendamento Online",
    description: "Higienização e impermeabilização de estofados. Agende online!",
    type: "website",
    locale: "pt_BR",
    siteName: "EcoZelo Higienização",
  },
  icons: {
    icon: "/logo-ecozelo.svg",
    apple: "/logo-ecozelo.svg",
  },
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
