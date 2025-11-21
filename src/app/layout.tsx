import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ClientNav from "@/components/layout/ClientNav";
import ThemeToggle from "@/components/layout/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stocklet",
  description: "Aplikasi manajemen stok barang sederhana.",
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
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider>
          <AuthProvider>
            <header className="sticky top-0 z-50">
              <ClientNav />
            </header>
            <main className="container mx-auto p-6 mt-8 flex-grow animate-fadeIn">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <footer
              className="text-center py-8 mt-auto text-sm border-t border-[color:var(--border-color)]"
              style={{
                backgroundColor: 'var(--surface)',
                backdropFilter: 'blur(8px)',
                color: 'var(--muted)',
              }}
            >
              <p className="font-medium">
                &copy; {new Date().getFullYear()} Stocklet Beta. All rights reserved.
              </p>
              <p className="text-xs mt-1 text-muted">
                Created by aljasonch
              </p>
            </footer>
            <ThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
