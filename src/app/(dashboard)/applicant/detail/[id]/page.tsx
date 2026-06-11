'use client';

import { Stack } from '@mui/material';
import AddApplicantForm from 'components/table/AddApplicantForm';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const id = Number(params.id);

  return (
    <Stack spacing={2}>
      <AddApplicantForm applicantId={id} />
    </Stack>
  );
};

export default Page;
