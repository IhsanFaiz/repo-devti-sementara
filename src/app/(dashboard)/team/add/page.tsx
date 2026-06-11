'use client';

import { Stack, CircularProgress, Box } from '@mui/material';
import { Suspense } from 'react';
import AddTeamProjectForm from 'components/table/AddTeamProjectForm';

export default function AddTeamProjectPage() {
  return (
    <Stack spacing={2}>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <AddTeamProjectForm />
      </Suspense>
    </Stack>
  );
}
