'use client';

import { MouseEvent, useState } from 'react';
import AlertItemDelete from 'sections/table/AlertItemDelete';
import TableModal from 'sections/table/TableModal';
import { Button, Stack, Typography } from '@mui/material';
import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import { Add, Edit, Trash } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { DebouncedInput } from 'components/third-party/react-table';
import { useSearchParams } from 'next/navigation';
import { BookApiResponse } from './BookTable';

// ==============================|| Table-Component ||============================== //

const BookTableServer = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BookApiResponse | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const handleClose = () => {
    setOpen(!open);
  };
  const { data: books, isLoading } = api.book.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const columns = useMemo<ColumnDef<BookApiResponse>[]>(
    () => [
      {
        header: () => 'ID',
        accessorKey: 'id',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Title',
        accessorKey: 'title',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Author',
        accessorKey: 'author',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Year',
        accessorKey: 'year',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Genre',
        accessorKey: 'genre',
        sortingFn: 'alphanumeric'
      },
      {
        id: 'actions',
        header: () => 'Actions',
        meta: {
          className: 'cell-center'
        },
        cell: ({ row }) => {
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="Edit">
                <IconButton
                  color="secondary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedItem(row.original);
                    setItemModal(true);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleClose();
                    setSelectedItem(row.original);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const { table, setGlobalFilter } = useTableState<BookApiResponse>({
    data: books?.data,
    columns,
    totalData: books?.total,
    isServerPagination: true
  });

  return (
    <>
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Project Table (Server Pagination)</Typography>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 2 }} justifyContent="space-between">
              <Stack spacing={1} direction="row" alignItems="end">
                <DebouncedInput value="" onFilterChange={(value) => setGlobalFilter(String(value))} placeholder="Search..." syncWithUrl />
              </Stack>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setItemModal(true);
                  setSelectedItem(null);
                }}
                size="large"
              >
                Add Project
              </Button>
            </Stack>
          </Stack>
        }
        content={false}
      >
        <TableContent
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true
          }}
        />
      </MainCard>
      <AlertItemDelete item={selectedItem} open={open} handleClose={handleClose} />
      <TableModal open={ItemModal} modalToggler={setItemModal} item={selectedItem} />
    </>
  );
};

export default BookTableServer;
