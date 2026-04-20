'use client';

import SalesReportFilters from '@/components/reports/SalesReportFilters';
import SalesReportTable from '@/components/reports/SalesReportTable';
import { ITransaction } from '@/models/Transaction';
import { IItem } from '@/models/Item';
import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface FilterState {
  view?: string;
  year?: string;
  month?: string;
  supplier?: string; 
  itemId?: string;
  startDate?: string;
  endDate?: string;
  noSjType?: 'all' | 'noSJ' | 'noSJSby';
}

interface IncomingFiltersFromSalesReport {
  view?: string;
  year?: string;
  month?: string;
  customer?: string; 
  itemId?: string;
  startDate?: string;
  endDate?: string;
  noSjType?: 'all' | 'noSJ' | 'noSJSby';
}

export default function PurchaseReportPage() {
  const [reportData, setReportData] = useState<ITransaction[]>([]);
  const [filters, setFilters] = useState<FilterState>({}); 
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

  const [items, setItems] = useState<IItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      setItemsError(null);
      try {
        // Fetch all items for the filter dropdown
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

  const fetchReportData = useCallback(async (currentFilters: FilterState) => {
    setIsLoadingReport(true);
    setReportError(null);

    const queryParams = new URLSearchParams();
    if (currentFilters.view) queryParams.append('view', currentFilters.view);
    if (currentFilters.year) queryParams.append('year', currentFilters.year);
    if (currentFilters.month) queryParams.append('month', currentFilters.month);
    if (currentFilters.supplier) queryParams.append('supplier', currentFilters.supplier);
    if (currentFilters.itemId) queryParams.append('itemId', currentFilters.itemId);
    if (currentFilters.startDate) queryParams.append('startDate', currentFilters.startDate);
    if (currentFilters.endDate) queryParams.append('endDate', currentFilters.endDate);
    if (currentFilters.noSjType) queryParams.append('noSjType', currentFilters.noSjType);

    try {
      const response = await fetchWithAuth(`/api/reports/purchases?${queryParams.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch purchase report');
      }
      const data = await response.json();
      setReportData(data.purchaseReport || []);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : 'An unknown error occurred');
      setReportData([]);
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  useEffect(() => {
     fetchReportData(filters);
  }, [filters, fetchReportData]);


  const handleFilterChange = useCallback((newFiltersFromComponent: IncomingFiltersFromSalesReport) => {
    const mappedFilters: FilterState = { 
      view: newFiltersFromComponent.view,
      year: newFiltersFromComponent.year,
      month: newFiltersFromComponent.month,
      itemId: newFiltersFromComponent.itemId,
      startDate: newFiltersFromComponent.startDate,
      endDate: newFiltersFromComponent.endDate,
      noSjType: newFiltersFromComponent.noSjType,
    };
    if (newFiltersFromComponent.customer) {
        mappedFilters.supplier = newFiltersFromComponent.customer;
    }
    setFilters(mappedFilters);
  }, []);
  
  const handleExport = async () => {
    const queryParams = new URLSearchParams();
    if (filters.view) queryParams.append('view', filters.view);
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.supplier) queryParams.append('supplier', filters.supplier);
    if (filters.itemId) queryParams.append('itemId', filters.itemId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.noSjType) queryParams.append('noSjType', filters.noSjType);
    window.location.href = `/api/export/purchases?${queryParams.toString()}`;
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="page-header-row">
          <div className="space-y-2">
            <p className="eyebrow">Laporan</p>
            <h1 className="page-title">Laporan pembelian</h1>
            <p className="page-description">
              List transaksi pembelian dengan berbagai filter.
            </p>
          </div>
        </div>
        <div className="page-action">
          <button
            onClick={handleExport}
            disabled={isLoadingReport || reportData.length === 0}
            className="btn-primary"
          >
            Ekspor ke Excel
          </button>
        </div>
      </header>

      <div className="mb-6">
        {itemsError && <div className="status-message status-danger">Error memuat daftar barang: {itemsError}</div>}
        <SalesReportFilters
            onFilterChange={handleFilterChange}
            items={items}
            isLoadingItems={isLoadingItems}
            customerLabel="Supplier"
            title="Filter Laporan Pembelian"
        />
      </div>

      <SalesReportTable
          reportData={reportData}
          isLoading={isLoadingReport}
          error={reportError}
      />
    </div>
  );
}
