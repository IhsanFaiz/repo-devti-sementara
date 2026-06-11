'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Stack, TextField, InputLabel, Chip, Autocomplete, CircularProgress } from '@mui/material';
import MainCard from 'components/MainCard';
import { api } from 'trpc/react';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';

export default function AddTeamProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const utils = api.useUtils();

  const [teamName, setTeamName] = useState('');
  const [project, setProject] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const { data: employees = [], isLoading: isEmployeesLoading } = api.employee.getAll.useQuery({});

  const { data: editData, isLoading: isEditLoading } = api.team.getById.useQuery({ id: Number(editId) }, { enabled: !!editId });

  useEffect(() => {
    if (editData && editData.team && editData.project) {
      setTeamName(editData.team.teamName);
      setProject(editData.project.name);
      setSelectedEmployees(editData.team.teamMembers.map((tm) => tm.employeeId));
    }
  }, [editData]);

  const createMutation = api.team.createTeamProject.useMutation({
    onSuccess: () => {
      enqueueSnackbar(intl.formatMessage({ id: 'team-project-add-success', defaultMessage: 'Tim & Project berhasil disimpan' }), {
        variant: 'success'
      });
      utils.team.getAll.invalidate();
      router.push('/team');
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal menyimpan: ${error.message}`, { variant: 'error' });
    }
  });

  const updateMutation = api.team.updateTeamProject.useMutation({
    onSuccess: () => {
      enqueueSnackbar('Tim & Project berhasil diperbarui', { variant: 'success' });
      utils.team.getAll.invalidate();
      router.push('/team');
    },
    onError: (error) => {
      enqueueSnackbar(`Gagal memperbarui: ${error.message}`, { variant: 'error' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName || !project) {
      enqueueSnackbar(intl.formatMessage({ id: 'team-project-validation', defaultMessage: 'Mohon lengkapi nama tim dan project' }), {
        variant: 'warning'
      });
      return;
    }

    if (editId) {
      updateMutation.mutate({
        id: Number(editId),
        teamName,
        project,
        employeeIds: selectedEmployees
      });
    } else {
      createMutation.mutate({
        teamName,
        project,
        employeeIds: selectedEmployees
      });
    }
  };

  if (editId && isEditLoading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <MainCard title={<FormattedMessage id="Team & Project" />}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <InputLabel htmlFor="teamName" sx={{ color: 'text.secondary' }}>
              <FormattedMessage id="team-name" defaultMessage="Nama Tim" />
            </InputLabel>
            <TextField
              id="teamName"
              placeholder={intl.formatMessage({ id: 'team-name', defaultMessage: 'Nama Tim' })}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack spacing={1}>
            <InputLabel htmlFor="anggota" sx={{ color: 'text.secondary' }}>
              <FormattedMessage id="members" defaultMessage="Anggota" />
            </InputLabel>
            <Autocomplete
              multiple
              id="anggota"
              options={employees}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={employees.filter((emp) => selectedEmployees.includes(emp.id))}
              onChange={(event, newValue) => {
                setSelectedEmployees(newValue.map((v) => v.id));
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={`${option.firstName} ${option.lastName}`} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} placeholder={intl.formatMessage({ id: 'search-member', defaultMessage: 'Cari Anggota...' })} />
              )}
            />
          </Stack>

          <Stack spacing={1}>
            <InputLabel htmlFor="project" sx={{ color: 'text.secondary' }}>
              <FormattedMessage id="project-name" defaultMessage="Project" />
            </InputLabel>
            <TextField
              id="project"
              placeholder={intl.formatMessage({ id: 'project-name', defaultMessage: 'Project' })}
              value={project}
              onChange={(e) => setProject(e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={createMutation.isPending || updateMutation.isPending || isEmployeesLoading}
            >
              <FormattedMessage id="submit" defaultMessage="Simpan" />
            </Button>
          </Stack>
        </Stack>
      </form>
    </MainCard>
  );
}
