'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const authenticatedLinks = [
  {
    href: '/items',
    label: 'Stok',
    description: 'Tambahkan barang baru, cek saldo stok, dan koreksi data barang tanpa gangguan visual.',
  },
  {
    href: '/transactions',
    label: 'Transaksi',
    description: 'Catat penjualan dan pembelian dengan formulir yang rapat, jelas, dan langsung ke inti.',
  },
  {
    href: '/reports/sales',
    label: 'Laporan',
    description: 'Buka penjualan, pembelian, stok, serta piutang dan utang dari satu alur kerja yang konsisten.',
  },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="page-shell min-h-[calc(100vh-220px)] justify-center">
      <section className="page-header border-b-0 pb-0">
        <div className="page-header-row">
          <div className="max-w-3xl">
            <h1 className="page-title">Satu tempat untuk stok, transaksi, dan laporan.</h1>
          </div>
        </div>
        <p className="page-description">
          Operasional harian yang lebih cepat, lebih teratur.
          Catat stok, proses transaksi, dan lihat laporan — semua dari satu dasbor yang bersih.
        </p>
      </section>

      {isLoading ? (
        <div className="section-card">
          <p className="text-sm text-[color:var(--muted)]">Memuat sesi Anda…</p>
        </div>
      ) : isAuthenticated ? (
        <>
          <section className="toolbar-spread">
            <div>
              <p className="eyebrow">Ruang utama</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {authenticatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="section-card flex h-full flex-col justify-between gap-6 transition-colors duration-150 hover:border-[color:var(--line-strong)]"
              >
                <div className="space-y-3">
                  <p className="eyebrow">{link.label}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    {link.label}
                  </h3>
                  <p className="text-sm leading-6 text-[color:var(--ink-soft)]">{link.description}</p>
                </div>
                <span className="link-accent text-sm font-medium">Buka halaman</span>
              </Link>
            ))}
          </section>
        </>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,360px)]">
          <div className="section-card space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Masuk untuk melanjutkan</p>
              <h2 className="section-title text-2xl">Antarmuka yang rapat, namun tidak terasa sesak.</h2>
              <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
                Masuk untuk mulai mencatat stok dan transaksi. Jika Anda baru melihat-lihat, struktur aplikasi
                tetap tersedia dengan fokus pada fungsi, bukan dekorasi.
              </p>
            </div>
            <div className="toolbar">
              <Link href="/login" className="btn-primary">
                Masuk
              </Link>
              <Link href="/items" className="btn-secondary">
                Lihat data stok
              </Link>
            </div>
          </div>

          <div className="section-card-tight space-y-3">
            <p className="eyebrow">Apa yang bisa dilakukan</p>
            <ul className="space-y-3 text-sm text-[color:var(--ink-soft)]">
              <li>Kelola nama barang dan saldo stok secara langsung.</li>
              <li>Catat penjualan dan pembelian tanpa berpindah pola layar.</li>
              <li>Buat laporan yang tetap nyaman dibaca meski datanya padat.</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
