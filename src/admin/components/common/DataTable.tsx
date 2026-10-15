import { useState, useMemo, type ReactNode } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/admin/lib/utils';
import { Button } from '@/admin/components/ui/Button';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
  accessor?: (item: T) => unknown;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  rowKey?: (item: T, index: number) => string | number;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  // Custom filter slots
  filterSlot?: ReactNode;
  actionsSlot?: ReactNode;
  // Sorting (controlled or uncontrolled)
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  // Pagination
  pagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  // Empty State
  emptyTitle?: string;
  emptyMessage?: string;
  // Row interaction
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data = [],
  columns,
  isLoading = false,
  rowKey,
  // Search
  searchable = true,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchQuery: controlledSearchQuery,
  onSearchChange,
  // Slots
  filterSlot,
  actionsSlot,
  // Sorting
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange,
  // Pagination
  pagination = true,
  currentPage: controlledCurrentPage,
  pageSize: controlledPageSize = 10,
  totalItems: controlledTotalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  // Empty State
  emptyTitle = 'Không có dữ liệu',
  emptyMessage = 'Không tìm thấy bản ghi nào phù hợp với điều kiện tìm kiếm hoặc lọc hiện tại.',
  onRowClick,
  className,
}: DataTableProps<T>) {
  // Uncontrolled search state
  const [internalSearch, setInternalSearch] = useState('');
  const searchQuery =
    controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearch;

  // Uncontrolled sort state
  const [internalSortCol, setInternalSortCol] = useState<string | null>(null);
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc');
  const sortColumn =
    controlledSortColumn !== undefined ? controlledSortColumn : internalSortCol;
  const sortDirection =
    controlledSortDirection !== undefined ? controlledSortDirection : internalSortDir;

  // Uncontrolled pagination state
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(controlledPageSize);
  const currentPage =
    controlledCurrentPage !== undefined ? controlledCurrentPage : internalPage;
  const pageSize =
    controlledPageSize !== undefined && onPageSizeChange
      ? controlledPageSize
      : internalPageSize;

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
      setInternalPage(1);
    }
  };

  const handleSortClick = (columnKey: string) => {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortColumn === columnKey) {
      nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    if (onSortChange) {
      onSortChange(columnKey, nextDir);
    } else {
      setInternalSortCol(columnKey);
      setInternalSortDir(nextDir);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  // Client-side filtering & sorting if uncontrolled
  const processedData = useMemo(() => {
    // If controlled pagination/search is used (e.g. totalItems provided and onSearchChange provided), return data as is
    if (controlledTotalItems !== undefined && onSearchChange !== undefined) {
      return data;
    }

    let result = [...data];

    // Local search filter
    if (searchQuery.trim() && !onSearchChange) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Local sorting
    if (sortColumn && !onSortChange) {
      const col = columns.find((c) => c.key === sortColumn);
      result.sort((a, b) => {
        const valA = col?.accessor ? col.accessor(a) : a[sortColumn];
        const valB = col?.accessor ? col.accessor(b) : b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const cmp = String(valA).localeCompare(String(valB), 'vi');
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, sortColumn, sortDirection, columns, controlledTotalItems, onSearchChange]);

  const totalItems =
    controlledTotalItems !== undefined ? controlledTotalItems : processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const displayData = useMemo(() => {
    if (controlledTotalItems !== undefined || onPageChange !== undefined) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [data, processedData, currentPage, pageSize, controlledTotalItems, onPageChange]);

  return (
    <div
      className={cn(
        'w-full space-y-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm',
        className
      )}
    >
      {/* Toolbar: Search, Filters & Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative min-w-[240px] max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {filterSlot && <div className="flex items-center gap-2">{filterSlot}</div>}
        </div>

        {actionsSlot && (
          <div className="flex items-center gap-2 self-end md:self-auto">
            {actionsSlot}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-800">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3.5 select-none',
                      alignClass,
                      col.sortable && 'cursor-pointer hover:text-slate-900 transition-colors',
                      col.className
                    )}
                    onClick={() => {
                      if (col.sortable) handleSortClick(col.key);
                    }}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400 shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <p className="text-xs font-medium">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {emptyTitle}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((item, rowIndex) => {
                const key = rowKey
                  ? rowKey(item, rowIndex)
                  : (item as any).id ?? rowIndex;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'transition-colors hover:bg-slate-50/80',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3.5 text-xs text-slate-800',
                            alignClass,
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(item, rowIndex)
                            : String(item[col.key] ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && !isLoading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>trên tổng số {totalItems} bản ghi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2">
              Trang {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(1)}
              title="Trang đầu"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              title="Trang sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              title="Trang cuối"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
