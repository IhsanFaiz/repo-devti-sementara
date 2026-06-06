'use client';

import { MouseEvent, useState } from 'react';
import AlertItemDelete from 'sections/table/AlertItemDeleteProject';
import TableModal from 'sections/table/TableModalProject';
import { Button, Stack, Typography, Menu, MenuItem, Chip } from '@mui/material';
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
import { Skeleton } from '@mui/material';
import { BadgeCheckIcon, BadgeX } from 'lucide-react';

// ==============================|| Table-Component ||============================== //

export interface SlaApiRequest {
  id: number;
  requestType: string;
  totalRequest: number;
  meetingPercentage: number;
  status: string;
}


const SlaTable = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SlaApiRequest | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const handleMenuOpen = (
    event: MouseEvent<HTMLButtonElement>,
    row: SlaApiRequest
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
  const [menuItem, setMenuItem] = useState<SlaApiRequest | null>(null);

  
  const { data: sla, isLoading } = api.sla.getPagination.useQuery();

  const router = useRouter()

  const columns = useMemo<ColumnDef<SlaApiRequest>[]>(
    () => [
      {
            header: () => 'Request Type',
            accessorKey: 'requestType',
            cell: ({ row }) => (
                <Typography>
                    {row.original.requestType.replace(/_/g, ' ')}
                </Typography>
            )
        },
        {
            header: () => 'Total Request',
            accessorKey: 'totalRequest'
        },
        {
            header: () => '% Meeting SLA Target',
            accessorKey: 'meetingPercentage',
            cell: ({ row }) => `${row.original.meetingPercentage}%`
        },
        {
            header: () => 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Chip
                icon={
                    row.original.status === "ACHIEVED" 
                    ? <BadgeCheckIcon />
                    : <BadgeX />
                }
                label={row.original.status}
                color={
                    row.original.status === "ACHIEVED"
                    ? "success"
                    : "error"
                }
                />
            )
        }
    ],
    []
  );

  const { table, setGlobalFilter } = useTableState<SlaApiRequest>({
    data: sla?.data,
    columns,
    isServerPagination: true
  });

  return (
    <>      
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Service Level Agreement (SLA) Table</Typography>
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 2 }} justifyContent="space-between">
              <Stack spacing={1} direction="row" alignItems="end">
                <DebouncedInput value="" onFilterChange={(value) => setGlobalFilter(String(value))} placeholder="Search..." syncWithUrl />
              </Stack>
            </Stack>
          </Stack>
        }
        content={false}
      >
        <TableContent<SlaApiRequest>
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
      {/* <AlertItemDelete item={selectedItem} open={open} handleClose={() => setOpen(false)} />
      <TableModal open={ItemModal} modalToggler={setItemModal} item={selectedItem} /> */}
    </>
  );
};

export default SlaTable;
