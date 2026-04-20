'use client';

import SalesReportFilters from '@/components/reports/SalesReportFilters';
import SummaryReportTable from '@/components/reports/SummaryReportTable';
import { IItem } from '@/models/Item';
import { TransactionType } from '@/types/enums';
import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface FilterState {
  view?: string;
  year?: string;
  month?: string;
  itemId?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  noSjType?: 'all' | 'noSJ' | 'noSJSby';
}

type FiltersInput = Partial<FilterState>;

interface SummaryRow {
  _id: string;
  totalBerat: number;
  totalNilai: number;
}

export default function ItemsReportPage() {
  const [summaryData, setSummaryData] = useState<SummaryRow[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [tipe, setTipe] = useState<TransactionType>(TransactionType.PENJUALAN);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [items, setItems] = useState<IItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.itemId) queryParams.append('itemId', filters.itemId);
    if (filters.customer) queryParams.append('customer', filters.customer);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    queryParams.append('tipe', tipe);
    window.location.href = `/api/export/stock?${queryParams.toString()}`;
  };

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      setItemsError(null);
      try {
        const response = await fetchWithAuth('/api/items?fetchAll=true');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch items for filters');
        }
        const data = await response.json();
        setItems(data.items || []);
      } catch (err: unknown) {
        setItemsError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const fetchSummaryData = useCallback(
    async (currentFilters: FilterState, currentTipe: TransactionType) => {
      setIsLoadingSummary(true);
      setSummaryError(null);

      const queryParams = new URLSearchParams();
      if (currentFilters.year) queryParams.append('year', currentFilters.year);
      if (currentFilters.month) queryParams.append('month', currentFilters.month);
      if (currentFilters.itemId) queryParams.append('itemId', currentFilters.itemId);
      if (currentFilters.customer) queryParams.append('customer', currentFilters.customer);
      if (currentFilters.startDate) queryParams.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) queryParams.append('endDate', currentFilters.endDate);
      if (currentFilters.noSjType) queryParams.append('noSjType', currentFilters.noSjType);
      queryParams.append('tipe', currentTipe);

      try {
        const response = await fetchWithAuth(`/api/reports/items?${queryParams.toString()}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch items summary report');
        }
        const data = await response.json();
        setSummaryData(data.summary || []);
      } catch (err: unknown) {
        setSummaryError(err instanceof Error ? err.message : 'An unknown error occurred');
        setSummaryData([]);
      } finally {
        setIsLoadingSummary(false);
      }
    },
    []
  );

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchSummaryData(filters, tipe);
    }
  }, [filters, tipe, fetchSummaryData]);

  const handleFilterChange = useCallback((newFilters: FiltersInput) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-header-row">
          <div className="space-y-2">
            <p className="eyebrow">Laporan</p>
            <h1 className="page-title">Laporan stok</h1>
            <p className="page-description">
              Lihat ringkasan per customer atau supplier dengan filter.
            </p>
          </div>
          <div className="toolbar w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="btn-primary"
            >
              Ekspor ke Excel
            </button>
            <label className="text-sm font-medium text-[color:var(--muted)]">Tipe</label>
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="form-input flex w-full items-center justify-between sm:w-40"
            >
              <span>{tipe === TransactionType.PENJUALAN ? 'Penjualan' : 'Pembelian'}</span>
              <svg
                className={`h-4 w-4 text-[color:var(--muted)] transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)] animate-fadeIn">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTipe(TransactionType.PENJUALAN);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 ${tipe === TransactionType.PENJUALAN
                      ? 'bg-[color:var(--accent-soft)] text-[color:var(--primary)]'
                      : 'text-[color:var(--foreground)] hover:bg-[color:var(--surface)]'
                      }`}
                  >
                    Penjualan
                  </button>
                  <button
                    onClick={() => {
                      setTipe(TransactionType.PEMBELIAN);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 ${tipe === TransactionType.PEMBELIAN
                      ? 'bg-[color:var(--accent-soft)] text-[color:var(--primary)]'
                      : 'text-[color:var(--foreground)] hover:bg-[color:var(--surface)]'
                      }`}
                  >
                    Pembelian
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      <div className="mb-6">
        {itemsError && <div className="status-message status-danger">Error memuat daftar barang: {itemsError}</div>}
        <SalesReportFilters
          onFilterChange={handleFilterChange}
          items={items}
          isLoadingItems={isLoadingItems}
          customerLabel={tipe === TransactionType.PENJUALAN ? 'Customer' : 'Supplier'}
          title="Filter Laporan Stok"
        />
      </div>

      <SummaryReportTable
        data={summaryData}
        isLoading={isLoadingSummary}
        error={summaryError}
        tipe={tipe === TransactionType.PENJUALAN ? 'PENJUALAN' : 'PEMBELIAN'}
      />
    </div>
  );
}
