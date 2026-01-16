'use client';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
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
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Enter your credentials to continue
          </p>
        </div>

        <LoginForm />

        {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && (
          <p className="text-center text-sm text-[color:var(--muted)] mt-6">
            Don’t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-hover)] hover:underline transition duration-150"
            >
              Sign up
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}