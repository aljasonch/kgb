'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { ITransaction } from '@/models/Transaction';
import { IItem } from '@/models/Item'; // To get item's name
import Link from 'next/link';

export default function ItemTransactionDetailsPage() {
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<IItem | null>(null);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setError('ID barang tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch item details (primarily for name)
        const itemResponse = await fetchWithAuth(`/api/items/${itemId}`);
        if (!itemResponse.ok) {
          const itemErrorData = await itemResponse.json();
          throw new Error(itemErrorData.message || 'Gagal memuat detail barang.');
        }
        const itemData = await itemResponse.json();
        setItem(itemData.item);

        // Fetch transactions for the item
        const transactionsResponse = await fetchWithAuth(`/api/items/${itemId}/transactions`);
        if (!transactionsResponse.ok) {
          const transErrorData = await transactionsResponse.json();
          throw new Error(transErrorData.message || 'Gagal memuat transaksi barang.');
        }
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.');
        setItem(null);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const themedTextMuted = "text-center py-4 text-sm text-[color:var(--muted)]";
  const themedTextError = "text-center text-sm text-[color:var(--danger)]";
  const thClasses = "px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider";
  const tdBaseClasses = "px-6 py-4 whitespace-nowrap text-sm";
  const tdTextMuted = `${tdBaseClasses} text-[color:var(--foreground)] opacity-75`;
  const tdTextEmphasized = `${tdBaseClasses} text-[color:var(--foreground)] font-medium`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-3 py-6">
        <div className="w-5 h-5 border-2 border-t-[color:var(--primary)] border-gray-200 rounded-full animate-spin"></div>
        <p className={themedTextMuted}>Memuat detail barang…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="status-message status-danger">
          <p className={themedTextError}>Error: {error}</p>
        </div>
        <Link href="/items" className="text-[color:var(--primary)] hover:underline">
          Kembali ke Daftar Barang
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4">
        <p className={themedTextMuted}>Barang tidak ditemukan.</p>
        <Link href="/items" className="text-[color:var(--primary)] hover:underline">
          Kembali ke Daftar Barang
        </Link>
      </div>
    );
  }
  
  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Detail barang</p>
        <h1 className="page-title text-3xl">Rincian transaksi untuk {item.namaBarang}</h1>
      </header>

      <div>
        <Link href="/items" className="text-[color:var(--primary)] hover:underline font-medium">
          &larr; Kembali ke Daftar Barang
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className={themedTextMuted}>Tidak ada transaksi ditemukan untuk barang ini.</p>
      ) : (
        <div className="table-shell">
          <div className="table-scroll">
            <table className="min-w-full divide-y divide-[color:var(--border-color)]">
              <thead>
                <tr>
                  <th scope="col" className={thClasses}>Tanggal</th>
                  <th scope="col" className={thClasses}>Tipe</th>
                  <th scope="col" className={thClasses}>Customer / Supplier</th>
                  <th scope="col" className={thClasses}>No. SJ</th>
                  <th scope="col" className={thClasses}>No. Inv</th>
                  <th scope="col" className={`${thClasses} text-right`}>Berat (kg)</th>
                  <th scope="col" className={`${thClasses} text-right`}>Harga</th>
                  <th scope="col" className={`${thClasses} text-right`}>Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-color)]">
                {transactions.map((tx) => (
                  <tr key={tx._id as string} className="transition-colors duration-150">
                    <td className={tdTextMuted}>{new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className={`${tdBaseClasses}`}>
                      <span className="table-chip">
                        {tx.tipe}
                      </span>
                    </td>
                    <td className={tdTextEmphasized}>{tx.customer}</td>
                    <td className={tdTextMuted}>{tx.noSJ || '-'}</td>
                    <td className={tdTextMuted}>{tx.noInv || '-'}</td>
                    <td className={`${tdTextMuted} text-right`}>{tx.berat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={`${tdTextMuted} text-right`}>{tx.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                    <td className={`${tdTextEmphasized} text-right`}>{tx.totalHarga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
