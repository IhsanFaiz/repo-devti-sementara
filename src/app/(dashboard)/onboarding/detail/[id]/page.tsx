'use client';

import { Stack } from '@mui/material';
import OnboardingDetailTable from 'components/table/OnboardingDetailTable';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const id = Number(params.id);

  return (
    <Stack spacing={2}>
      <OnboardingDetailTable applicantId={id} />
    </Stack>
  );
};

export default Page;
