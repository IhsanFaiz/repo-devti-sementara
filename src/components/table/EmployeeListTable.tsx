'use client';

import { useState, useMemo } from 'react';
import { Box, Card, Typography, Select, MenuItem, SelectChangeEvent, Stack, Button } from '@mui/material';
import { api } from 'trpc/react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { FormattedMessage, useIntl } from 'react-intl';
import { Add } from 'iconsax-react';
import { useRouter } from 'next/navigation';

const formatDate = (dateStr: string | Date | null | undefined) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('id-ID', { month: 'short' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function EmployeeListTable() {
  const [filterType, setFilterType] = useState<string>('Semua');
  const intl = useIntl();
  const router = useRouter();

  const { data: employeesAll, isLoading } = api.employee.getAll.useQuery({
    type: filterType === 'Semua' ? undefined : filterType
  });

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilterType(e.target.value);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: intl.formatMessage({ id: 'no' }),
        id: 'no',
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
        meta: { className: 'cell-center' },
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'nip' }),
        accessorKey: 'nip',
        cell: ({ row }) => row.original.nip || '-',
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'full-name' }),
        id: 'nama',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        sortingFn: 'alphanumeric',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
      },
      {
        header: intl.formatMessage({ id: 'job-desc' }),
        accessorKey: 'jobDesc',
        cell: ({ row }) => row.original.jobDesc || '-',
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'old-sotk-position' }),
        accessorKey: 'previousPosition',
        cell: ({ row }) => row.original.previousPosition || '-',
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'new-sotk-position' }),
        accessorKey: 'currentPosition',
        cell: ({ row }) => row.original.currentPosition || '-',
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'start-working-date' }),
        accessorKey: 'startWorking',
        cell: ({ row }) => formatDate(row.original.startWorking),
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'remarks' }),
        accessorKey: 'status',
        cell: ({ row }) => row.original.status || '-',
        enableSorting: false
      },
      {
        header: intl.formatMessage({ id: 'remarks-date' }),
        accessorKey: 'keteranganDate',
        cell: ({ row }) => row.original.keteranganDate || '-',
        enableSorting: false
      }
    ],
    [intl]
  );

  const { table } = useTableState<any>({
    data: employeesAll || [],
    columns,
    totalData: employeesAll?.length || 0,
    isServerPagination: false // local pagination and sorting
  });

  return (
    <Card sx={{ border: '1px solid #f0f0f0', mt: 3, borderRadius: 2 }} elevation={0}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          <FormattedMessage id="employee-data" />
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Select size="small" value={filterType} onChange={handleFilterChange} sx={{ minWidth: 200, borderRadius: 2 }}>
            <MenuItem value="Semua">
              <FormattedMessage id="all-employees" />
            </MenuItem>
            <MenuItem value="Pegawai Tetap">
              <FormattedMessage id="permanent-employee" />
            </MenuItem>
            <MenuItem value="Profesional">
              <FormattedMessage id="professional" />
            </MenuItem>
            <MenuItem value="Tenaga Lepas Harian">
              <FormattedMessage id="freelance" />
            </MenuItem>
            <MenuItem value="Magang Akademik">
              <FormattedMessage id="intern" />
            </MenuItem>
            <MenuItem value="Outsource">
              <FormattedMessage id="outsource" />
            </MenuItem>
          </Select>
          <Button variant="contained" startIcon={<Add />} size="large" onClick={() => router.push('/employee/add')}>
            <FormattedMessage id="add-employee" />
          </Button>
        </Stack>
      </Box>

      <Stack sx={{ pb: 2 }}>
        <TableContent<any>
          table={table}
          isPending={isLoading}
          isServerPagination={false}
          onRowClick={(row) => router.push(`/employee/add?id=${row.original.id}`)}
          isRowClickable={(row) => row.original.employeeType !== 'Pegawai Tetap' && row.original.employeeType !== 'Profesional'}
        />
      </Stack>
    </Card>
  );
}
