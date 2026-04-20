'use client';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-240px)] w-full max-w-3xl items-center justify-center">
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className="section-card space-y-8">
          <div className="space-y-3">
            <p className="eyebrow">Masuk</p>
            <h1 className="page-title text-4xl">Akses ruang kerja Anda.</h1>
            <p className="page-description">
              Masukkan kredensial untuk melanjutkan ke stok, transaksi, dan laporan yang sudah dirapikan.
            </p>
          </div>
          <LoginForm />
          {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && (
            <p className="text-sm text-[color:var(--ink-soft)]">
              Belum punya akun?{' '}
              <Link href="/register" className="link-accent font-medium">
                Buat akun baru
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
