import "./globals.css";
import type { Metadata } from "next";

// Favicon e preview de link (Open Graph/Twitter Card) usam o mesmo emblema
// do Pastor Daniel de Castro -- favicon.png/favicon-32.png são recortes
// redondos do emblema em si; og-image.png é uma versão maior, em formato
// paisagem (1200x630, padrão pra preview de link no WhatsApp/redes
// sociais), com o mesmo emblema ao lado do nome "Geração de Daniel".
export const metadata: Metadata = {
  metadataBase: new URL("https://geracao.pulsodf.com.br"),
  title: "Geração de Daniel",
  description: "Juntos por fé, família e propósito. Junte-se à Geração de Daniel.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Geração de Daniel",
    description: "Juntos por fé, família e propósito.",
    url: "https://geracao.pulsodf.com.br",
    siteName: "Geração de Daniel",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pastor Daniel de Castro — Geração de Daniel",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Geração de Daniel",
    description: "Juntos por fé, família e propósito.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
