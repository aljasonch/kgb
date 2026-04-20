'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface IPaymentHistory {
  _id: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  paymentType: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface IReceivableData {
  customerName: string;
  initialReceivableBalance: number;
  totalSales: number;
  totalPaymentsReceived: number;
  finalReceivableBalance: number;
}

interface IPayableData {
  supplierName: string;
  initialPayableBalance: number;
  totalPurchases: number;
  totalPaymentsMade: number;
  finalPayableBalance: number;
}

interface CustomerLedgerPayload {
  customerName: string;
  initialReceivable?: number;
  initialPayable?: number;
}

type ActiveTab = 'receivable' | 'payable';

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('receivable');
  const [reportData, setReportData] = useState<IReceivableData[] | IPayableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterName, setFilterName] = useState('');
  const [debouncedFilterName, setDebouncedFilterName] = useState('');
  const [selectedCustomerForBalance, setSelectedCustomerForBalance] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<string[]>([]);
  const [isLoadingCustomerSearch, setIsLoadingCustomerSearch] = useState(false);
  const [showCustomerSearchResults, setShowCustomerSearchResults] = useState(false);
  const [initialBalanceValue, setInitialBalanceValue] = useState('');
  const [balanceFormError, setBalanceFormError] = useState<string | null>(null);
  const [balanceFormSuccess, setBalanceFormSuccess] = useState<string | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomerName, setPaymentCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [paymentFormSuccess, setPaymentFormSuccess] = useState<string | null>(null);

  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [paymentHistoryCustomerName, setPaymentHistoryCustomerName] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<IPaymentHistory[]>([]);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState<string | null>(null);

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const debounce = <T extends unknown[], R>(
    func: (...args: T) => Promise<R> | R,
    waitFor: number
  ) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: T): Promise<R> => {
      return new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterName(filterName);
    }, 500);
    return () => clearTimeout(timer);
  }, [filterName]);

  const fetchDistinctCustomersForSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomerSearchResults([]);
      setShowCustomerSearchResults(false);
      return;
    }
    setIsLoadingCustomerSearch(true);
    try {
      const response = await fetchWithAuth(`/api/distinct-customers?search=${encodeURIComponent(searchTerm)}&limit=10`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to search customers');
      }
      const data = await response.json();
      setCustomerSearchResults(data.customers || []);
      setShowCustomerSearchResults(true);
    } catch (err) {
      console.error("Customer search error:", err);
      setCustomerSearchResults([]);
      setError(err instanceof Error ? err.message : 'Failed to search customers');
    } finally {
      setIsLoadingCustomerSearch(false);
    }
  }, []);

  const debouncedFetchCustomers = useMemo(
    () => debounce<[string], void>((searchTerm: string) => {
      fetchDistinctCustomersForSearch(searchTerm);
    }, 500),
    [fetchDistinctCustomersForSearch]
  );

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('type', activeTab);
    if (filterName.trim()) {
      queryParams.append(
        activeTab === 'receivable' ? 'customerName' : 'supplierName',
        filterName.trim()
      );
    }
    window.location.href = `/api/export/accounts?${queryParams.toString()}`;
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const endpoint = activeTab === 'receivable' ? '/api/accounts/receivable' : '/api/accounts/payable';
    const queryParams = new URLSearchParams();
    if (debouncedFilterName) {
      queryParams.append(activeTab === 'receivable' ? 'customerName' : 'supplierName', debouncedFilterName);
    }

    try {
      const response = await fetchWithAuth(`${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch ${activeTab} data`);
      }
      const data = await response.json();
      setReportData(activeTab === 'receivable' ? data.receivableReport : data.payableReport);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedFilterName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearchTerm(term);
    setSelectedCustomerForBalance('');
    if (term.trim()) {
      debouncedFetchCustomers(term);
    } else {
      setCustomerSearchResults([]);
      setShowCustomerSearchResults(false);
    }
  };

  const handleSelectCustomerFromSearch = (customerName: string) => {
    setSelectedCustomerForBalance(customerName);
    setCustomerSearchTerm(customerName);
    setCustomerSearchResults([]);
    setShowCustomerSearchResults(false);
  };

  const handleSetInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceFormError(null);
    setBalanceFormSuccess(null);

    const customerToSet = selectedCustomerForBalance || customerSearchTerm.trim();
    if (!customerToSet) {
      setBalanceFormError('Masukkan nama Customer/Supplier.');
      return;
    }
    const balance = parseFloat(initialBalanceValue);
    if (isNaN(balance)) {
      setBalanceFormError('Nominal saldo awal harus berupa angka.');
      return;
    }

    const payload: CustomerLedgerPayload = { customerName: customerToSet };
    if (activeTab === 'receivable') {
      payload.initialReceivable = balance;
    } else {
      payload.initialPayable = balance;
    }

    try {
      const response = await fetchWithAuth('/api/customer-ledger', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan saldo awal.');
      }
      setBalanceFormSuccess(data.message || 'Saldo awal berhasil disimpan.');
      setSelectedCustomerForBalance('');
      setCustomerSearchTerm('');
      setInitialBalanceValue('');
      fetchData();
    } catch (err: unknown) {
      setBalanceFormError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  const fetchPaymentHistory = async (customerName: string) => {
    setIsLoadingPaymentHistory(true);
    setPaymentHistoryError(null);

    try {
      const paymentType = activeTab === 'receivable' ? 'receivable_payment' : 'payable_payment';
      const response = await fetchWithAuth(`/api/account-payments?customerName=${encodeURIComponent(customerName)}&paymentType=${paymentType}`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch payment history');
      }

      const data = await response.json();
      setPaymentHistory(data.payments || []);
    } catch (err: unknown) {
      setPaymentHistoryError(err instanceof Error ? err.message : 'Failed to fetch payment history');
      setPaymentHistory([]);
    } finally {
      setIsLoadingPaymentHistory(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, amount: number, notes: string) => {
    setIsUpdatingPayment(true);

    try {
      const response = await fetchWithAuth('/api/account-payments', {
        method: 'PUT',
        body: JSON.stringify({
          paymentId,
          amount,
          notes,
          paymentDate: editingDate || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update payment');
      }

      await fetchPaymentHistory(paymentHistoryCustomerName);
      await fetchData();

      setEditingPaymentId(null);
      setEditingAmount('');
      setEditingNotes('');
      setEditingDate('');
    } catch (err: unknown) {
      setPaymentHistoryError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleOpenPaymentHistory = (customerName: string) => {
    setPaymentHistoryCustomerName(customerName);
    setIsPaymentHistoryModalOpen(true);
    setPaymentHistoryError(null);
    fetchPaymentHistory(customerName);
  };

  const handleStartEditPayment = (payment: IPaymentHistory) => {
    setEditingPaymentId(payment._id);
    setEditingAmount(payment.amount.toString());
    setEditingNotes(payment.notes || '');
    try {
      const d = new Date(payment.paymentDate);
      setEditingDate(d.toISOString().split('T')[0]);
    } catch (_e) {
      setEditingDate('');
    }
  };

  const handleCancelEditPayment = () => {
    setEditingPaymentId(null);
    setEditingAmount('');
    setEditingNotes('');
    setEditingDate('');
    setPaymentHistoryError(null);
  };

  const handleSaveEditPayment = async () => {
    if (!editingPaymentId) return;

    const amount = parseFloat(editingAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentHistoryError('Jumlah pembayaran harus berupa angka positif.');
      return;
    }

    await handleUpdatePayment(editingPaymentId, amount, editingNotes);
  };

  const renderTable = () => {
    if (isLoading) return <p className="text-center py-4 text-sm text-[color:var(--muted)]">Memuat data…</p>;
    if (error) return <div className="status-message status-danger">Error: {error}</div>;
    if (reportData.length === 0) return <div className="empty-state">Tidak ada data ditemukan.</div>;

    const isReceivable = activeTab === 'receivable';
    const headers = isReceivable
      ? ["Customer", "Saldo Awal Piutang", "Total Penjualan", "Total Pembayaran Diterima", "Saldo Akhir Piutang", "Aksi"]
      : ["Supplier", "Saldo Awal Utang", "Total Pembelian", "Total Pembayaran Dilakukan", "Saldo Akhir Utang", "Aksi"];

    return (
      <div className="table-shell mt-6">
        <div className="table-scroll">
        <table className="min-w-full divide-y divide-[color:var(--border-color)] border border-[color:var(--border-color)]">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--muted)] uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-color)]">
            {reportData.map((item, index) => {
              const customerOrSupplierName = isReceivable ? (item as IReceivableData).customerName : (item as IPayableData).supplierName;
              return (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium text-[color:var(--foreground)]">
                    {customerOrSupplierName}
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--muted)]">
                    {isReceivable
                      ? ((item as IReceivableData).initialReceivableBalance ?? 0).toLocaleString('id-ID')
                      : ((item as IPayableData).initialPayableBalance ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--muted)]">
                    {isReceivable
                      ? ((item as IReceivableData).totalSales ?? 0).toLocaleString('id-ID')
                      : ((item as IPayableData).totalPurchases ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--muted)]">
                    {isReceivable
                      ? ((item as IReceivableData).totalPaymentsReceived ?? 0).toLocaleString('id-ID')
                      : ((item as IPayableData).totalPaymentsMade ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {isReceivable
                      ? ((item as IReceivableData).finalReceivableBalance ?? 0).toLocaleString('id-ID')
                      : ((item as IPayableData).finalPayableBalance ?? 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[color:var(--muted)]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenPaymentHistory(customerOrSupplierName)}
                        className="btn-secondary w-full sm:w-auto"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          setPaymentCustomerName(customerOrSupplierName);
                          setIsPaymentModalOpen(true);
                          setPaymentAmount('');
                          setPaymentDate(new Date().toISOString().split('T')[0]);
                          setPaymentNotes('');
                          setPaymentFormError(null);
                          setPaymentFormSuccess(null);
                        }}
                        className="btn-primary w-full sm:w-auto"
                      >
                        Input Pembayaran
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    );
  };

  const renderInitialBalanceForm = () => {
    return (
      <form onSubmit={handleSetInitialBalance} className="section-card space-y-4">
        <div className="space-y-2">
          <p className="eyebrow">Saldo awal</p>
          <h3 className="section-title">Atur saldo awal {activeTab === 'receivable' ? 'piutang' : 'utang'}</h3>
        </div>
        {error && <div className="status-message status-danger">{error}</div>}
        <div className="relative">
          <label htmlFor="customerSearchBalance" className="form-label">
            Customer atau supplier
          </label>
          <input
            type="text"
            id="customerSearchBalance"
            value={customerSearchTerm}
            onChange={handleCustomerSearchChange}
            onFocus={() => {
              if (customerSearchTerm.trim() && customerSearchResults.length > 0) {
                setShowCustomerSearchResults(true);
              }
            }}
            placeholder="Ketik untuk mencari atau masukkan nama baru"
            className="form-input"
          />
          {isLoadingCustomerSearch && <p className="mt-1 text-xs text-[color:var(--muted)]">Mencari...</p>}
          {showCustomerSearchResults && customerSearchResults.length > 0 && (
            <ul
              className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)]"
              onMouseLeave={() => setTimeout(() => setShowCustomerSearchResults(false), 200)}
            >
              {customerSearchResults.map((name) => (
                <li
                  key={name}
                  onClick={() => handleSelectCustomerFromSearch(name)}
                  className="cursor-pointer px-4 py-3 text-sm text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="initialBalance" className="form-label">
            Nominal saldo awal {activeTab === 'receivable' ? 'piutang' : 'utang'}
          </label>
          <input
            type="number"
            id="initialBalance"
            value={initialBalanceValue}
            onChange={(e) => setInitialBalanceValue(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {balanceFormError && <div className="status-message status-danger">{balanceFormError}</div>}
        {balanceFormSuccess && <div className="status-message status-success">{balanceFormSuccess}</div>}
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
        >
          Simpan Saldo Awal
        </button>
      </form>
    );
  }

  function renderPaymentHistoryModal() {
    if (!isPaymentHistoryModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
        onClick={() => setIsPaymentHistoryModalOpen(false)}>
        <div
          className="modal-sheet w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-[color:var(--border-color)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Riwayat Pembayaran</h3>
                  <p className="mt-1 break-words text-sm text-[color:var(--muted)]">
                    {activeTab === 'receivable' ? 'Riwayat Pembayaran Piutang' : 'Riwayat Pembayaran Utang'} - {paymentHistoryCustomerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentHistoryModalOpen(false)}
                className="p-2 hover:bg-[color:var(--surface)] cursor-pointer rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[color:var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6 overflow-y-auto max-h-[70vh] bg-[color:var(--background)]">
            {paymentHistoryError && (
              <div className="status-message status-danger mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[color:var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm">{paymentHistoryError}</p>
                </div>
              </div>
            )}

            {isLoadingPaymentHistory ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary)]"></div>
                <p className="mt-2 text-[color:var(--muted)]">Memuat riwayat pembayaran...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[color:var(--muted)]">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment._id} className="section-card-tight">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-4">
                          <div>
                            <p className="text-sm text-[color:var(--muted)]">Tanggal</p>
                            {editingPaymentId === payment._id ? (
                              <input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="px-2 py-1 text-sm border border-[color:var(--border-color)] rounded bg-[color:var(--card-bg)] text-[color:var(--foreground)]"
                              />
                            ) : (
                              <p className="font-medium text-[color:var(--foreground)]">
                                {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-[color:var(--muted)]">Jumlah</p>
                            {editingPaymentId === payment._id ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[color:var(--foreground)]">Rp</span>
                                <input
                                  type="number"
                                  value={editingAmount}
                                  onChange={(e) => setEditingAmount(e.target.value)}
                                  className="w-full sm:w-32 px-2 py-1 text-sm border border-[color:var(--border-color)] rounded bg-[color:var(--card-bg)] text-[color:var(--foreground)]"
                                  step="any"
                                  min="0.01"
                                />
                              </div>
                            ) : (
                              <p className="font-medium text-[color:var(--foreground)]">
                                Rp {payment.amount.toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-[color:var(--muted)]">Keterangan</p>
                            {editingPaymentId === payment._id ? (
                              <input
                                type="text"
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                placeholder="Tambahkan keterangan..."
                                className="w-full px-2 py-1 text-sm border border-[color:var(--border-color)] rounded bg-[color:var(--card-bg)] text-[color:var(--foreground)]"
                              />
                            ) : (
                              <p className="text-[color:var(--foreground)]">
                                {payment.notes || '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-[color:var(--muted)]">
                          Dibuat: {new Date(payment.createdAt).toLocaleString('id-ID')}
                          {payment.updatedAt !== payment.createdAt && (
                            <span> • Diubah: {new Date(payment.updatedAt).toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-0 w-full sm:ml-4 sm:w-auto">
                        {editingPaymentId === payment._id ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={handleSaveEditPayment}
                              disabled={isUpdatingPayment}
                              className="btn-primary"
                            >
                              {isUpdatingPayment ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                              onClick={handleCancelEditPayment}
                              disabled={isUpdatingPayment}
                              className="btn-secondary"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditPayment(payment)}
                            className="btn-secondary"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-[color:var(--card-bg)] border-t border-[color:var(--border-color)]">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setIsPaymentHistoryModalOpen(false)}
                className="btn-secondary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPaymentModal() {
    if (!isPaymentModalOpen) return null;

    const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPaymentFormError(null);
      setPaymentFormSuccess(null);

      const amountNum = parseFloat(paymentAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setPaymentFormError('Jumlah pembayaran harus angka positif.');
        return;
      }
      if (!paymentDate) {
        setPaymentFormError('Tanggal pembayaran harus diisi.');
        return;
      }

      const payload = {
        customerName: paymentCustomerName,
        paymentDate,
        amount: amountNum,
        paymentType: activeTab === 'receivable' ? 'receivable_payment' : 'payable_payment',
        notes: paymentNotes,
      };

      try {
        const response = await fetchWithAuth('/api/account-payments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Gagal menyimpan pembayaran.');
        }
        setPaymentFormSuccess(data.message || 'Pembayaran berhasil disimpan.');
        setIsPaymentModalOpen(false);
        fetchData();
      } catch (err: unknown) {
        setPaymentFormError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
        onClick={() => setIsPaymentModalOpen(false)}>
        <div
          className="modal-sheet w-full max-w-lg mx-4 overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-[color:var(--border-color)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="p-2 bg-opacity-10 rounded-lg">
                  💰
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Input Pembayaran</h3>
                  <p className="mt-1 break-words text-sm text-[color:var(--muted)]">
                    {activeTab === 'receivable' ? 'Pembayaran Piutang' : 'Pembayaran Utang'} untuk {paymentCustomerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-2 hover:bg-[color:var(--card-bg)] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-[color:var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <form id="paymentForm" onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="section-card-tight">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="p-2 bg-opacity-10 rounded-lg">
                    <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[color:var(--muted)]">
                      {activeTab === 'receivable' ? 'Customer' : 'Supplier'}
                    </p>
                    <p className="text-lg font-semibold text-[color:var(--foreground)]">
                      {paymentCustomerName}
                    </p>
                  </div>
                </div>
              </div>

              {paymentFormError && (
                <div className="status-message status-danger">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[color:var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm">{paymentFormError}</p>
                  </div>
                </div>
              )}

              {paymentFormSuccess && (
                <div className="status-message status-success">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[color:var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm">{paymentFormSuccess}</p>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="paymentAmount" className="text-sm font-medium text-[color:var(--foreground)] block mb-2">
                  Jumlah Pembayaran
                </label>
                <div className="flex items-center border border-[color:var(--border-color)] rounded-xl shadow-sm bg-[color:var(--card-bg)]">
                  <div className="flex items-center justify-center px-4 py-3 border-r border-[color:var(--border-color)]">
                    <span className="text-[color:var(--foreground)]">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="paymentAmount"
                    placeholder="Masukkan jumlah"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setPaymentFormError(null);
                    }}
                    className="w-full py-3 px-4 outline-none bg-transparent text-[color:var(--foreground)]"
                    step="any"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentDate" className="text-sm font-medium text-[color:var(--foreground)] block mb-2">
                  Tanggal Pembayaran
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="paymentDate"
                    value={paymentDate}
                    onChange={(e) => {
                      setPaymentDate(e.target.value);
                      setPaymentFormError(null);
                    }}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentNotes" className="text-sm font-medium text-[color:var(--foreground)] block mb-2">
                  Catatan <span className="text-[color:var(--muted)]">(Opsional)</span>
                </label>
                <textarea
                  id="paymentNotes"
                  placeholder="Tambahkan catatan pembayaran..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-4 bg-[color:var(--card-bg)] border-t border-[color:var(--border-color)]">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                form="paymentForm"
                type="submit"
                className="btn-primary"
              >
                Simpan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-header-row">
          <div className="space-y-2">
            <p className="eyebrow">Laporan</p>
            <h1 className="page-title">Piutang dan utang</h1>
            <p className="page-description">
              Laporan saldo awal, mutasi, dan pembayaran dari berbagai customer atau supplier.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary w-full sm:w-auto"
          >
            Ekspor ke Excel
          </button>
        </div>
      </header>

      <div className="border-b border-[color:var(--border-color)]">
        <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('receivable')}
            className={`${activeTab === 'receivable'
                ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:border-[color:var(--line-strong)] cursor-pointer'
              } py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Piutang
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`${activeTab === 'payable'
                ? 'border-[color:var(--primary)] text-[color:var(--primary)]'
                : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:border-[color:var(--line-strong)] cursor-pointer'
              } py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Utang
          </button>
        </nav>
      </div>

      <div className="toolbar-spread section-card-tight">
        <div className="flex-grow">
          <label htmlFor="nameFilter" className="form-label">
            Filter berdasarkan nama {activeTab === 'receivable' ? 'customer' : 'supplier'}
          </label>
          <input
            type="text"
            id="nameFilter"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder={`Cari ${activeTab === 'receivable' ? 'Customer' : 'Supplier'}...`}
            className="form-input"
          />
        </div>
        <button
          onClick={() => setDebouncedFilterName(filterName)}
          className="btn-primary"
        >
          Cari
        </button>
      </div>
      {renderInitialBalanceForm()}
      {renderTable()}
      {isPaymentModalOpen && renderPaymentModal()}
      {isPaymentHistoryModalOpen && renderPaymentHistoryModal()}
    </div>
  );
}
