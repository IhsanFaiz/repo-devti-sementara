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

// ==============================|| Table-Component ||============================== //

export interface BookApiResponse {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
}

const BookTable = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BookApiResponse | null>(null);

  const handleClose = () => {
    setOpen(!open);
  };
  const { data: books, isLoading } = api.book.getAll.useQuery();

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

  const { table, globalFilter, setGlobalFilter } = useTableState<BookApiResponse>({
    data: books,
    columns,
    isAutoResetPageIndex: true
  });

  return (
    <>
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Project Table (All)</Typography>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 2 }} justifyContent="space-between">
              <Stack spacing={1} direction="row" alignItems="end">
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onFilterChange={(value) => setGlobalFilter(String(value))}
                  placeholder="Search..."
                />
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
            isPending: isLoading
          }}
        />
      </MainCard>
      <AlertItemDelete item={selectedItem} open={open} handleClose={handleClose} />
      <TableModal open={ItemModal} modalToggler={setItemModal} item={selectedItem} />
    </>
  );
};

export default BookTable;
