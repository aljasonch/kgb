'use client';

import ItemForm from '@/components/items/ItemForm';
import ItemsList from '@/components/items/ItemsList';
import { useState } from 'react';

export default function ItemsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Stok</p>
        <h1 className="page-title">Manajemen stok barang</h1>
        <p className="page-description">
          Tambahkan barang baru, cari item yang sudah ada, dan lakukan penyesuaian stok.
        </p>
      </header>

      <div className="split-layout">
        <div>
          <ItemForm onItemAdded={handleItemAdded} />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="eyebrow">Daftar Barang</p>
          </div>
          <ItemsList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
