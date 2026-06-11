'use client';

import { Stack } from '@mui/material';
import EmployeeTable from 'components/table/EmployeeTable';
import EmployeeListTable from 'components/table/EmployeeListTable';

const Page = () => {
  return (
    <Stack spacing={2}>
      <EmployeeTable />
      <EmployeeListTable />
    </Stack>
  );
};

export default Page;
