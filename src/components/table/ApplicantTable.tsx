'use client';

import { useState } from 'react';
import TableModal from 'sections/table/TableModalApplicant';
import { Button, Stack, Typography } from '@mui/material';
import { Add } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTableState } from 'hooks/useTableState';
import TableContent from 'components/table/TableContent';
import { api } from 'trpc/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormattedMessage, useIntl } from 'react-intl';

// ==============================|| Table-Component ||============================== //

export interface ApplicantApiResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  result: string | null;
}

const ApplicantTableServer = () => {
  const [ItemModal, setItemModal] = useState<boolean>(false);
  const [selectedItem] = useState<ApplicantApiResponse | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const query = searchParams.get('query');
  const intl = useIntl();

  const { data: applicants, isLoading } = api.applicant.getPagination.useQuery({
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    search: query || ''
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
              router.push(`/applicant/detail/${row.original.id}`);
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
      <MainCard title={<FormattedMessage id="applicant" />}>
        <Stack sx={{ gap: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">
              <FormattedMessage id="applicant-data" />
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                router.push('/applicant/add');
              }}
              size="large"
            >
              <FormattedMessage id="add-applicant-btn" />
            </Button>
          </Stack>
        </Stack>
        <TableContent<ApplicantApiResponse>
          {...{
            table,
            isPending: isLoading,
            isServerPagination: true,
            onRowClick: (row) => {
              router.push(`/applicant/detail/${row.original.id}`);
            }
          }}
        />
      </MainCard>

      <TableModal open={ItemModal} modalToggler={setItemModal} item={selectedItem} />
    </>
  );
};

export default ApplicantTableServer;
