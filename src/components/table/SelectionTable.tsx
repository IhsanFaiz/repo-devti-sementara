'use client';

import { useMemo } from 'react';
import { Stack, Typography, Chip } from '@mui/material';
import MainCard from 'components/MainCard';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

// ==============================|| Table - Selection ||============================== //

export interface SelectionApiResponse {
  id: number;
  firstName: string;
  lastName: string;
  administration: string | null;
  administrationScore: number | null;
  writtenTest: string | null;
  writtenTestScore: number | null;
  miniProject: string | null;
  miniProjectScore: number | null;
  interview: string | null;
  interviewScore: number | null;
  finalInterview: string | null;
  result: string | null;
}

const SelectionTable = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');
  const intl = useIntl();
  const router = useRouter();

  const { data: applicants, isLoading } = api.applicant.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
  });

  const columns = useMemo<ColumnDef<SelectionApiResponse>[]>(
    () => [
      {
        header: 'No',
        id: 'no',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.index + 1
      },
      {
        header: () => intl.formatMessage({ id: 'name' }),
        accessorKey: 'firstName',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`.trim()
      },
      {
        header: () => intl.formatMessage({ id: 'col-administration' }),
        accessorKey: 'administration',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.administration || '-'
      },
      {
        header: () => intl.formatMessage({ id: 'col-score' }),
        id: 'administrationScore',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.administrationScore ?? 0
      },
      {
        header: () => intl.formatMessage({ id: 'col-written-test' }),
        accessorKey: 'writtenTest',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.writtenTest || '-'
      },
      {
        header: () => intl.formatMessage({ id: 'col-score' }),
        id: 'writtenTestScore',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.writtenTestScore ?? 0
      },
      {
        header: () => intl.formatMessage({ id: 'col-mini-project' }),
        accessorKey: 'miniProject',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.miniProject || '-'
      },
      {
        header: () => intl.formatMessage({ id: 'col-score' }),
        id: 'miniProjectScore',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.miniProjectScore ?? 0
      },
      {
        header: () => intl.formatMessage({ id: 'col-interview' }),
        accessorKey: 'interview',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.interview || '-'
      },
      {
        header: () => intl.formatMessage({ id: 'col-score' }),
        id: 'interviewScore',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.interviewScore ?? 0
      },
      {
        header: () => intl.formatMessage({ id: 'final-interview-notes' }),
        accessorKey: 'finalInterview',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => row.original.finalInterview || '-'
      },
      {
        header: () => intl.formatMessage({ id: 'col-result' }),
        accessorKey: 'result',
        enableSorting: false,
        meta: { className: 'cell-center' },
        cell: ({ row }) => {
          const result = row.original.result;
          if (!result || result === 'PENDING') {
            return <Chip label={intl.formatMessage({ id: 'status-pending' })} color="warning" variant="filled" size="small" />;
          }
          if (result === 'PASSED') {
            return <Chip label={intl.formatMessage({ id: 'status-passed' })} color="success" variant="filled" size="small" />;
          }
          return <Chip label={intl.formatMessage({ id: 'status-failed' })} color="error" variant="filled" size="small" />;
        }
      }
    ],
    [intl]
  );

  const { table } = useTableState<SelectionApiResponse>({
    data: applicants?.data as SelectionApiResponse[] | undefined,
    columns,
    totalData: applicants?.total,
    isServerPagination: true
  });

  return (
    <MainCard title={<FormattedMessage id="selection" />}>
      <Stack sx={{ gap: 3 }}>
        <Typography variant="h5">
          <FormattedMessage id="selection-data" />
        </Typography>
      </Stack>
      <TableContent<SelectionApiResponse>
        {...{
          table,
          isPending: isLoading,
          isServerPagination: true,
          onRowClick: (row) => {
            router.push(`/selection/detail/${row.original.id}`);
          }
        }}
      />
    </MainCard>
  );
};

export default SelectionTable;
