import { useState } from 'react';
import {
  type SortingState,
  type RowSelectionState,
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef
} from '@tanstack/react-table';

export type UseTableProps<TData extends object> = {
  data?: TData[];
  columns: ColumnDef<TData, any>[];
  totalData?: number;
  isServerPagination?: boolean;
  isAutoResetPageIndex?: boolean;
  initialPageSize?: number;
  initialVisibility?: Record<string, boolean>;
};

export function useTableState<TData extends object>({
  data = [],
  columns,
  totalData,
  isServerPagination = false,
  isAutoResetPageIndex = false,
  initialPageSize,
  initialVisibility
}: UseTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 10
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
      pagination,
      columnVisibility: initialVisibility
    },
    rowCount: totalData,
    manualPagination: isServerPagination,
    manualFiltering: isServerPagination,
    autoResetPageIndex: isAutoResetPageIndex,
    getRowId: (row) => (row as any).document_id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServerPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getRowCanExpand: () => true
  });

  return {
    table,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination
  };
}
