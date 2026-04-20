'use client';

import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionsList from '@/components/transactions/TransactionsList';
import { useState } from 'react';

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Transaksi</p>
        <h1 className="page-title">Manajemen transaksi</h1>
        <p className="page-description">
          Catat transaksi penjualan dan pembelian dari customer ataupun supplier.
        </p>
      </header>

      <div className="split-layout">
        <div className="min-w-0">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </div>
        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            <p className="eyebrow">Daftar transaksi</p>
          </div>
          <TransactionsList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
