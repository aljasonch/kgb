'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Masuk gagal.');
      }

      if (data.user) {
        login(data.user);
        window.location.href = '/';
      } else {
        throw new Error('Masuk berhasil, tetapi data pengguna tidak tersedia.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="nama@perusahaan.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="Masukkan kata sandi"
        />
      </div>

      {error && <div className="status-message status-danger">{error}</div>}

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  );
}
