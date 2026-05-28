'use client';

import { MouseEvent, useState } from 'react';
import AlertItemDelete from 'sections/table/AlertItemDeleteUsers';
import TableModal from 'sections/table/TableModalUser';
import { Button, Stack, Typography, Menu, MenuItem } from '@mui/material';
import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import { Add, Edit, Trash, More } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { DebouncedInput } from 'components/third-party/react-table';
import { useRouter, useSearchParams } from 'next/navigation';

// ==============================|| Table-Component ||============================== //

export interface UserApiResponse {
  id: number
  email: string,
  username: string;
  roleId: number
  role?: {
    id: number;
    name: string;
  }
}


const UserTable = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<UserApiResponse | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const handleMenuOpen = (
    event: MouseEvent<HTMLButtonElement>,
    row: UserApiResponse
  ) => {
    event.stopPropagation();

    setMenuPosition({
      top: event.clientY,
      left: event.clientX
    });

    setMenuItem(row);
  };

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  const handleEdit = () => {
    setSelectedItem(menuItem);
    setItemModal(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setSelectedItem(menuItem);
    setOpen(true);
    handleMenuClose();
  };
  const [menuItem, setMenuItem] = useState<UserApiResponse | null>(null);
  const { data: users, isLoading } = api.user.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const router = useRouter()

  const columns = useMemo<ColumnDef<UserApiResponse>[]>(
    () => [
      {
        header: () => 'ID',
        accessorKey: 'id',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'User Name',
        accessorKey: 'username',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'Email',
        accessorKey: 'email',
        sortingFn: 'alphanumeric'
      },
      {
        id: 'role',
        header: () => 'Role',
        accessorFn: (row) => row.role?.name || '',
        cell: ({ row }) => row.original.role?.name || '',
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
            <>
              <Tooltip title="More">
                <IconButton
                  size="small"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, row.original)}
                >
                  <More />
                </IconButton>
              </Tooltip>
            </>
          );
        }
      }
    ],
    []
  );

  const { table, setGlobalFilter } = useTableState<UserApiResponse>({
    data: users?.data,
    columns,
    totalData: users?.total,
    isServerPagination: true
  });

  return (
    <>
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Projects (Server Pagination)</Typography>
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
        <TableContent<UserApiResponse>
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true,
            onRowClick: (row) => {
              router.push(`project/detail/${row.original.id}`)
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
          <MenuItem onClick={handleEdit}>
            <Edit size={18} style={{ marginRight: '8px' }} />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDelete}>
            <Trash size={18} style={{ marginRight: '8px', color: '#d32f2f' }} />
            Delete
          </MenuItem>
        </Menu>

      </MainCard>
      <AlertItemDelete item={selectedItem} open={open} handleClose={() => setOpen(false)} />
      <TableModal open={ItemModal} modalToggler={setItemModal} item={selectedItem} />
    </>
  );
};

export default UserTable;
