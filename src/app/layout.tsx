import type { Metadata } from "next";
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientNav from "@/components/layout/ClientNav";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Stocklet | Manajemen Stok",
  description: "Aplikasi manajemen stok, transaksi, dan laporan bisnis.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body
        className={`${montserrat.className} ${montserrat.variable} ${ibmPlexMono.variable} min-h-screen antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
            <header className="sticky top-0 z-50">
              <ClientNav />
            </header>
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="page-shell animate-fadeIn">{children}</div>
            </main>
            <footer className="border-t border-[color:var(--border-color)] px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
                <p>Stocklet</p>
                <p className="mono text-xs">©2026 aljasonch. All Rights Reserved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
