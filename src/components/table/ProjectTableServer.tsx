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

// ==============================|| Table-Component ||============================== //

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  user?: {
    id: number;
    username: string;
  };

  include?: {
    user: true;
  };
}

export interface ProjectApiResponse {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  projectMembers?: ProjectMember[];
}

const ProjectTableServer = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ProjectApiResponse | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, row: ProjectApiResponse) => {
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
  const [menuItem, setMenuItem] = useState<ProjectApiResponse | null>(null);

  const { data: projects, isLoading } = api.project.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const router = useRouter();

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
            <div
              style={{
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.description}
            </div>
          </Tooltip>
        )
      },
      {
        header: () => 'Status',
        accessorKey: 'status',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => {
          return (
            <Chip
              label={row.original.status}
              color={
                row.original.status === 'ACTIVE'
                  ? 'success'
                  : row.original.status === 'DONE'
                    ? 'default'
                    : row.original.status === 'WAITING'
                      ? 'warning'
                      : 'error'
              }
            ></Chip>
          );
        }
      },
      {
        header: () => 'Tanggal Dibuat',
        accessorKey: 'createdAt',
        sortingFn: 'datetime',
        cell: ({ row }) => {
          return new Date(row.original.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
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
                <IconButton size="small" onClick={(e: MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, row.original)}>
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

  const { table, setGlobalFilter } = useTableState<ProjectApiResponse>({
    data: projects?.data,
    columns,
    totalData: projects?.total,
    isServerPagination: true
  });

  const StatCardSkeleton = () => (
    <MainCard sx={{ height: '100%' }}>
      <Skeleton animation="wave" variant="text" width={140} height={32} />

      <Skeleton animation="wave" variant="text" width={60} height={50} />

      <Skeleton animation="wave" variant="text" width={120} height={20} />
    </MainCard>
  );

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-5">
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

          <div className="bg-amber-500 rounded-xl pl-1">
            <StatCardSkeleton />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-5">
          <MainCard title="Total Projects" sx={{ height: '100%' }}>
            <Typography variant="h3">{projects?.total}</Typography>
            <Typography variant="caption" color="textSecondary">
              Total Number of Projects
            </Typography>
          </MainCard>

          <div className="bg-amber-500 rounded-xl pl-1">
            <MainCard title="Waiting Projects" sx={{ height: '100%' }}>
              <Typography variant="h3">{projects?.statusCounts.WAITING}</Typography>
              <Typography variant="caption" color="textSecondary">
                Total Waiting Projects
              </Typography>
            </MainCard>
          </div>

          <div className="bg-emerald-500 rounded-xl pl-1">
            <MainCard title="Active Projects" sx={{ height: '100%' }}>
              <Typography variant="h3">{projects?.statusCounts.ACTIVE}</Typography>
              <Typography variant="caption" color="textSecondary">
                Total Active Projects
              </Typography>
            </MainCard>
          </div>

          <div className="bg-blue-500 rounded-xl pl-1">
            <MainCard title="Done Projects" sx={{ height: '100%' }}>
              <Typography variant="h3">{projects?.statusCounts.DONE}</Typography>
              <Typography variant="caption" color="textSecondary">
                Total Done Projects
              </Typography>
            </MainCard>
          </div>

          <div className="bg-red-500 rounded-xl pl-1">
            <MainCard title="Canceled Projects" sx={{ height: '100%' }}>
              <Typography variant="h3">{projects?.statusCounts.CANCELED}</Typography>
              <Typography variant="caption" color="textSecondary">
                Total Canceled Projects
              </Typography>
            </MainCard>
          </div>
        </div>
      )}
      <MainCard
        title={
          <Stack sx={{ gap: 3 }}>
            <Typography variant="h5">Projects Table</Typography>
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
        <TableContent<ProjectApiResponse>
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true,
            onRowClick: (row) => {
              router.push(`project/detail/${row.original.id}`);
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

export default ProjectTableServer;
