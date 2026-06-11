'use client';

import { useEffect, useState } from 'react';
import { FormControl, Grid, MenuItem, Pagination, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { TableState, Updater } from '@tanstack/react-table';
import { useSearchParams, useRouter } from 'next/navigation';

interface TablePaginationProps {
  setPageSize: (updater: Updater<number>) => void;
  setPageIndex: (updater: Updater<number>) => void;
  getState: () => TableState;
  getPageCount: () => number;
  syncWithUrl?: boolean;
  pageKey?: string;
  limitKey?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

function TablePaginationUI({
  getPageCount,
  setPageIndex,
  setPageSize,
  getState,
  handlePageChange,
  handlePageSizeChange
}: {
  getPageCount: () => number;
  setPageIndex: (updater: Updater<number>) => void;
  setPageSize: (updater: Updater<number>) => void;
  getState: () => TableState;
  handlePageChange: (_: React.ChangeEvent<unknown>, newPage: number) => void;
  handlePageSizeChange: (event: SelectChangeEvent<number>) => void;
}) {
  const [open, setOpen] = useState(false);
  const { pageIndex, pageSize } = getState().pagination;

  return (
    <Grid spacing={1} container alignItems="center" justifyContent="space-between" sx={{ width: 'auto' }}>
      <Grid item>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="textSecondary">
            <FormattedMessage id="rows-per-page" />
          </Typography>
          <FormControl sx={{ m: 1 }}>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              size="small"
              sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary">
            <FormattedMessage id="page-of" values={{ page: pageIndex + 1, total: getPageCount() }} />
          </Typography>
        </Stack>
      </Grid>
      <Grid item sx={{ mt: { xs: 2, sm: 0 } }}>
        <Pagination
          sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
          count={getPageCount()}
          page={pageIndex + 1}
          onChange={handlePageChange}
          color="primary"
          variant="combined"
          showFirstButton
          showLastButton
        />
      </Grid>
    </Grid>
  );
}

function TablePaginationBase({ getPageCount, setPageIndex, setPageSize, getState }: TablePaginationProps) {
  const { pageSize } = getState().pagination;

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPageIndex(newPage - 1);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setPageIndex(0);
  };

  return (
    <TablePaginationUI
      getPageCount={getPageCount}
      setPageIndex={setPageIndex}
      setPageSize={setPageSize}
      getState={getState}
      handlePageChange={handlePageChange}
      handlePageSizeChange={handlePageSizeChange}
    />
  );
}

function TablePaginationWithUrl({
  getPageCount,
  setPageIndex,
  setPageSize,
  getState,
  pageKey = 'page',
  limitKey = 'limit'
}: TablePaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams ? searchParams.get(pageKey) : null;
  const limitParam = searchParams ? searchParams.get(limitKey) : null;

  const { pageIndex, pageSize } = getState().pagination;

  useEffect(() => {
    const currentPage = pageParam ? Number(pageParam) : 1;
    const currentSize = limitParam ? Number(limitParam) : PAGE_SIZE_OPTIONS[0];

    if (pageParam && currentPage - 1 !== pageIndex) {
      setPageIndex(currentPage - 1);
    }

    if (limitParam && currentSize !== pageSize) {
      setPageSize(currentSize);
    }
  }, [pageParam, limitParam]);

  const updateURL = (page: number, size: number) => {
    if (!searchParams || !router) return;

    const params = new URLSearchParams(searchParams);
    params.set(pageKey, String(page));
    params.set(limitKey, String(size));
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    router.replace(`${currentPath}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPageIndex(newPage - 1);
    updateURL(newPage, pageSize);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setPageIndex(0);
    updateURL(1, newSize);
  };

  return (
    <TablePaginationUI
      getPageCount={getPageCount}
      setPageIndex={setPageIndex}
      setPageSize={setPageSize}
      getState={getState}
      handlePageChange={handlePageChange}
      handlePageSizeChange={handlePageSizeChange}
    />
  );
}

export default function TablePagination(props: TablePaginationProps) {
  const Component = props.syncWithUrl ? TablePaginationWithUrl : TablePaginationBase;
  return <Component {...props} />;
}
