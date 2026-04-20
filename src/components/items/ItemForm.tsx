'use client';

import { useState, FormEvent } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface ItemFormProps {
  onItemAdded: () => void;
}

export default function ItemForm({ onItemAdded }: ItemFormProps) {
  const [namaBarang, setNamaBarang] = useState('');
  const [stokAwal, setStokAwal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!namaBarang.trim() || !stokAwal.trim()) {
      setError('Nama barang dan stok awal wajib diisi.');
      setIsLoading(false);
      return;
    }

    const stokAwalNum = parseFloat(stokAwal);
    if (isNaN(stokAwalNum) || stokAwalNum < 0) {
      setError('Stok awal harus berupa angka nol atau lebih.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/items', {
        method: 'POST',
        body: JSON.stringify({ namaBarang, stokAwal: stokAwalNum }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menambahkan barang.');
      }

      setSuccessMessage(data.message || 'Barang berhasil ditambahkan.');
      setNamaBarang('');
      setStokAwal('');
      onItemAdded();
    } catch (err: unknown) { 
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="section-card space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Input</p>
        <h3 className="section-title">Tambah barang baru</h3>
      </div>
      <div>
        <label htmlFor="namaBarang" className="form-label">
          Nama Barang
        </label>
        <input
          type="text"
          name="namaBarang"
          id="namaBarang"
          required
          value={namaBarang}
          onChange={(e) => setNamaBarang(e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="stokAwal" className="form-label">
          Stok Awal
        </label>
        <input
          type="number"
          name="stokAwal"
          id="stokAwal"
          required
          value={stokAwal}
          onChange={(e) => setStokAwal(e.target.value)}
          min="0"
          step="any"
          className="form-input"
          disabled={isLoading}
        />
      </div>
      {error && <div className="status-message status-danger">{error}</div>}
      {successMessage && <div className="status-message status-success">{successMessage}</div>}
      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? 'Menyimpan barang…' : 'Tambah barang'}
      </button>
    </form>
  );
}
