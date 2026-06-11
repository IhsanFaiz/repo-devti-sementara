'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, Typography, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { FormattedMessage, useIntl } from 'react-intl';
import { SnackbarProps } from 'types/snackbar';

// ==============================|| FORM - TAMBAH / EDIT PELAMAR ||============================== //

interface AddApplicantFormProps {
  applicantId?: number;
}

const AddApplicantForm = ({ applicantId }: AddApplicantFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!applicantId;
  const utils = api.useUtils();
  const intl = useIntl();

  // Max date for date of birth (yesterday)
  const today = new Date();
  today.setDate(today.getDate());
  const maxDate = today.toISOString().split('T')[0];

  // Form state - Data Diri
  const [namaLengkap, setNamaLengkap] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [domisili, setDomisili] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [email, setEmail] = useState('');

  // Form state - Berkas Lamaran
  const [suratLamaran, setSuratLamaran] = useState('');
  const [cv, setCv] = useState('');
  const [portofolio, setPortofolio] = useState('');
  const [ijazahSkl, setIjazahSkl] = useState('');
  const [ktp, setKtp] = useState('');

  // Fetch existing data for edit mode
  const { data: applicantData } = api.applicant.getById.useQuery({ id: applicantId! }, { enabled: isEditMode });

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (applicantData) {
      setNamaLengkap(`${applicantData.firstName} ${applicantData.lastName}`.trim());
      setTempatLahir(applicantData.placeOfBirth || '');
      setTanggalLahir(applicantData.dateOfBirth ? new Date(applicantData.dateOfBirth).toISOString().split('T')[0] : '');
      setDomisili(applicantData.domicile || '');
      setNomorTelepon(applicantData.phoneNumber || '');
      setEmail(applicantData.email || '');

      // Pre-fill berkas lamaran from applicantDocuments
      if (applicantData.applicantDocuments) {
        for (const doc of applicantData.applicantDocuments) {
          if (!doc.document) continue;
          const docType = (doc.document.documentType || '').toLowerCase();
          const docPath = doc.document.path || '';
          if (docType.includes('surat lamaran') || docType.includes('cover')) setSuratLamaran(docPath);
          else if (docType.includes('cv')) setCv(docPath);
          else if (docType.includes('portofolio') || docType.includes('portfolio')) setPortofolio(docPath);
          else if (docType.includes('ijazah') || docType.includes('skl') || docType.includes('diploma')) setIjazahSkl(docPath);
          else if (docType.includes('ktp') || docType.includes('id card')) setKtp(docPath);
        }
      }
    }
  }, [applicantData]);

  const createApplicant = api.applicant.create.useMutation({
    onSuccess: () => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-applicant-created' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      utils.applicant.invalidate();
      router.push('/applicant');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message: error.message || intl.formatMessage({ id: 'msg-applicant-create-error' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      setIsSubmitting(false);
    }
  });

  const updateApplicant = api.applicant.update.useMutation({
    onSuccess: () => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-applicant-updated' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      utils.applicant.invalidate();
      router.push('/applicant');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message: error.message || intl.formatMessage({ id: 'msg-applicant-update-error' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
      setIsSubmitting(false);
    }
  });

  const deleteApplicant = api.applicant.delete.useMutation({
    onSuccess: () => {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-applicant-deleted' }),
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      utils.applicant.invalidate();
      router.push('/applicant');
    },
    onError: (error) => {
      openSnackbar({
        open: true,
        message: error.message || intl.formatMessage({ id: 'msg-applicant-delete-error' }),
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  });

  const handleDelete = () => {
    if (!applicantId) return;
    if (window.confirm(intl.formatMessage({ id: 'msg-confirm-delete' }))) {
      setIsSubmitting(true);
      deleteApplicant.mutate({ id: applicantId });
    }
  };

  const handleSubmit = () => {
    if (!namaLengkap || !tempatLahir || !tanggalLahir || !domisili || !nomorTelepon || !email) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-fill-all-fields' }),
        variant: 'alert',
        alert: { color: 'warning' }
      } as SnackbarProps);
      return;
    }

    // Validate date of birth is before today
    const dob = new Date(tanggalLahir);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (dob >= now) {
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'msg-dob-future' }),
        variant: 'alert',
        alert: { color: 'warning' }
      } as SnackbarProps);
      return;
    }

    setIsSubmitting(true);

    // Split nama lengkap into firstName and lastName
    const nameParts = namaLengkap.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Parse date
    const dateOfBirth = new Date(tanggalLahir);

    // Build documents array
    const documents = [
      { documentType: 'Surat Lamaran', path: suratLamaran },
      { documentType: 'CV', path: cv },
      { documentType: 'Portofolio', path: portofolio },
      { documentType: 'Ijazah / SKL', path: ijazahSkl },
      { documentType: 'KTP', path: ktp }
    ].filter((d) => d.path.trim() !== '');

    if (isEditMode && applicantId) {
      updateApplicant.mutate({
        id: applicantId,
        firstName,
        lastName,
        placeOfBirth: tempatLahir,
        dateOfBirth,
        domicile: domisili,
        phoneNumber: nomorTelepon,
        email,
        documents
      });
    } else {
      createApplicant.mutate({
        firstName,
        lastName,
        placeOfBirth: tempatLahir,
        dateOfBirth,
        domicile: domisili,
        phoneNumber: nomorTelepon,
        email,
        result: 'PENDING',
        documents
      });
    }
  };

  return (
    <Stack spacing={3}>
      {/* Data Diri */}
      <MainCard title={<FormattedMessage id="personal-data" />}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="full-name" />
            </Typography>
            <TextField fullWidth placeholder="Nama Lengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="place-of-birth" />
            </Typography>
            <TextField fullWidth placeholder="Tempat Lahir" value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="date-of-birth" />
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: maxDate }}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="domicile" />
            </Typography>
            <TextField fullWidth placeholder="Domisili" value={domisili} onChange={(e) => setDomisili(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="phone-number" />
            </Typography>
            <TextField fullWidth placeholder="Nomor Telepon" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="email" />
            </Typography>
            <TextField fullWidth placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Stack>
        </Stack>
      </MainCard>

      {/* Berkas Lamaran */}
      <MainCard title={<FormattedMessage id="application-documents" />}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="cover-letter" />
            </Typography>
            <TextField fullWidth placeholder="Surat Lamaran" value={suratLamaran} onChange={(e) => setSuratLamaran(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="cv" />
            </Typography>
            <TextField fullWidth placeholder="CV" value={cv} onChange={(e) => setCv(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="portfolio" />
            </Typography>
            <TextField fullWidth placeholder="Portofolio" value={portofolio} onChange={(e) => setPortofolio(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="diploma" />
            </Typography>
            <TextField fullWidth placeholder="Ijazah / SKL" value={ijazahSkl} onChange={(e) => setIjazahSkl(e.target.value)} />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              <FormattedMessage id="id-card" />
            </Typography>
            <TextField fullWidth placeholder="KTP" value={ktp} onChange={(e) => setKtp(e.target.value)} />
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          {isEditMode && (
            <Button variant="outlined" color="error" onClick={handleDelete} disabled={isSubmitting} size="large">
              <FormattedMessage id="delete" />
            </Button>
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting} size="large">
            {isEditMode ? <FormattedMessage id="edit" /> : <FormattedMessage id="submit" />}
          </Button>
        </Stack>
      </MainCard>
    </Stack>
  );
};

export default AddApplicantForm;
