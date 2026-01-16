'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  const registrationEnabled = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true';

  return (
    <div
      className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn"
    >
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[color:var(--primary)] tracking-tight">
            Stocklet
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-[color:var(--foreground)]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Fill in your details to get started
          </p>
        </div>

        {registrationEnabled ? (
          <RegisterForm />
        ) : (
          <div className="text-center rounded-lg bg-[color:var(--background-secondary)] p-6 border border-[color:var(--border)]">
            <p className="text-base text-[color:var(--foreground)]">
              Public registration is currently disabled.
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Please contact an administrator if you need an account.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-[color:var(--muted)] mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-hover)] hover:underline transition duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}