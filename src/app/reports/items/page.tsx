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
    <div className="container mx-auto p-4">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 cursor-pointer text-white rounded-md hover:bg-green-700 text-sm font-medium order-last sm:order-none"
        >
          Ekspor ke Excel
        </button>
        <h1 className="text-3xl font-bold text-[color:var(--foreground)]">Laporan Stok</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-[color:var(--muted)]">Tipe:</label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-40 px-4 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)] text-[color:var(--foreground)] text-sm font-medium shadow-sm hover:bg-[color:var(--surface)] hover:border-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-2 transition-all duration-200"
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
              <div className="absolute z-10 w-full mt-2 bg-[color:var(--card-bg)] border border-[color:var(--border-color)] rounded-xl shadow-lg overflow-hidden animate-fadeIn">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTipe(TransactionType.PENJUALAN);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${tipe === TransactionType.PENJUALAN
                      ? 'bg-blue-50 text-blue-600'
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
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${tipe === TransactionType.PEMBELIAN
                      ? 'bg-blue-50 text-blue-600'
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
      </header>

      <div className="mb-6">
        {itemsError && <p className="text-red-500">Error loading items for filter: {itemsError}</p>}
        <SalesReportFilters
          onFilterChange={handleFilterChange}
          items={items}
          isLoadingItems={isLoadingItems}
          customerLabel={tipe === TransactionType.PENJUALAN ? 'Customer' : 'Supplier'}
          title="Filter Laporan Stok"
        />
      </div>

      <div>
        <SummaryReportTable
          data={summaryData}
          isLoading={isLoadingSummary}
          error={summaryError}
          tipe={tipe === TransactionType.PENJUALAN ? 'PENJUALAN' : 'PEMBELIAN'}
        />
      </div>
    </div>
  );
}
