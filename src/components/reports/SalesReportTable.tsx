'use client';

import { ITransaction } from '@/models/Transaction';
import { useEffect, useState } from 'react';

interface SalesReportTableProps {
  reportData: ITransaction[];
  isLoading: boolean;
  error?: string | null;
}

export default function SalesReportTable({ reportData, isLoading, error }: SalesReportTableProps) {
  const themedTextMuted = "text-center py-4 text-sm text-[color:var(--muted)]";
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(reportData.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (isLoading) {
    return <p className={themedTextMuted}>Memuat data laporan…</p>;
  }

  if (error) {
    return (
      <div className="status-message status-danger">Error: {error}</div>
    );
  }

  if (reportData.length === 0) {
    return <div className="empty-state">Tidak ada data penjualan untuk filter yang dipilih.</div>;
  }

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = reportData.slice(startIndex, startIndex + rowsPerPage);

  const totalBerat = reportData.reduce((sum, tx) => sum + tx.berat, 0);
  const totalNilai = reportData.reduce((sum, tx) => sum + tx.totalHarga, 0);
  const ppnRate = 0.11; // 11% PPN
  const totalPPN = totalNilai * ppnRate;
  const totalDenganPPN = totalNilai + totalPPN;

  const thClasses = "px-6 py-3 text-left text-xs font-medium text-[color:var(--foreground)] opacity-75 uppercase tracking-wider";
  const tdBaseClasses = "px-6 py-4 text-sm";
  const tdTextMuted = `${tdBaseClasses} text-[color:var(--foreground)] opacity-75`;
  const tdTextEmphasized = `${tdBaseClasses} text-[color:var(--foreground)] font-medium`;
  const tfootTdClasses = "px-6 py-3 text-xs font-bold text-[color:var(--foreground)] uppercase tracking-wider";

  return (
    <div className={`table-shell mt-6 transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="table-scroll">
        <table className="min-w-full divide-y divide-[color:var(--border-color)]">
          <thead>
            <tr>
              <th scope="col" className={thClasses}>Tanggal</th>
              <th scope="col" className={thClasses}>Customer</th>
              <th scope="col" className={thClasses}>No. SJ</th>
              <th scope="col" className={thClasses}>No. Inv</th>
              <th scope="col" className={thClasses}>Barang</th>
              <th scope="col" className={`${thClasses} text-right`}>Berat (kg)</th>
              <th scope="col" className={`${thClasses} text-right`}>Harga</th>
              <th scope="col" className={`${thClasses} text-right`}>Subtotal</th>
              <th scope="col" className={`${thClasses} text-right`}>PPN (11%)</th>
              <th scope="col" className={`${thClasses} text-right`}>Total</th>
              <th scope="col" className={thClasses}>No. PO</th>
              <th scope="col" className={thClasses}>No.SJ SBY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-color)]">
            {currentData.map((tx) => (
              <tr key={tx._id as string} className="transition-colors duration-150">
                <td className={tdTextMuted}>{new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
                <td className={tdTextEmphasized}>{tx.customer}</td>
                <td className={tdTextMuted}>{tx.noSJ}</td>
                <td className={tdTextMuted}>{tx.noInv}</td>
                <td className={tdTextEmphasized}>
                  {typeof tx.item === 'object' && tx.item !== null && 'namaBarang' in tx.item
                    ? tx.item.namaBarang
                    : tx.namaBarangSnapshot || 'N/A'}
                </td>
                <td className={`${tdTextMuted} text-right`}>
                  {tx.berat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`${tdTextMuted} text-right`}>
                  {tx.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </td>
                <td className={`${tdTextEmphasized} text-right`}>
                  {tx.totalHarga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </td>
                <td className={`${tdTextMuted} text-right`}>
                  {(tx.totalHarga * ppnRate).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </td>
                <td className={`${tdTextEmphasized} text-right`}>
                  {(tx.totalHarga * (1 + ppnRate)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                </td>
                <td className={tdTextMuted}>{tx.noPO || '-'}</td>
                <td className={tdTextMuted}>{tx.noSJSby || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-[color:var(--border-color)] bg-[color:var(--surface)]">
            <tr>
              <td colSpan={5} className={`${tfootTdClasses} text-left`}>Total Keseluruhan</td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalBerat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
              </td>
              <td className={tfootTdClasses}>{null}</td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalNilai.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalPPN.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </td>
              <td className={`${tfootTdClasses} text-right`}>
                {totalDenganPPN.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </td>
              <td colSpan={2} className={tfootTdClasses}>{null}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-color)] p-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="btn-secondary"
        >
          Sebelumnya
        </button>
        <span className="mono text-sm text-[color:var(--foreground)]">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn-secondary"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
