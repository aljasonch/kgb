'use client';

interface SummaryRow {
  _id: string;
  totalBerat: number;
  totalNilai: number;
}

interface SummaryReportTableProps {
  data: SummaryRow[];
  isLoading: boolean;
  error?: string | null;
  tipe: 'PENJUALAN' | 'PEMBELIAN';
}

export default function SummaryReportTable({ data, isLoading, error, tipe }: SummaryReportTableProps) {
  const themedTextMuted = "text-center py-4 text-sm text-[color:var(--muted)]";
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
            {data.map((row) => (
              <tr key={row._id} className="transition-colors duration-150">
                <td className={tdTextEmphasized}>{row._id || '-'}</td>
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
            ))}
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
