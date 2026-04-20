'use client';

import { IItem } from '@/models/Item';
import { useState, useEffect, FormEvent, ChangeEvent, useCallback, useRef, useMemo } from 'react';

interface FilterState {
  view: 'monthly' | 'overall' | 'custom_range';
  year?: string;
  month?: string;
  customer?: string;
  itemId?: string;
  startDate?: string;
  endDate?: string;
  noSjType?: 'all' | 'noSJ' | 'noSJSby';
}

interface SalesReportFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  items: IItem[];
  isLoadingItems: boolean;
  customerLabel?: string;
  title?: string;
}

interface CustomSelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomSelect({ id, label, value, options, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || value;

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-input flex items-center justify-between text-left"
      >
        <span className="block truncate">{selectedLabel}</span>
        <svg
          className={`h-4 w-4 text-[color:var(--muted)] transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)] focus:outline-none animate-fadeIn">
          {options.map((option) => (
            <li
              key={option.value}
              className={`relative cursor-pointer select-none py-3 pl-4 pr-10 text-sm hover:bg-[color:var(--surface)] ${value === option.value ? 'bg-[color:var(--accent-soft)] text-[color:var(--primary)] font-medium' : 'text-[color:var(--foreground)]'
                }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="block truncate">{option.label}</span>
              {value === option.value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[color:var(--primary)]">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SalesReportFilters({
  onFilterChange,
  items,
  isLoadingItems,
  customerLabel = "Customer",
  title = "Filter Laporan Penjualan"
}: SalesReportFiltersProps) {
  const [view, setView] = useState<'monthly' | 'overall' | 'custom_range'>('overall');
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [month, setMonth] = useState<string>('');
  const [customer, setCustomer] = useState('');
  const [itemId, setItemId] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<IItem[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [noSjType, setNoSjType] = useState<'all' | 'noSJ' | 'noSJSby'>('all');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounce = <T extends unknown[], R>(
    func: (...args: T) => Promise<R> | R,
    waitFor: number
  ): ((...args: T) => Promise<R>) => {
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

  const searchItems = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredItems([]);
      setShowItemDropdown(false);
      return;
    }

    const filtered = items
      .filter(item =>
        item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10);

    setFilteredItems(filtered);
    setShowItemDropdown(filtered.length > 0);
  }, [items]);

  const debouncedSearchItems = useMemo(
    () => debounce((searchTerm: string) => {
      searchItems(searchTerm);
    }, 300),
    [searchItems]
  );

  const handleItemSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setItemSearchTerm(term);
    setItemId('');
    setSelectedItemName('');

    if (term.trim()) {
      debouncedSearchItems(term);
    } else {
      setFilteredItems([]);
      setShowItemDropdown(false);
    }
  };

  const handleSelectItem = (item: IItem) => {
    setItemId(item._id.toString());
    setSelectedItemName(item.namaBarang);
    setItemSearchTerm(item.namaBarang);
    setFilteredItems([]);
    setShowItemDropdown(false);
  };

  const handleClearItem = () => {
    setItemId('');
    setSelectedItemName('');
    setItemSearchTerm('');
    setFilteredItems([]);
    setShowItemDropdown(false);
  };

  const handleApplyFilters = useCallback((event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const filters: FilterState = { view, noSjType };
    if (view === 'monthly') {
      if (year && month) {
        filters.year = year;
        filters.month = month;
      } else if (year) {
        filters.year = year;
      }
    } else if (view === 'custom_range') {
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }
    } else if (view === 'overall') {
      if (year) {
        filters.year = year;
      }
    }

    if (customer) filters.customer = customer;
    if (itemId) filters.itemId = itemId;

    onFilterChange(filters);
  }, [view, year, month, startDate, endDate, customer, itemId, noSjType, onFilterChange]);
  useEffect(() => {
    handleApplyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const formElementStyles = "form-input";
  const labelStyles = "form-label";

  const viewOptions = [
    { value: 'overall', label: 'Per Tahun (Default)' },
    { value: 'monthly', label: 'Per Bulan' },
    { value: 'custom_range', label: 'Rentang Tanggal Kustom' }
  ];

  const yearOptions = years.map(y => ({ value: y.toString(), label: y.toString() }));

  const monthOptions = [
    { value: '', label: 'Semua Bulan' },
    ...Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
      value: m.toString(),
      label: new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })
    }))
  ];

  return (
    <form onSubmit={handleApplyFilters} className="section-card space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Filter</p>
        <h3 className="section-title">{title}</h3>
      </div>

      <div>
        <CustomSelect
          id="view"
          label="Tampilan Laporan"
          value={view}
          options={viewOptions}
          onChange={(val) => setView(val as FilterState['view'])}
        />
      </div>

      {view === 'monthly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <CustomSelect
              id="year-monthly"
              label="Tahun"
              value={year}
              options={yearOptions}
              onChange={setYear}
            />
          </div>
          <div>
            <CustomSelect
              id="month"
              label="Bulan"
              value={month}
              options={monthOptions}
              onChange={setMonth}
            />
          </div>
        </div>
      )}

      {view === 'overall' && (
        <div>
          <CustomSelect
            id="year-overall"
            label="Tahun"
            value={year}
            options={yearOptions}
            onChange={setYear}
          />
        </div>
      )}

      {view === 'custom_range' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className={labelStyles}>Tanggal Mulai</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={formElementStyles} />
          </div>
          <div>
            <label htmlFor="endDate" className={labelStyles}>Tanggal Akhir</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={formElementStyles} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="customer" className={labelStyles}>{customerLabel} (Nama)</label>
        <input type="text" id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder={`Kosongkan untuk semua ${customerLabel.toLowerCase()}`} className={formElementStyles} />
      </div>
      <div>
        <label htmlFor="item" className={labelStyles}>Barang</label>
        {isLoadingItems ? (
          <p className="form-helper">Memuat barang…</p>
        ) : (
          <div className="relative">
            <div className="flex items-center">
              <input
                type="text"
                id="item"
                value={itemSearchTerm}
                onChange={handleItemSearchChange}
                onFocus={() => {
                  if (itemSearchTerm.trim() && filteredItems.length > 0) {
                    setShowItemDropdown(true);
                  }
                }}
                placeholder="Ketik nama barang untuk mencari..."
                className={`${formElementStyles} ${selectedItemName ? 'pr-10' : ''}`}
              />
              {selectedItemName && (
                <button
                  type="button"
                  onClick={handleClearItem}
                  className="absolute right-2 p-1 text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
                  title="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {showItemDropdown && filteredItems.length > 0 && (
              <ul
              className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card-bg)]"
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setShowItemDropdown(false), 200);
                }}
                onMouseEnter={() => {
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                }}
              >
                {filteredItems.map((item) => (
                  <li
                    key={item._id.toString()}
                    onClick={() => handleSelectItem(item)}
                  className="cursor-pointer border-b border-[color:var(--border-color)] px-4 py-3 text-sm text-[color:var(--foreground)] last:border-b-0 hover:bg-[color:var(--surface)]"
                  >
                    {item.namaBarang}
                  </li>
                ))}
              </ul>
            )}

            {selectedItemName && (
              <p className="form-helper">
                Terpilih: {selectedItemName}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className={labelStyles}>Filter No. SJ</label>
        <div className="mt-2 flex flex-wrap gap-y-2 gap-x-4">
          {(['all', 'noSJ', 'noSJSby'] as const).map((type) => (
            <label key={type} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="noSjType"
                value={type}
                checked={noSjType === type}
                onChange={(e) => setNoSjType(e.target.value as 'all' | 'noSJ' | 'noSJSby')}
                className="form-radio h-4 w-4 text-[color:var(--primary)] border-[color:var(--border-color)] focus:ring-[color:var(--primary)] transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-[color:var(--ink-soft)]">
                {type === 'all' ? 'Semua' : type === 'noSJ' ? 'No. SJ (Utama)' : 'No. SJ SBY'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary w-full">
          Terapkan Filter
        </button>
      </div>
    </form>
  );
}
