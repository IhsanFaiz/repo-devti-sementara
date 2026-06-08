'use client';

import { Stack, Typography, Chip } from '@mui/material';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { DebouncedInput } from 'components/third-party/react-table';
import { BadgeCheckIcon, BadgeX } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ==============================|| Table-Component ||============================== //

export interface SlaApiRequest {
  id: number;
  requestType: string;
  totalRequest: number;
  meetingPercentage: number;
  status: string;
}


const SlaTable = () => {
  
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
            cell: ({ row }) => {
              return (
                <Chip label={`${row.original.meetingPercentage}%`} variant='combined' color={row.original.status === "ACHIEVED" ? "success" : "error"}></Chip>
              )
            }
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
              router.push(`sla/detail/${row.original.requestType}`)
            }
          }}
        />
      </MainCard>
    </>
  );
};

export default SlaTable;
