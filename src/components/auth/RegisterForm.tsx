'use client';

import { useState, FormEvent } from 'react';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sama.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal.');
      }

      setSuccessMessage(`${data.message} Anda bisa langsung masuk setelah ini.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email-register" className="form-label">
          Email
        </label>
        <input
          id="email-register"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="nama@perusahaan.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password-register" className="form-label">
          Kata sandi
        </label>
        <input
          id="password-register"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="form-label">
          Konfirmasi kata sandi
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </div>

      {error && <div className="status-message status-danger">{error}</div>}
      {successMessage && <div className="status-message status-success">{successMessage}</div>}

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? 'Mendaftarkan akun…' : 'Daftar'}
      </button>
    </form>
  );
}
