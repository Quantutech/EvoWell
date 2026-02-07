import React, { useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UserDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  onBulkAction?: (action: string, selectedRows: TData[]) => void;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function UserDataTable<TData>({ 
  data, 
  columns, 
  onBulkAction,
  isLoading,
  onRowClick
}: UserDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
        <div className="flex gap-4 items-center">
           <div className="relative">
              <input 
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 w-72 transition-all"
                placeholder="Global search users..."
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <div className="flex gap-3 items-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="px-3 py-1 bg-brand-50 rounded-lg border border-brand-100">
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-tight">{Object.keys(rowSelection).length} Selected</span>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                    onBulkAction?.(e.target.value, table.getSelectedRowModel().rows.map(r => r.original));
                    e.target.value = '';
                }
              }}
              className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              <option value="">Choose Action</option>
              <option value="edit">Quick Edit</option>
              <option value="delete">Delete Permanently</option>
              <option value="role">Change Role</option>
              <option value="status">Update Status</option>
              <option value="export">Export to CSV</option>
            </select>
          </div>
        )}
      </div>

      {/* Virtualized Table Container */}
      <div 
        ref={tableContainerRef} 
        className="flex-grow overflow-auto custom-scrollbar relative"
        style={{ height: '650px' }}
      >
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-white shadow-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:text-slate-600 transition-colors group"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                            <span className="text-brand-500">
                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                            </span>
                        )}
                        {!header.column.getIsSorted() && header.column.getCanSort() && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().length === 0 && !isLoading && (
                <tr>
                    <td colSpan={columns.length} className="p-20 text-center">
                        <div className="inline-flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-slate-400">No matching users found.</p>
                        </div>
                    </td>
                </tr>
            )}
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr 
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`hover:bg-slate-50/80 transition-colors group ${row.getIsSelected() ? 'bg-brand-50/30' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-8 py-4 border-b border-slate-50 whitespace-nowrap align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination Footer */}
      <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-slate-900">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-slate-900">{table.getPageCount()}</span>
            </span>
         </div>

         <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page</span>
            <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer"
            >
                {[10, 25, 50, 100].map(pageSize => (
                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                ))}
            </select>
         </div>
      </div>
    </div>
  );
}
