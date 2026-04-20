'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { IItem } from '@/models/Item';
import { TransactionType } from '@/types/enums';
import { ITransaction } from '@/models/Transaction';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface TransactionFormProps {
  onTransactionAdded: () => void;
  isEditMode?: boolean;
  initialData?: ITransaction | null;
}

export default function TransactionForm({ onTransactionAdded, isEditMode = false, initialData = null }: TransactionFormProps) {
  const getItemIdFromData = (itemField: ITransaction['item'] | undefined): string => {
    if (!itemField) return '';
    if (typeof itemField === 'string') return itemField;
    return (itemField as IItem)._id?.toString() || '';
  };

  const [tanggal, setTanggal] = useState(initialData?.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [tipe, setTipe] = useState<TransactionType>(initialData?.tipe || TransactionType.PENJUALAN);
  const [customer, setCustomer] = useState(initialData?.customer || '');
  const [noSJ, setNoSJ] = useState(initialData?.noSJ || '');
  const [noInv, setNoInv] = useState(initialData?.noInv || '');
  const [noPO, setNoPO] = useState(initialData?.noPO || '');
  const [itemId, setItemId] = useState(getItemIdFromData(initialData?.item));
  const [berat, setBerat] = useState(initialData?.berat?.toString() || '');
  const [harga, setHarga] = useState(initialData?.harga?.toString() || '');
  const [noSJSby, setNoSJSby] = useState(initialData?.noSJSby || '');

  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemSearchResults, setItemSearchResults] = useState<IItem[]>([]);
  const [isLoadingItemSearch, setIsLoadingItemSearch] = useState(false);
  const [showItemSearchResults, setShowItemSearchResults] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string>('');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetchItems = (term: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchItemsForSearch(term);
    }, 300);
  };

  const fetchItemsForSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setItemSearchResults([]);
      setShowItemSearchResults(false);
      return;
    }
    setIsLoadingItemSearch(true);
    try {
      const response = await fetchWithAuth(`/api/items?search=${encodeURIComponent(searchTerm)}&limit=10`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal mencari barang.');
      }
      const data = await response.json();
      setItemSearchResults(data.items || []);
      setShowItemSearchResults(true);
    } catch (err) {
      console.error("Item search error:", err);
      setItemSearchResults([]);
    } finally {
      setIsLoadingItemSearch(false);
    }
  };

  const handleItemSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setItemSearchTerm(term);
    if (term) {
      debouncedFetchItems(term);
    } else {
      setItemSearchResults([]);
      setShowItemSearchResults(false);
    }
  };

  const handleSelectItem = (item: IItem) => {
    setItemId(item._id.toString());
    setSelectedItemName(item.namaBarang);
    setItemSearchTerm(item.namaBarang);
    setItemSearchResults([]);
    setShowItemSearchResults(false);
  };

  useEffect(() => {
    const loadInitialItemDetails = async () => {
      if (isEditMode && initialData?.item) {
        const currentItemId = getItemIdFromData(initialData.item);
        if (currentItemId) {
          if ((initialData.item as IItem)?.namaBarang) {
            setSelectedItemName((initialData.item as IItem).namaBarang);
            setItemSearchTerm((initialData.item as IItem).namaBarang);
            setItemId(currentItemId);
            setIsLoadingItems(false);
          } else {
            setIsLoadingItems(true);
            try {
              const response = await fetchWithAuth(`/api/items/${currentItemId}`);
              if (!response.ok) throw new Error('Gagal memuat detail barang untuk mode edit.');
              const data = await response.json();
              if (data.item) {
                setSelectedItemName(data.item.namaBarang);
                setItemSearchTerm(data.item.namaBarang);
                setItemId(data.item._id);
              }
            } catch (err) {
      setError('Detail barang untuk mode edit tidak dapat dimuat.');
              console.error(err);
            } finally {
              setIsLoadingItems(false);
            }
          }
        } else {
          setIsLoadingItems(false);
        }
      } else {
        setIsLoadingItems(false);
      }
    };
    loadInitialItemDetails();
  }, [isEditMode, initialData]);


  useEffect(() => {
    if (isEditMode && initialData) {
      setTanggal(initialData.tanggal ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setTipe(initialData.tipe || TransactionType.PENJUALAN);
      setCustomer(initialData.customer || '');
      setNoSJ(initialData.noSJ || '');
      setNoInv(initialData.noInv || '');
      setNoPO(initialData.noPO || '');
      setItemId(getItemIdFromData(initialData.item));
      setBerat(initialData.berat?.toString() || '');
      setHarga(initialData.harga?.toString() || '');
      setNoSJSby(initialData.noSJSby || '');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const beratNum = parseFloat(berat);
    const hargaNum = parseFloat(harga);

    if (!itemId) {
      setError('Pilih barang terlebih dahulu.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(beratNum) || beratNum <= 0) {
      setError('Berat harus berupa angka positif.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(hargaNum) || hargaNum < 0) {
      setError('Harga harus berupa angka nol atau lebih.');
      setIsSubmitting(false);
      return;
    }

    const transactionData = {
      tanggal, tipe, customer, noSJ, noInv, noPO, itemId,
      berat: beratNum, harga: hargaNum, noSJSby,
    };

    try {
      const url = isEditMode && initialData?._id ? `/api/transactions/${initialData._id}` : '/api/transactions';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${isEditMode ? 'Gagal memperbarui' : 'Gagal menambahkan'} transaksi.`);
      }

      setSuccessMessage(data.message || `Transaksi berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`);
      if (!isEditMode) {
        setTanggal(new Date().toISOString().split('T')[0]);
        setTipe(TransactionType.PENJUALAN);
        setCustomer(''); setNoSJ(''); setNoInv(''); setNoPO(''); setItemId('');
        setBerat(''); setHarga(''); setNoSJSby('');
      }
      onTransactionAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="section-card space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">{isEditMode ? 'Ubah transaksi' : 'Input transaksi'}</p>
        <h3 className="section-title">{isEditMode ? 'Perbarui transaksi' : 'Tambah transaksi baru'}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <label htmlFor="tanggal" className="form-label">Tanggal</label>
          <input type="date" id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="tipe" className="form-label">Tipe transaksi</label>
          <select id="tipe" value={tipe} onChange={(e) => setTipe(e.target.value as TransactionType)} required className="form-input" disabled={isSubmitting}>
            <option value={TransactionType.PENJUALAN}>Penjualan</option>
            <option value={TransactionType.PEMBELIAN}>Pembelian</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="customer" className="form-label">{tipe === TransactionType.PENJUALAN ? 'Customer' : 'Supplier'}</label>
          <input type="text" id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} required className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="noSJ" className="form-label">No. surat jalan</label>
          <input type="text" id="noSJ" value={noSJ} onChange={(e) => setNoSJ(e.target.value)} className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="noInv" className="form-label">No. invoice</label>
          <input type="text" id="noInv" value={noInv} onChange={(e) => setNoInv(e.target.value)} className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="noPO" className="form-label">No. PO</label>
          <input type="text" id="noPO" value={noPO} onChange={(e) => setNoPO(e.target.value)} className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="noSJSby" className="form-label">No. SJ SBY</label>
          <input type="text" id="noSJSby" value={noSJSby} onChange={(e) => setNoSJSby(e.target.value)} className="form-input" disabled={isSubmitting} />
        </div>

        <div className="md:col-span-2 relative">
          <label htmlFor="itemSearch" className="form-label">Barang</label>
          <input
            type="text"
            id="itemSearch"
            value={itemSearchTerm}
            onChange={handleItemSearchChange}
            onFocus={() => { if (itemSearchTerm && itemSearchResults.length > 0) setShowItemSearchResults(true); }}
            placeholder={isLoadingItems ? "Memuat barang…" : "Ketik nama barang…"}
            className="form-input"
            disabled={isSubmitting || isLoadingItems}
            required={!itemId}
          />
          {isLoadingItemSearch && <p className="form-helper">Mencari barang…</p>}

          {showItemSearchResults && itemSearchResults.length > 0 && (
            <ul className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)]">
              {itemSearchResults.map((item) => (
                <li
                  key={item._id.toString()}
                  onClick={() => handleSelectItem(item)}
                  className="cursor-pointer px-4 py-3 text-sm text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface)]"
                >
                  {item.namaBarang} (Stok: {item.stokSaatIni?.toFixed(2) ?? 'N/A'})
                </li>
              ))}
            </ul>
          )}
          {itemId && selectedItemName && !showItemSearchResults && (
            <p className="form-helper text-success">Terpilih: {selectedItemName}</p>
          )}
        </div>

        <div>
          <label htmlFor="berat" className="form-label">Berat (kg)</label>
          <input type="number" id="berat" value={berat} onChange={(e) => setBerat(e.target.value)} required min="0.01" step="any" className="form-input" disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="harga" className="form-label">Harga per kg</label>
          <input type="number" id="harga" value={harga} onChange={(e) => setHarga(e.target.value)} required min="0" step="any" className="form-input" disabled={isSubmitting} />
        </div>
      </div>

      {error && <div className="status-message status-danger">{error}</div>}
      {successMessage && <div className="status-message status-success">{successMessage}</div>}

      <button type="submit" disabled={isSubmitting || isLoadingItems} className="btn-primary w-full">
        {isSubmitting ? (isEditMode ? 'Menyimpan perubahan…' : 'Menyimpan transaksi…') : isEditMode ? 'Simpan perubahan' : 'Tambah transaksi'}
      </button>
    </form>
  );
}
