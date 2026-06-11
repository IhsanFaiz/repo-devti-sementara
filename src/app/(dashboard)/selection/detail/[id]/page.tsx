'use client';

import { Stack } from '@mui/material';
import AddSelectionForm from 'components/table/AddSelectionForm';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const id = Number(params.id);

  return (
    <Stack spacing={2}>
      <AddSelectionForm applicantId={id} />
    </Stack>
  );
};

export default Page;
