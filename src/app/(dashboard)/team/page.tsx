'use client';

import { Box, Stack } from '@mui/material';
import TeamProjectTable from 'components/table/TeamProjectTable';

export default function TeamProjectPage() {
  return (
    <Box>
      <Stack spacing={3}>
        <TeamProjectTable />
      </Stack>
    </Box>
  );
}
