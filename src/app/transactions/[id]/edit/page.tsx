'use client';

import TransactionForm from '@/components/transactions/TransactionForm';
import { ITransaction } from '@/models/Transaction';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetchWithAuth(`/api/transactions/${id}`);
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Gagal memuat data transaksi.');
          }
          const data = await response.json();
          setTransaction(data.transaction);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransaction();
    } else {
      setIsLoading(false);
      setError("ID transaksi tidak tersedia.");
    }
  }, [id]);

  const handleTransactionUpdated = () => {
    router.push('/transactions');
  };

  if (isLoading) {
    return <p className="text-center py-8 text-sm text-[color:var(--muted)]">Memuat data transaksi…</p>;
  }

  if (error) {
    return (
      <div className="page-shell">
        <p>Error: {error}</p>
        <Link href="/transactions" className="link-accent mt-4 inline-block">
          Kembali ke transaksi
        </Link>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="page-shell">
        <p>Transaksi tidak ditemukan.</p>
        <Link href="/transactions" className="link-accent mt-4 inline-block">
          Kembali ke transaksi
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Transaksi</p>
        <h1 className="page-title text-3xl">Edit transaksi</h1>
        <p className="page-description mono">ID transaksi: {id}</p>
      </header>
      <TransactionForm
        onTransactionAdded={handleTransactionUpdated}
        isEditMode={true}
        initialData={transaction}
      />
    </div>
  );
}
