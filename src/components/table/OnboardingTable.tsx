'use client';

import { Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

export interface ApplicantApiResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  result: string | null;
}

const OnboardingTable = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');
  const intl = useIntl();

  const { data: applicants, isLoading } = api.applicant.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || '',
    result: 'PASSED' // Hanya ambil yang lulus
  });

  const router = useRouter();

  const columns = useMemo<ColumnDef<ApplicantApiResponse>[]>(
    () => [
      {
        header: () => intl.formatMessage({ id: 'name' }),
        accessorKey: 'firstName',
        sortingFn: 'alphanumeric',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
      },
      {
        header: () => intl.formatMessage({ id: 'information' }),
        id: 'informasi',
        meta: {
          className: 'cell-center'
        },
        cell: ({ row }) => (
          <Typography
            onClick={(e) => {
              e.stopPropagation();
              // Arahkan ke halaman detail onboarding, atau sesuaikan jika ada route lain
              router.push(`/onboarding/detail/${row.original.id}`);
            }}
            sx={{
              color: '#bb2a33',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <FormattedMessage id="detail" />
          </Typography>
        )
      }
    ],
    [router, intl]
  );

  const { table } = useTableState<ApplicantApiResponse>({
    data: applicants?.data,
    columns,
    totalData: applicants?.total,
    isServerPagination: true
  });

  return (
    <>
      <MainCard title={<FormattedMessage id="onboarding" defaultMessage="Onboarding" />}>
        <Stack sx={{ gap: 3 }}>
          {/* Table */}
          <TableContent<ApplicantApiResponse>
            {...{
              table,
              isPending: isLoading,
              isServerPagination: true
            }}
          />
        </Stack>
      </MainCard>
    </>
  );
};

export default OnboardingTable;
