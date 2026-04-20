'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  const registrationEnabled = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-240px)] w-full max-w-3xl items-center justify-center">
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className="section-card space-y-8">
          <div className="space-y-3">
            <p className="eyebrow">Daftar</p>
            <h1 className="page-title text-4xl">Buat akun untuk mulai bekerja.</h1>
            <p className="page-description">
              Siapkan akses baru dengan formulir yang ringkas, tipografi yang jelas, dan satu alur yang konsisten.
            </p>
          </div>

          {registrationEnabled ? (
            <RegisterForm />
          ) : (
            <div className="status-message">
              Pendaftaran publik sedang dinonaktifkan. Hubungi administrator jika Anda memerlukan akun baru.
            </div>
          )}

          <p className="text-sm text-[color:var(--ink-soft)]">
            Sudah punya akun?{' '}
            <Link href="/login" className="link-accent font-medium">
              Masuk
            </Link>
          </p>
        </section>

        <aside className="section-card-tight space-y-3 self-start">
          <p className="eyebrow">Akses baru</p>
          <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
            Gunakan email kerja aktif agar alur persetujuan dan pencatatan tetap rapi sejak awal.
          </p>
        </aside>
      </div>
    </div>
  );
}
