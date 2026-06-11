'use client';

import { Box, Checkbox, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import MainCard from 'components/MainCard';
import { api } from 'trpc/react';
import { useSnackbar } from 'notistack';

export default function OnboardingDetailTable({ applicantId }: { applicantId: number }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const utils = api.useUtils();
  const router = useRouter();

  const { data, isLoading } = api.onboarding.getChecklist.useQuery({
    applicantId
  });

  const updateProgress = api.onboarding.updateProgress.useMutation({
    onSuccess: () => {
      utils.onboarding.getChecklist.invalidate({ applicantId });
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal menyimpan: ${error.message}`, { variant: 'error' });
    }
  });

  const toggleCheck = (modulId: number, currentStatus: boolean) => {
    updateProgress.mutate({
      applicantId,
      modulId,
      checked: !currentStatus
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MainCard title="Ceklist Onboarding & Training" content={false}>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <TableHead sx={{ backgroundColor: theme.palette.background.default }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}`, width: '25%' }}>
                Kelompok Checklist
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}`, width: '5%' }}>
                No
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                Daftar Checklist yang Harus diselesaikan
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}`, width: '10%' }}>
                Keterangan
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>
                Sumber Informasi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.map((group: any, gIndex: number) =>
                group.items.map((item: any, iIndex: number) => (
                  <TableRow key={item.id} hover>
                    {iIndex === 0 && (
                      <TableCell
                        rowSpan={group.items.length}
                        sx={{ borderRight: `1px solid ${theme.palette.divider}`, verticalAlign: 'top', pt: 2 }}
                      >
                        {group.group}
                      </TableCell>
                    )}
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {item.id}
                    </TableCell>
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{item.name}</TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id, item.checked)}
                        disabled={updateProgress.isPending}
                        sx={{
                          color: '#d9d9d9',
                          '&.Mui-checked': {
                            color: '#bb2a33'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{item.source}</TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            enqueueSnackbar('Progres berhasil disimpan', { variant: 'success' });
            router.push('/onboarding');
          }}
        >
          Simpan
        </Button>
      </Stack>
    </MainCard>
  );
}
