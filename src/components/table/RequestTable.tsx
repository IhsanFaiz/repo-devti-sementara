'use client';

import { MouseEvent, useState } from 'react';
import AlertItemDelete from 'sections/table/AlertItemDeleteRequest';
import TableModal from 'sections/table/TableModalRequest';
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

// ==============================|| Table-Component ||============================== //

export interface RequestApiResponse {
    id              : number;
    references      : string;
    status          : string;
    applicationName : string | null;
    version         : string | null;
    description     : string | null;
    via             : string | null,
    psal            : string | null,
    department      : string | null,
    category        : string | null,
    framework       : string | null,
    groupType       : string | null,
    serviceType     : string | null,
    subServiceType  : string | null,
    priority        : string | null,
    slaDays         : number | null,
}


const RequestTableServer = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<RequestApiResponse | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const handleMenuOpen = (
    event: MouseEvent<HTMLButtonElement>,
    row: RequestApiResponse
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
  const [menuItem, setMenuItem] = useState<RequestApiResponse | null>(null);

  
  const { data: request, isLoading } = api.request.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const router = useRouter()

  const columns = useMemo<ColumnDef<RequestApiResponse>[]>(
    () => [
      {
        header: () => 'ID',
        accessorKey: 'id',
        sortingFn: 'alphanumeric'
      },
      {
        header: () => 'References',
        accessorKey: 'references',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => (
          <Tooltip title={row.original.references}>
            <div style={{
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {row.original.references}
            </div>
          </Tooltip>
        )
      },
      {
        header: () => 'Application Name',
        accessorKey: 'applicationName',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => (
          <Tooltip title={row.original.applicationName}>
            <div style={{
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {row.original.applicationName}
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
            <Chip  label={row.original.status} color={row.original.status === "APPROVED" ? "success" : row.original.status === "PENDING" ? "default" : "error"}></Chip>
          )
        }
      },
      {
        header: () => 'Version',
        accessorKey: 'version',
        sortingFn: 'alphanumeric',
        cell: ({row}) => {
          return (
            <Chip  label={row.original.version} color="primary"></Chip>
          )
        }
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

  const { table, setGlobalFilter } = useTableState<RequestApiResponse>({
    data: request?.data,
    columns,
    totalData: request?.total,
    isServerPagination: true
  });

  const StatCardSkeleton = () => (
    <MainCard sx={{ height: '100%' }}>
      <Skeleton
        variant="text"
        width={140}
        height={32}
      />
  
      <Skeleton
        variant="text"
        width={60}
        height={50}
      />
  
      <Skeleton
        variant="text"
        width={120}
        height={20}
      />
    </MainCard>
  );

  return (
    <>
    {isLoading ? (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4">
              <StatCardSkeleton />
    
              <div className="bg-emerald-500 rounded-xl pl-1">
                <StatCardSkeleton />
              </div>
    
              <div className="bg-blue-500 rounded-xl pl-1">
                <StatCardSkeleton />
              </div>
    
              <div className="bg-red-500 rounded-xl pl-1">
                <StatCardSkeleton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4">
              <MainCard title="Total Request" sx={{ height: '100%' }}>
                <Typography variant="h3">
                  {request?.total}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Number of Request
                </Typography>
              </MainCard>
    
              <div className="bg-emerald-500 rounded-xl pl-1">
                <MainCard title="Approved Request" sx={{ height: '100%' }}>
                  <Typography variant="h3">
                    {request?.statusCounts.APPROVED}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Approved Request
                  </Typography>
                </MainCard>
              </div>
    
              <div className="bg-blue-500 rounded-xl pl-1">
                <MainCard title="Pending Request" sx={{ height: '100%' }}>
                  <Typography variant="h3">
                    {request?.statusCounts.PENDING}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Pending Request
                  </Typography>
                </MainCard>
              </div>
    
              <div className="bg-red-500 rounded-xl pl-1">
                <MainCard title="Rejected Request" sx={{ height: '100%' }}>
                  <Typography variant="h3">
                    {request?.statusCounts.REJECTED}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Rejected Request
                  </Typography>
                </MainCard>
              </div>
            </div>
          )}
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">App Requests Table</Typography>
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
                Add App Request 
              </Button>
            </Stack>
          </Stack>
        }
        content={false}
      >
        <TableContent<RequestApiResponse>
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true,
            onRowClick: (row) => {
              router.push(`request/detail/${row.original.id}`)
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

export default RequestTableServer;
