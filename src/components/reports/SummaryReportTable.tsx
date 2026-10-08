'use client';

import { Fragment, useEffect, useState } from 'react';

interface SummaryRow {
  _id: string;
  totalBerat: number;
  totalNilai: number;
}

export interface CustomerItemRow {
  _id: string;
  namaBarang: string;
  totalBerat: number;
  totalNilai: number;
  count: number;
}

interface SummaryReportTableProps {
  data: SummaryRow[];
  isLoading: boolean;
  error?: string | null;
  tipe: 'PENJUALAN' | 'PEMBELIAN';
  onFetchCustomerItems?: (customer: string) => Promise<CustomerItemRow[]>;
}

export default function SummaryReportTable({
  data,
  isLoading,
  error,
  tipe,
  onFetchCustomerItems,
}: SummaryReportTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [detailsCache, setDetailsCache] = useState<Record<string, CustomerItemRow[]>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [errorRows, setErrorRows] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setExpandedRows({});
    setDetailsCache({});
    setLoadingRows({});
    setErrorRows({});
  }, [data, tipe]);

  const handleToggle = async (customer: string) => {
    const isExpanded = !!expandedRows[customer];
    if (isExpanded) {
      setExpandedRows((prev) => ({ ...prev, [customer]: false }));
      return;
    }

    setExpandedRows((prev) => ({ ...prev, [customer]: true }));

    if (detailsCache[customer] || loadingRows[customer] || !onFetchCustomerItems) {
      return;
    }

    setLoadingRows((prev) => ({ ...prev, [customer]: true }));
    setErrorRows((prev) => ({ ...prev, [customer]: null }));

    try {
      const items = await onFetchCustomerItems(customer);
      setDetailsCache((prev) => ({ ...prev, [customer]: items }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat rincian barang';
      setErrorRows((prev) => ({ ...prev, [customer]: message }));
    } finally {
      setLoadingRows((prev) => ({ ...prev, [customer]: false }));
    }
  };

  const themedTextMuted = 'text-center py-4 text-sm text-[color:var(--muted)]';
  if (isLoading) {
    return <p className={themedTextMuted}>Memuat ringkasan…</p>;
  }

  if (error) {
    return (
      <div className="status-message status-danger">Error: {error}</div>
    );
  }

  if (data.length === 0) {
    return <div className="empty-state">Tidak ada data {tipe.toLowerCase()} untuk filter yang dipilih.</div>;
  }

  const totalBerat = data.reduce((sum, row) => sum + row.totalBerat, 0);
  const totalNilai = data.reduce((sum, row) => sum + row.totalNilai, 0);

  const thClasses =
    'px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider';
  const tdBaseClasses = 'px-6 py-4 text-sm';
  const tdTextMuted = `${tdBaseClasses} text-[color:var(--foreground)] opacity-75`;
  const tdTextEmphasized = `${tdBaseClasses} text-[color:var(--foreground)] font-medium`;
  const tfootTdClasses =
    'px-6 py-3 text-xs font-bold text-[color:var(--foreground)] uppercase tracking-wider';

  return (
    <div className="table-shell mt-6">
      <div className="table-scroll">
        <table className="min-w-full divide-y divide-[color:var(--border-color)]">
          <thead>
            <tr>
              <th scope="col" className={thClasses}>
                {tipe === 'PENJUALAN' ? 'Customer' : 'Supplier'}
              </th>
              <th scope="col" className={`${thClasses} text-right`}>Total Berat (kg)</th>
              <th scope="col" className={`${thClasses} text-right`}>Total Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-color)]">
            {data.map((row) => {
              const customerKey = row._id;
              const isExpanded = !!expandedRows[customerKey];
              const isLoadingDetail = !!loadingRows[customerKey];
              const detailError = errorRows[customerKey];
              const items = detailsCache[customerKey] || [];

              return (
                <Fragment key={row._id || 'unknown'}>
                  <tr className="transition-colors duration-150">
                    <td className={tdTextEmphasized}>
                      {onFetchCustomerItems ? (
                        <button
                          type="button"
                          onClick={() => handleToggle(customerKey)}
                          className="inline-flex items-center gap-2 text-left hover:text-[color:var(--primary)] transition-colors cursor-pointer"
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Tutup' : 'Buka'} rincian ${row._id || '-'}`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{row._id || '-'}</span>
                        </button>
                      ) : (
                        <span>{row._id || '-'}</span>
                      )}
                    </td>
                    <td className={`${tdTextMuted} text-right`}>
                      {row.totalBerat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className={`${tdTextEmphasized} text-right`}>
                      {row.totalNilai.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${customerKey}-details`} className="bg-[color:var(--surface)]">
                      <td colSpan={3} className="px-6 py-3">
                        {isLoadingDetail ? (
                          <div className="py-2 text-sm text-[color:var(--muted)] flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Memuat rincian barang...</span>
                          </div>
                        ) : detailError ? (
                          <div className="py-2 text-sm text-[color:var(--danger)]">
                            Error: {detailError}
                          </div>
                        ) : items.length === 0 ? (
                          <p className="py-2 text-sm text-[color:var(--muted)]">
                            Tidak ada rincian barang.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded border border-[color:var(--border-color)] bg-[color:var(--card-bg)]">
                            <table className="min-w-full divide-y divide-[color:var(--border-color)] text-xs">
                              <thead className="bg-[color:var(--surface)]">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider">
                                    Barang
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-right font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider">
                                    Total Berat (kg)
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-right font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider">
                                    Total Nilai
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-right font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider">
                                    Jml Trx
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[color:var(--border-color)]">
                                {items.map((item, idx) => (
                                  <tr key={item._id || item.namaBarang || idx} className="hover:bg-[color:var(--surface)] transition-colors">
                                    <td className="px-4 py-2 text-[color:var(--foreground)] font-medium">
                                      {item.namaBarang || item._id || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-right text-[color:var(--foreground)] opacity-75">
                                      {item.totalBerat.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="px-4 py-2 text-right text-[color:var(--foreground)] font-medium">
                                      {item.totalNilai.toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                      })}
                                    </td>
                                    <td className="px-4 py-2 text-right text-[color:var(--foreground)] opacity-75">
                                      {item.count.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          <tfoot className="border-t border-[color:var(--border-color)] bg-[color:var(--surface)]">
            <tr>
              <td className={tfootTdClasses}>Total Keseluruhan</td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalBerat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalNilai.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
