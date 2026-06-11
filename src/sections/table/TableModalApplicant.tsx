// File: src/sections/table/TableModalApplicant.tsx
import { useState } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  OutlinedInput,
  Chip
} from '@mui/material';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { Trash } from 'iconsax-react';
import AlertItemDelete from './AlertItemDeleteApplicant';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { ApplicantApiResponse } from 'components/table/ApplicantTable'; // Import dari ApplicantTable
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: ApplicantApiResponse | null;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

function getInitialValues(item: any | null) {
  return {
    id: item?.id || 0,
    firstName: item?.firstName || '',
    lastName: item?.lastName || '',
    email: item?.email || '',
    phoneNumber: item?.phoneNumber || '',
    placeOfBirth: item?.placeOfBirth || '',
    dateOfBirth: item?.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '', // Format tanggal standar input date HTML
    domicile: item?.domicile || '',
    result: item?.result || 'PENDING'
  };
}

export default function TableModal({ open, modalToggler, item }: Props) {
  const ItemSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phoneNumber: Yup.string().required('Phone Number is required'),
    placeOfBirth: Yup.string().required('Place of Birth is required'),
    dateOfBirth: Yup.date().required('Date of Birth is required'),
    domicile: Yup.string().required('Domicile is required'),
    result: Yup.string()
  });

  // Query untuk mode Edit
  const { data: applicantDetail } = api.applicant.getById.useQuery({ id: item?.id || 0 }, { enabled: Boolean(item?.id) });

  const editingItem = applicantDetail ?? item;

  const applicantStatus = ['PENDING', 'PASSED', 'FAILED'];

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const utils = api.useUtils();

  const createApplicant = api.applicant.create.useMutation({
    onSuccess: () => {
      utils.applicant.invalidate();
      utils.applicant.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Applicant created successfully.',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      closeModal();
    },
    onError: (ctx) => {
      openSnackbar({
        open: true,
        message: ctx.message || 'Error creating applicant.',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  });

  const updateApplicant = api.applicant.update.useMutation({
    onSuccess: () => {
      utils.applicant.invalidate();
      utils.applicant.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Applicant updated successfully.',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      closeModal();
    },
    onError: (ctx) => {
      openSnackbar({
        open: true,
        message: ctx.message || 'Error updating applicant.',
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(editingItem ?? null),
    validationSchema: ItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Konversi string date dari input html kembali jadi object Date (karena router nerima tipe Date)
        const formattedValues = {
          ...values,
          dateOfBirth: new Date(values.dateOfBirth),
          documents: []
        };

        if (item) {
          await updateApplicant.mutateAsync({ ...formattedValues, id: item?.id! });
        } else {
          await createApplicant.mutateAsync(formattedValues);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;
  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-item-add-label"
          aria-describedby="modal-item-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar sx={{ maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              <FormikProvider value={formik}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                  <DialogTitle>{item ? 'Edit Applicant' : 'New Applicant'}</DialogTitle>
                  <Divider />

                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      {/* Baris 1: Nama */}
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="firstName">First Name</InputLabel>
                          <TextField
                            fullWidth
                            id="firstName"
                            placeholder="Enter First Name"
                            {...getFieldProps('firstName')}
                            error={Boolean(touched.firstName && errors.firstName)}
                            helperText={touched.firstName && typeof errors.firstName === 'string' ? errors.firstName : ''}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="lastName">Last Name</InputLabel>
                          <TextField
                            fullWidth
                            id="lastName"
                            placeholder="Enter Last Name"
                            {...getFieldProps('lastName')}
                            error={Boolean(touched.lastName && errors.lastName)}
                            helperText={touched.lastName && typeof errors.lastName === 'string' ? errors.lastName : ''}
                          />
                        </Stack>
                      </Grid>

                      {/* Baris 2: Kontak */}
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="email">Email</InputLabel>
                          <TextField
                            fullWidth
                            id="email"
                            type="email"
                            placeholder="Enter Email"
                            {...getFieldProps('email')}
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && typeof errors.email === 'string' ? errors.email : ''}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="phoneNumber">Phone Number</InputLabel>
                          <TextField
                            fullWidth
                            id="phoneNumber"
                            placeholder="Enter Phone Number"
                            {...getFieldProps('phoneNumber')}
                            error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                            helperText={touched.phoneNumber && typeof errors.phoneNumber === 'string' ? errors.phoneNumber : ''}
                          />
                        </Stack>
                      </Grid>

                      {/* Baris 3: Tempat & Tanggal Lahir */}
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="placeOfBirth">Place of Birth</InputLabel>
                          <TextField
                            fullWidth
                            id="placeOfBirth"
                            placeholder="Enter Place of Birth"
                            {...getFieldProps('placeOfBirth')}
                            error={Boolean(touched.placeOfBirth && errors.placeOfBirth)}
                            helperText={touched.placeOfBirth && typeof errors.placeOfBirth === 'string' ? errors.placeOfBirth : ''}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="dateOfBirth">Date of Birth</InputLabel>
                          <TextField
                            fullWidth
                            id="dateOfBirth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            {...getFieldProps('dateOfBirth')}
                            error={Boolean(touched.dateOfBirth && errors.dateOfBirth)}
                            helperText={touched.dateOfBirth && (errors.dateOfBirth as string)}
                          />
                        </Stack>
                      </Grid>

                      {/* Baris 4: Domisili & Status */}
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="domicile">Domicile</InputLabel>
                          <TextField
                            fullWidth
                            id="domicile"
                            placeholder="Enter Domicile"
                            {...getFieldProps('domicile')}
                            error={Boolean(touched.domicile && errors.domicile)}
                            helperText={touched.domicile && typeof errors.domicile === 'string' ? errors.domicile : ''}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="result-status-label">Status</InputLabel>
                          <Select
                            labelId="result-status-label"
                            id="result-select"
                            value={formik.values.result}
                            onChange={(e) => formik.setFieldValue('result', e.target.value)}
                            input={<OutlinedInput placeholder="Status" />}
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color={selected === 'PASSED' ? 'success' : selected === 'PENDING' ? 'warning' : 'error'}
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>Select Status</p>
                              )
                            }
                          >
                            {applicantStatus.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                    </Grid>
                  </DialogContent>

                  <Divider />

                  <DialogActions sx={{ p: 2.5 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        {item && (
                          <Tooltip title="Delete Applicant" placement="top">
                            <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                              <Trash variant="Bold" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Grid>
                      <Grid item>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Button color="error" onClick={closeModal}>
                            Cancel
                          </Button>
                          <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {item ? 'Save' : 'Add'}
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </DialogActions>
                </Form>
              </FormikProvider>

              {item && <AlertItemDelete item={item} open={openAlert} handleClose={handleAlertClose} />}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
