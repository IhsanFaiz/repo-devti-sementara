'use client';

import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import { Add } from 'iconsax-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from 'react-intl';
import { api } from 'trpc/react';
import { useSnackbar } from 'notistack';

export default function TeamProjectTable() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const utils = api.useUtils();

  const { data: teamProjects, isLoading } = api.team.getAll.useQuery();

  const deleteMutation = api.team.deleteTeamProject.useMutation({
    onSuccess: () => {
      enqueueSnackbar('Data berhasil dihapus', { variant: 'success' });
      utils.team.getAll.invalidate();
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal menghapus data: ${error.message}`, { variant: 'error' });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tim ini?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <MainCard
      content={false}
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            <FormattedMessage id="table-team-project" defaultMessage="Table Team & Project" />
          </Typography>
          <NextLink href="/team/add" passHref legacyBehavior>
            <Button variant="contained" startIcon={<Add />} size="large">
              <FormattedMessage id="add-project" defaultMessage="Tambah Project" />
            </Button>
          </NextLink>
        </Box>
      }
    >
      <Stack spacing={2}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: theme.palette.background.default }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>
                  <FormattedMessage id="team" defaultMessage="Tim" />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>
                  <FormattedMessage id="members" defaultMessage="Anggota" />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '30%' }}>
                  <FormattedMessage id="project-name" defaultMessage="Project" />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                  <FormattedMessage id="action" defaultMessage="Action" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !teamProjects || teamProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="textSecondary">
                      <FormattedMessage id="no-team-project-data" defaultMessage="Tidak ada data tim & project" />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                teamProjects.map((tp) => (
                  <TableRow key={tp.id} hover>
                    <TableCell align="center">{tp.team?.teamName}</TableCell>
                    <TableCell>
                      {tp.team?.teamMembers && tp.team.teamMembers.length > 0 ? (
                        <Stack spacing={1}>
                          {tp.team.teamMembers.map((tm, idx) => (
                            <Typography key={idx} variant="body2">
                              {tm.employee?.firstName} {tm.employee?.lastName}
                            </Typography>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Belum ada anggota
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{tp.project?.name}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button variant="outlined" size="small" color="primary" onClick={() => router.push(`/team/add?id=${tp.id}`)}>
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDelete(tp.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Hapus
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </MainCard>
  );
}
