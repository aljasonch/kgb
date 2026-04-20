'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const reportLinks = [
  { href: '/reports/sales', label: 'Penjualan' },
  { href: '/reports/purchases', label: 'Pembelian' },
  { href: '/reports/items', label: 'Stok' },
  { href: '/reports/accounts', label: 'Piutang & Utang' },
];

export default function ClientNav() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  const [isMobileReportsOpen, setIsMobileReportsOpen] = useState(false);
  const reportsMenuRef = useRef<HTMLDivElement | null>(null);
  const isReportsRoute = pathname.startsWith('/reports');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsMobileReportsOpen(isReportsRoute);
  }, [pathname, isReportsRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reportsMenuRef.current && !reportsMenuRef.current.contains(event.target as Node)) {
        setIsReportsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const baseLinkClass =
    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200';

  const navLinkClass = (active: boolean) =>
    `${baseLinkClass} ${
      active
        ? 'bg-[color:var(--accent-soft)] text-[color:var(--primary)]'
        : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
    }`;

  const mobileLinkClass = (active: boolean) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-[color:var(--accent-soft)] text-[color:var(--primary)]'
        : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
    }`;

  const mobileSidebarLinkClass = (active: boolean) =>
    `${navLinkClass(active)} w-full justify-start px-4 py-3`;

  return (
    <nav className="border-b border-[color:var(--border-color)] bg-[color:var(--background)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <Link href="/" className="min-w-0">
            <span className="block text-xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
              Stocklet
            </span>
            <span className="eyebrow hidden sm:block">Operasional stok</span>
          </Link>
        </div>

        {isMounted && (
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Link href="/" className={navLinkClass(pathname === '/')}>
              Beranda
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/items" className={navLinkClass(pathname === '/items' || pathname.startsWith('/items/'))}>
                  Stok
                </Link>
                <Link href="/transactions" className={navLinkClass(pathname === '/transactions' || pathname.startsWith('/transactions/'))}>
                  Transaksi
                </Link>
                <div
                  ref={reportsMenuRef}
                  className="relative"
                  onMouseEnter={() => setIsReportsMenuOpen(true)}
                  onMouseLeave={() => setIsReportsMenuOpen(false)}
                >
                  <Link
                    href="/reports/sales"
                    className={navLinkClass(isReportsRoute)}
                    aria-expanded={isReportsMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span>Laporan</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${isReportsMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                    </svg>
                  </Link>

                  <div
                    className={`absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)] p-2 transition-all duration-200 ${
                      isReportsMenuOpen
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {reportLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={mobileLinkClass(pathname === link.href)}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <span className="text-sm text-[color:var(--muted)]">Memuat sesi…</span>
          ) : isAuthenticated ? (
            <button onClick={logout} type="button" className="btn-secondary">
              Keluar
            </button>
          ) : (
            <>
              {pathname !== '/login' && (
                <Link href="/login" className="btn-secondary">
                  Masuk
                </Link>
              )}
              {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && pathname !== '/register' && (
                <Link href="/register" className="btn-primary">
                  Daftar
                </Link>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--foreground)] transition-all duration-200 hover:bg-[color:var(--surface)] md:hidden"
          aria-label="Buka navigasi"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-sidebar-nav"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isMounted && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-[rgba(24,23,19,0.28)] transition-opacity duration-200 md:hidden ${
              isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            id="mobile-sidebar-nav"
            className={`fixed inset-y-0 right-0 z-50 flex w-[min(88vw,360px)] flex-col border-l border-[color:var(--border-color)] bg-[color:var(--background)] p-4 transition-transform duration-200 md:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-label="Navigasi mobile"
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-3">
              <div>
                <p className="text-base font-semibold text-[color:var(--foreground)]">Navigasi</p>
                <p className="eyebrow">Menu</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--foreground)] transition-colors duration-200 hover:bg-[color:var(--surface)]"
                aria-label="Tutup navigasi"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto pb-4">
              <Link href="/" className={mobileSidebarLinkClass(pathname === '/')} onClick={() => setIsMobileMenuOpen(false)}>
                Beranda
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/items"
                    className={mobileSidebarLinkClass(pathname === '/items' || pathname.startsWith('/items/'))}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Stok
                  </Link>
                  <Link
                    href="/transactions"
                    className={mobileSidebarLinkClass(pathname === '/transactions' || pathname.startsWith('/transactions/'))}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Transaksi
                  </Link>

                  <div className="overflow-hidden rounded-2xl">
                    <Link
                      href="/reports/sales"
                      className={`${mobileSidebarLinkClass(isReportsRoute || isMobileReportsOpen)} w-full justify-between rounded-none bg-transparent`}
                      aria-expanded={isMobileReportsOpen}
                      aria-haspopup="menu"
                      onClick={(event) => {
                        if (isReportsRoute) {
                          event.preventDefault();
                          setIsMobileReportsOpen((open) => !open);
                          return;
                        }

                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span>Laporan</span>
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${isMobileReportsOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                      </svg>
                    </Link>

                    <div
                      className={`grid transition-all duration-200 ${
                        isMobileReportsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 p-2">
                          {reportLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`${mobileSidebarLinkClass(pathname === link.href)} pl-8`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-[color:var(--border-color)] pt-4">
              {isLoading ? (
                <span className="px-4 py-2 text-sm text-[color:var(--muted)]">Memuat sesi…</span>
              ) : isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  type="button"
                  className="btn-secondary w-full"
                >
                  Keluar
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {pathname !== '/login' && (
                    <Link href="/login" className="btn-secondary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      Masuk
                    </Link>
                  )}
                  {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && pathname !== '/register' && (
                    <Link href="/register" className="btn-primary w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      Daftar
                    </Link>
                  )}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </nav>
  );
}
