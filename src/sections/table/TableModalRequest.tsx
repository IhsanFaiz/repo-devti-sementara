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
  Box,
  Chip
} from '@mui/material';
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { Trash } from 'iconsax-react';
import AlertItemDelete from './AlertItemDeleteProject';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { RequestApiResponse } from 'components/table/RequestTable';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: RequestApiResponse | null;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

function getInitialValues(item: RequestApiResponse | null) {
  return {
    id: item?.id || 0,
    references: item?.references || '',
    applicationName: item?.applicationName || '',
    status: item?.status || 'PENDING',
    description     :item?.description || '',
    version         :item?.version || '',
    via             :item?.via || 'NDE & Notulensi',
    psal            :item?.psal || '',
    department      :item?.department || '',
    category        :item?.category || 'Akademik',
    framework       :item?.framework || 'SATU',
    groupType       :item?.groupType || 'Application',
    serviceType     :item?.serviceType || '',
    subServiceType  :item?.subServiceType || '',
    priority        :item?.priority || 'MEDIUM',
    slaDays         :item?.slaDays || 0,
  };
}

export default function TableModal({ open, modalToggler, item }: Props) {
  const ItemSchema = Yup.object().shape({
    references: Yup.string().required('References is required'),
    applicationName: Yup.string().required('App Name is required'),
  });

  const requestStatus = [
    'APPROVED',
    'PENDING',
    'REJECTED'
  ];

  const requestPriority = [
    'HIGH',
    'MEDIUM',
    'LOW'
  ];

  const requestVia = [
    'NDE & Notulensi',
    'NDE',
    'Notulensi',
    'Tiket'
  ];

  const requestCategory = [
    'Akademik',
    'Non Akademik',
    'Strategis',
  ];

  const requestFramework = [
    'SATU',
    'iGracias',
    'SITU',
    'My Tel-U Core',
  ];

  const requestGroupType = [
    'Application',
    'API',
  ];

  

  const [openAlert, setOpenAlert] = useState(false);

  const { data: requestDetail } = api.request.getById.useQuery(
      { id: item?.id || 0 },
      { enabled: Boolean(item?.id) }
    );
  
    const editingItem = requestDetail ?? item;

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const utils = api.useUtils();
  const createRequest = api.request.create.useMutation({
    onSuccess: () => {
      utils.request.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'app request created successfully.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
      closeModal();
    },
    onError: (ctx) => {
      openSnackbar({
        open: true,
        message: ctx.message || 'Error creating app request.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error creating app request:', ctx.message);
    }
  });

  const updateRequest = api.request.update.useMutation({
    onSuccess: () => {
      utils.request.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'app request updated successfully.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
      closeModal();
    },
    onError: (ctx) => {
      openSnackbar({
        open: true,
        message: ctx.message || 'Error updating app request.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error updating app request:', ctx.message);
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(editingItem ?? null),
    validationSchema: ItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (item) await updateRequest.mutateAsync({...values, id: item?.id! });
        else await createRequest.mutateAsync(values);
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
                  <DialogTitle>{item ? 'Edit App Request' : 'New App Request'}</DialogTitle>
                  <Divider />
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="references">References</InputLabel>
                          <TextField
                            fullWidth
                            id="references"
                            placeholder="Enter References"
                            {...getFieldProps('references')}
                            error={Boolean(touched.references && errors.references)}
                            helperText={touched.references && errors.references}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="applicationName">App Name</InputLabel>
                          <TextField
                            fullWidth
                            id="applicationName"
                            placeholder="Enter App Name"
                            {...getFieldProps('applicationName')}
                            error={Boolean(touched.applicationName && errors.applicationName)}
                            helperText={touched.applicationName && errors.applicationName}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="description">Feature & Description</InputLabel>
                          <TextField
                            fullWidth
                            id="description"
                            placeholder="Enter Feature & Description"
                            {...getFieldProps('description')}
                            multiline
                            rows={5}
                            error={Boolean(touched.description && errors.description)}
                            helperText={touched.description && errors.description}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="psal">PSAL</InputLabel>
                          <TextField
                            fullWidth
                            id="psal"
                            placeholder="Enter PSAL"
                            {...getFieldProps('psal')}
                            error={Boolean(touched.psal && errors.psal)}
                            helperText={touched.psal && errors.psal}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="department">Department</InputLabel>
                          <TextField
                            fullWidth
                            id="department"
                            placeholder="Enter Department"
                            {...getFieldProps('department')}
                            error={Boolean(touched.department && errors.department)}
                            helperText={touched.department && errors.department}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="category" >Category</InputLabel>
                          <Select
                            labelId="demo-chip-label"
                            id="demo-chip"
                            value={formik.values.category}
                            onChange={(e) => {
                              formik.setFieldValue('category', e.target.value);
                            }}
                            input={<OutlinedInput id="select-chip" placeholder="Category" />}
                            placeholder='Category'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color="primary"
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select category
                                </p>
                              )
                            }
                          >
                            {requestCategory.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="via" >via</InputLabel>
                          <Select
                            labelId="demo-chip-label"
                            id="demo-chip"
                            value={formik.values.via}
                            onChange={(e) => {
                              formik.setFieldValue('via', e.target.value);
                            }}
                            input={<OutlinedInput id="select-chip" placeholder="Via" />}
                            placeholder='Via'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color="primary"
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select via
                                </p>
                              )
                            }
                          >
                            {requestVia.map((via) => (
                              <MenuItem key={via} value={via}>
                                {via}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="framework" >Framework</InputLabel>
                          <Select
                            labelId="demo-chip-label"
                            id="demo-chip"
                            value={formik.values.framework}
                            onChange={(e) => {
                              formik.setFieldValue('framework', e.target.value);
                            }}
                            input={<OutlinedInput id="select-chip" placeholder="Framework" />}
                            placeholder='Framework'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color="primary"
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select framework
                                </p>
                              )
                            }
                          >
                            {requestFramework.map((framework) => (
                              <MenuItem key={framework} value={framework}>
                                {framework}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="version">Version</InputLabel>
                          <TextField
                            fullWidth
                            id="version"
                            type='number'
                            placeholder="Enter Version"
                            {...getFieldProps('version')}
                            error={Boolean(touched.version && errors.version)}
                            helperText={touched.version && errors.version}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="groupType" >Group Type</InputLabel>
                          <Select
                            labelId="demo-chip-label"
                            id="demo-chip"
                            value={formik.values.groupType}
                            onChange={(e) => {
                              formik.setFieldValue('groupType', e.target.value);
                            }}
                            input={<OutlinedInput id="select-chip" placeholder="Group Type" />}
                            placeholder='Group Type'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color="primary"
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select groupType
                                </p>
                              )
                            }
                          >
                            {requestGroupType.map((groupType) => (
                              <MenuItem key={groupType} value={groupType}>
                                {groupType}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="serviceType">Service Type</InputLabel>
                          <TextField
                            fullWidth
                            id="serviceType"
                            placeholder="Enter Service Type"
                            {...getFieldProps('serviceType')}
                            error={Boolean(touched.serviceType && errors.serviceType)}
                            helperText={touched.serviceType && errors.serviceType}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="subServiceType">Sub Service Type</InputLabel>
                          <TextField
                            fullWidth
                            id="subServiceType"
                            placeholder="Enter Sub Service Type"
                            {...getFieldProps('subServiceType')}
                            error={Boolean(touched.subServiceType && errors.subServiceType)}
                            helperText={touched.subServiceType && errors.subServiceType}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="priority" >Priority</InputLabel>
                          <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            value={formik.values.priority}
                            onChange={(e) => {
                              formik.setFieldValue('priority', e.target.value);
                            }}
                            input={<OutlinedInput id="select-multiple-chip" placeholder="Priority" />}
                            placeholder='Priority'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color={selected === "MEDIUM" ? "warning" : selected === "LOW" ? "default" : "error"}
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select Priority
                                </p>
                              )
                            }
                          >
                            {requestPriority.map((priority) => (
                              <MenuItem key={priority} value={priority}>
                                {priority}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="status" >Status</InputLabel>
                          <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            value={formik.values.status }
                            onChange={(e) => {
                              formik.setFieldValue('status', e.target.value);
                            }}
                            input={<OutlinedInput id="select-multiple-chip" placeholder="Status" />}
                            placeholder='Status'
                            renderValue={(selected) =>
                              selected ? (
                                <Chip
                                  label={selected}
                                  variant="filled"
                                  color={selected === "APPROVED" ? "success" : selected === "PENDING" ? "default" : "error"}
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="PENDING"
                                  variant="filled"
                                  color="default"
                                  size="small"
                                />
                              )
                            }
                          >
                            {requestStatus.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="slaDays">SLA Days</InputLabel>
                          <TextField
                            fullWidth
                            id="slaDays"
                            type='number'
                            placeholder="Enter SLA Days"
                            {...getFieldProps('slaDays')}
                            error={Boolean(touched.slaDays && errors.slaDays)}
                            helperText={touched.slaDays && errors.slaDays}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <Divider />
                  <DialogActions sx={{ p: 2.5 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        {item && (
                          <Tooltip title="Delete Project" placement="top">
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
              {/* {item && <AlertItemDelete item={item} open={openAlert} handleClose={handleAlertClose} />} */}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
