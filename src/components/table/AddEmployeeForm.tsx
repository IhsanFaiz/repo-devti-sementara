'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Stack, Typography, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import MainCard from 'components/MainCard';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| FORM - TAMBAH PEGAWAI ||============================== //

export default function AddEmployeeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();
  const intl = useIntl();

  const searchParams = useSearchParams();
  const editIdStr = searchParams.get('id');
  const editId = editIdStr ? Number(editIdStr) : null;
  const isEditMode = !!editId;

  // Form states
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [nip, setNip] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [previousPosition, setPreviousPosition] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [startWorking, setStartWorking] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [status, setStatus] = useState('');
  const [keteranganDate, setKeteranganDate] = useState('');

  // Fetch onboarding employees for the dropdown
  const { data: onboardingEmployees, isLoading } = api.employee.getOnboardingEmployees.useQuery();

  // Fetch existing employee data if in edit mode
  const { data: employeeData } = api.employee.getById.useQuery({ id: editId! }, { enabled: isEditMode });

  useEffect(() => {
    if (employeeData) {
      setEmployeeId(employeeData.id);
      setNip(employeeData.nip || '');
      setJobDesc(employeeData.jobDesc || '');
      setPreviousPosition(employeeData.previousPosition || '');
      setCurrentPosition(employeeData.currentPosition || '');
      setStartWorking(employeeData.startWorking ? new Date(employeeData.startWorking).toISOString().split('T')[0] : '');
      setEmployeeType(employeeData.employeeType || '');
      setStatus(employeeData.status || '');
      setKeteranganDate(employeeData.keteranganDate || '');
    }
  }, [employeeData]);

  const promoteMutation = api.employee.promoteToEmployee.useMutation({
    onSuccess: () => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-employee-saved' }),
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);

      utils.employee.getAll.invalidate();
      utils.employee.getSummary.invalidate();

      router.push('/employee');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-employee-save-error' }) + ' ' + error.message,
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      setIsSubmitting(false);
    }
  });

  const deleteMutation = api.employee.delete.useMutation({
    onSuccess: () => {
      openSnackbar({
        open: true,
        message: 'Pegawai berhasil dihapus',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);

      utils.employee.getAll.invalidate();
      utils.employee.getSummary.invalidate();

      router.push('/employee');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message: 'Gagal menghapus pegawai: ' + error.message,
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      setIsSubmitting(false);
    }
  });

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) {
      setIsSubmitting(true);
      deleteMutation.mutate({ id: editId! });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId || !nip || !jobDesc || !currentPosition || !startWorking || !employeeType || !status) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-fill-all-fields-employee' }),
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      return;
    }

    setIsSubmitting(true);
    promoteMutation.mutate({
      employeeId: Number(employeeId),
      nip,
      jobDesc,
      previousPosition,
      currentPosition,
      startWorking,
      employeeType,
      status,
      keteranganDate
    });
  };

  return (
    <MainCard title={<FormattedMessage id="add-employee-title" />}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h5">
            <FormattedMessage id="employee-data" />
          </Typography>

          <FormControl fullWidth>
            <InputLabel>
              <FormattedMessage id="full-name" />
            </InputLabel>
            <Select
              value={employeeId}
              label={intl.formatMessage({ id: 'full-name' })}
              onChange={(e) => setEmployeeId(e.target.value as number)}
              disabled={isLoading}
            >
              {isEditMode && employeeData && (
                <MenuItem key={employeeData.id} value={employeeData.id}>
                  {employeeData.firstName} {employeeData.lastName}
                </MenuItem>
              )}
              {!isEditMode &&
                onboardingEmployees?.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              {!isLoading && !isEditMode && (!onboardingEmployees || onboardingEmployees.length === 0) && (
                <MenuItem value="" disabled>
                  <FormattedMessage id="no-employee-data" />
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField fullWidth label={<FormattedMessage id="nip" />} value={nip} onChange={(e) => setNip(e.target.value)} />

          <FormControl fullWidth>
            <InputLabel>
              <FormattedMessage id="job-desc" />
            </InputLabel>
            <Select value={jobDesc} label={intl.formatMessage({ id: 'job-desc' })} onChange={(e) => setJobDesc(e.target.value)}>
              {[
                'Kepala Bagian Pengembangan Produk Teknologi Informasi',
                'Urusan Akademik',
                'Urusan Non-Akademik',
                'Urusan Strategis',
                'Urusan Satu data',
                'Kepala Bagian',
                'Kepala Urusan',
                'System Analyst',
                'Data Management',
                'Technical Writer',
                'Quality Assurance',
                'Frontend Developer',
                'Backend Developer',
                'PHP Developer',
                'UI/UX Designer'
              ].map((jd) => (
                <MenuItem key={jd} value={jd}>
                  {jd}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={<FormattedMessage id="old-sotk-position" />}
            value={previousPosition}
            onChange={(e) => setPreviousPosition(e.target.value)}
          />

          <TextField
            fullWidth
            label={<FormattedMessage id="new-sotk-position" />}
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
          />

          <TextField
            fullWidth
            label={<FormattedMessage id="start-working-date" />}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startWorking}
            onChange={(e) => setStartWorking(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>
              <FormattedMessage id="employee-status" />
            </InputLabel>
            <Select
              value={employeeType}
              label={intl.formatMessage({ id: 'employee-status' })}
              onChange={(e) => setEmployeeType(e.target.value)}
            >
              <MenuItem value="Tenaga Lepas Harian">
                <FormattedMessage id="freelance" />
              </MenuItem>
              <MenuItem value="Outsource">
                <FormattedMessage id="outsource" />
              </MenuItem>
              <MenuItem value="Magang Akademik">
                <FormattedMessage id="intern" />
              </MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth label={<FormattedMessage id="remarks" />} value={status} onChange={(e) => setStatus(e.target.value)} />

          <TextField
            fullWidth
            label={<FormattedMessage id="remarks-date" />}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={keteranganDate}
            onChange={(e) => setKeteranganDate(e.target.value)}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" color="secondary" onClick={() => router.push('/employee')} disabled={isSubmitting}>
              Cancel
            </Button>
            {isEditMode && (
              <Button variant="outlined" color="error" onClick={handleDelete} disabled={isSubmitting}>
                Hapus
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </MainCard>
  );
}
