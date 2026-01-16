'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  const cardClasses = "group block p-6 card hover:border-[color:var(--primary)] hover:bg-[color:var(--surface-highlight)] h-full flex flex-col relative overflow-hidden";
  const cardTitleClasses = "mb-3 text-2xl font-bold tracking-tight text-[color:var(--primary)] group-hover:text-[color:var(--accent)] transition-colors";
  const cardTextClasses = "font-normal text-[color:var(--muted)] group-hover:text-[color:var(--foreground)] transition-colors flex-grow";

  const commonLinks = [
    { href: "/items", title: "Stok", text: "Kelola daftar barang dan pantau stok terkini." },
    { href: "/transactions", title: "Transaksi", text: "Catat semua transaksi penjualan dan pembelian." },
    { href: "/reports/sales", title: "Laporan", text: "Analisis data penjualan dengan filter lengkap." }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="text-center max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] sm:text-7xl md:text-7xl mb-8 drop-shadow-lg">
          <span className="block text-[color:var(--primary)]">Stocklet</span>
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-[color:var(--muted)] mb-12 max-w-2xl mx-auto">
          Aplikasi untuk mengelola stok, mencatat transaksi, dan membuat laporan bisnis secara mudah dan praktis.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-t-[color:var(--primary)] border-[color:var(--border-color)] rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">Loading...</p>
          </div>
        ) : (
          <>
            {isAuthenticated ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {commonLinks.map(link => (
                  <Link key={link.href} href={link.href} className="block h-full w-full transform transition-all duration-300 hover:-translate-y-2">
                    <div className={cardClasses}>
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[color:var(--primary)] opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                      <h5 className={cardTitleClasses}>{link.title}</h5>
                      <p className={cardTextClasses}>{link.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Link href="/login" className="transform transition-all duration-300 hover:-translate-y-2">
                  <div className={cardClasses}>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[color:var(--primary)] opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                    <h5 className={cardTitleClasses}>Login</h5>
                    <p className={cardTextClasses}>Login untuk mulai mengelola bisnis kamu.</p>
                  </div>
                </Link>
                {commonLinks.slice(0, 1).map(link => (
                  <Link key={link.href} href={link.href} className="transform transition-all duration-300 hover:-translate-y-2">
                    <div className={cardClasses}>
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[color:var(--primary)] opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                      <h5 className={cardTitleClasses}>{link.title}</h5>
                      <p className={cardTextClasses}>{link.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}