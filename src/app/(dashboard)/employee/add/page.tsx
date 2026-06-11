import { Stack } from '@mui/material';
import { Suspense } from 'react';
import AddEmployeeForm from 'components/table/AddEmployeeForm';

const Page = () => {
  return (
    <Stack spacing={2}>
      <Suspense fallback={<div>Loading...</div>}>
        <AddEmployeeForm />
      </Suspense>
    </Stack>
  );
};

export default Page;
