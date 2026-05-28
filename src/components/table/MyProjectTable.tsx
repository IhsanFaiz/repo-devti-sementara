'use client';

import {  useState } from 'react';
import { Stack, Typography, Menu, Chip } from '@mui/material';
import { Tooltip } from '@mui/material';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { DebouncedInput } from 'components/third-party/react-table';
import { useRouter, useSearchParams } from 'next/navigation';

// ==============================|| Table-Component ||============================== //

export interface ProjectApiResponse {
  id: number
  name: string;
  description: string;
  status: string;
  createdAt: Date;
}


const MyProject = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  const { data: projects, isLoading } = api.project.getByUserId.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const router = useRouter()

  const columns = useMemo<ColumnDef<ProjectApiResponse>[]>(
    () => [
      {
        header: () => 'ID',
        accessorKey: 'id',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Name',
        accessorKey: 'name',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Description',
        accessorKey: 'description',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => (
          <Tooltip title={row.original.description}>
            <div style={{
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {row.original.description}
            </div>
          </Tooltip>
        )
      },
      {
        header: () => 'Status',
        accessorKey: 'status',
        sortingFn: 'alphanumeric',
        cell: ({row}) => {
          return (
            <Chip  label={row.original.status} color={row.original.status === "ACTIVE" ? "success" : row.original.status === "DONE" ? "default" : "error"}></Chip>
          )
        }
      },
      {
        header: () => 'Tanggal Dibuat',
        accessorKey: 'createdAt',
        sortingFn: 'datetime',
        cell: ({row}) => {
          return new Date(row.original.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }
      },
    ],
    []
  );

  const { table, setGlobalFilter } = useTableState<ProjectApiResponse>({
    data: projects?.data,
    columns,
    totalData: projects?.total,
    isServerPagination: true
  });

  return (
    <>
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Projects Table</Typography>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 2 }} justifyContent="space-between">
              <Stack spacing={1} direction="row" alignItems="end">
                <DebouncedInput value="" onFilterChange={(value) => setGlobalFilter(String(value))} placeholder="Search..." syncWithUrl />
              </Stack>
            </Stack>
          </Stack>
        }
        content={false}
      >
        <TableContent<ProjectApiResponse>
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true,
            onRowClick: (row) => {
              router.push(`my-project/detail/${row.original.id}`)
            }
          }}
        />
        <Menu
          open={Boolean(menuPosition)}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            menuPosition
              ? {
                  top: menuPosition.top,
                  left: menuPosition.left
                }
              : undefined
          }
        >
        </Menu>

      </MainCard>
    </>
  );
};

export default MyProject;
