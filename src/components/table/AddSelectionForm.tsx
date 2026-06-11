'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, Typography, TextField, Grid, Select, MenuItem, FormControl } from '@mui/material';
import MainCard from 'components/MainCard';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { SnackbarProps } from 'types/snackbar';

interface AddSelectionFormProps {
  applicantId?: number;
}

const AddSelectionForm = ({ applicantId }: AddSelectionFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intl = useIntl();
  const utils = api.useUtils();

  // Form states for selection process
  const [administration, setAdministration] = useState('');
  const [administrationScore, setAdministrationScore] = useState<number | ''>('');
  const [writtenTest, setWrittenTest] = useState('');
  const [writtenTestScore, setWrittenTestScore] = useState<number | ''>('');
  const [miniProject, setMiniProject] = useState('');
  const [miniProjectScore, setMiniProjectScore] = useState<number | ''>('');
  const [interview, setInterview] = useState('');
  const [interviewScore, setInterviewScore] = useState<number | ''>('');
  const [finalInterview, setFinalInterview] = useState('');
  const [result, setResult] = useState('PENDING');

  const { data: applicantData, isLoading } = api.applicant.getById.useQuery({ id: applicantId! }, { enabled: !!applicantId });

  useEffect(() => {
    if (applicantData) {
      setAdministration(applicantData.administration || '');
      setAdministrationScore(applicantData.administrationScore ?? '');
      setWrittenTest(applicantData.writtenTest || '');
      setWrittenTestScore(applicantData.writtenTestScore ?? '');
      setMiniProject(applicantData.miniProject || '');
      setMiniProjectScore(applicantData.miniProjectScore ?? '');
      setInterview(applicantData.interview || '');
      setInterviewScore(applicantData.interviewScore ?? '');
      setFinalInterview(applicantData.finalInterview || '');
      setResult(applicantData.result || 'PENDING');
    }
  }, [applicantData]);

  const updateApplicant = api.applicant.update.useMutation({
    onSuccess: async () => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-applicant-updated', defaultMessage: 'Selection data updated successfully.' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      await utils.applicant.invalidate();
      router.refresh();
      router.push('/selection');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message:
          error.message || intl.formatMessage({ id: 'msg-applicant-update-error', defaultMessage: 'Failed to update selection data.' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    if (!applicantId) return;
    setIsSubmitting(true);

    // Asumsikan data basic pelamar tidak diubah di sini, hanya data selection
    updateApplicant.mutate({
      id: applicantId,
      administration,
      administrationScore: administrationScore === '' ? null : Number(administrationScore),
      writtenTest,
      writtenTestScore: writtenTestScore === '' ? null : Number(writtenTestScore),
      miniProject,
      miniProjectScore: miniProjectScore === '' ? null : Number(miniProjectScore),
      interview,
      interviewScore: interviewScore === '' ? null : Number(interviewScore),
      finalInterview,
      // field mandatory lain biarkan utuh jika diperlukan oleh router, atau sesuaikan dengan API
      // Untuk amannya, kita perlu mengirim firstName dll jika diwajibkan oleh backend.
      // Jika backend memperbolehkan partial update, maka cukup kirim data yang diubah.
      // Dalam hal ini kita asumsikan applicantData sudah lengkap dan kita kirim balik.
      firstName: applicantData?.firstName || '',
      lastName: applicantData?.lastName || '',
      email: applicantData?.email || '',
      phoneNumber: applicantData?.phoneNumber || '',
      placeOfBirth: applicantData?.placeOfBirth || '',
      dateOfBirth: applicantData?.dateOfBirth ? new Date(applicantData.dateOfBirth) : new Date(),
      domicile: applicantData?.domicile || '',
      result
    });
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (!applicantData) return <Typography>Applicant not found</Typography>;

  return (
    <Stack spacing={3}>
      <MainCard title={<FormattedMessage id="selection-data" defaultMessage="Selection Data" />}>
        <Stack spacing={3}>
          <Typography variant="h6">
            Pelamar: {applicantData.firstName} {applicantData.lastName}
          </Typography>

          <Grid container spacing={3}>
            {/* Administration */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="administration-notes" />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'notes' })}
                  value={administration}
                  onChange={(e) => setAdministration(e.target.value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="administration-score" />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder={intl.formatMessage({ id: 'score' })}
                  value={administrationScore}
                  onChange={(e) => setAdministrationScore(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Stack>
            </Grid>

            {/* Written Test */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="written-test-notes" />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'notes' })}
                  value={writtenTest}
                  onChange={(e) => setWrittenTest(e.target.value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="written-test-score" />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder={intl.formatMessage({ id: 'score' })}
                  value={writtenTestScore}
                  onChange={(e) => setWrittenTestScore(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Stack>
            </Grid>

            {/* Mini Project */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="mini-project-notes" />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'notes' })}
                  value={miniProject}
                  onChange={(e) => setMiniProject(e.target.value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="mini-project-score" />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder={intl.formatMessage({ id: 'score' })}
                  value={miniProjectScore}
                  onChange={(e) => setMiniProjectScore(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Stack>
            </Grid>

            {/* Interview */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="interview-notes" />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'notes' })}
                  value={interview}
                  onChange={(e) => setInterview(e.target.value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="interview-score" />
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder={intl.formatMessage({ id: 'score' })}
                  value={interviewScore}
                  onChange={(e) => setInterviewScore(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Stack>
            </Grid>

            {/* Final Interview */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="final-interview-notes" />
                </Typography>
                <TextField
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'notes' })}
                  value={finalInterview}
                  onChange={(e) => setFinalInterview(e.target.value)}
                />
              </Stack>
            </Grid>

            {/* Result / Status */}
            <Grid item xs={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  <FormattedMessage id="col-result" />
                </Typography>
                <FormControl fullWidth>
                  <Select value={result} onChange={(e) => setResult(e.target.value)}>
                    <MenuItem value="PENDING">
                      <FormattedMessage id="status-pending" />
                    </MenuItem>
                    <MenuItem value="PASSED">
                      <FormattedMessage id="status-passed" />
                    </MenuItem>
                    <MenuItem value="FAILED">
                      <FormattedMessage id="status-failed" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} size="large">
            <FormattedMessage id="submit" defaultMessage="Submit" />
          </Button>
        </Stack>
      </MainCard>
    </Stack>
  );
};

export default AddSelectionForm;
