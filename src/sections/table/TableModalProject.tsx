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
import { ProjectApiResponse } from 'components/table/ProjectTableServer';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: ProjectApiResponse | null;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

function getInitialValues(item: ProjectApiResponse | null) {
  return {
    id: item?.id || 0,
    name: item?.name || '',
    description: item?.description || '',
    status: item?.status || '',

    member: item?.projectMembers?.map((pm) => pm.userId) || [],

    createdAt: item?.createdAt || null
  };
}

export default function TableModal({ open, modalToggler, item }: Props) {
  const ItemSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
  });

  const {data: members} = api.user.getAll.useQuery();
  const { data: projectDetail } = api.project.getById.useQuery(
    { id: item?.id || 0 },
    {
      enabled: Boolean(item?.id)
    }
  );

  const editingItem = projectDetail ?? item;

  const projectStatus = [
    'ACTIVE',
    'DONE',
    'CANCELED'
  ];

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const utils = api.useUtils();
  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      utils.project.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Project created successfully.',
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
        message: ctx.message || 'Error creating project.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error creating project:', ctx.message);
    }
  });

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      utils.project.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Project updated successfully.',
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
        message: ctx.message || 'Error updating project.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error updating project:', ctx.message);
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(editingItem ?? null),
    validationSchema: ItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (item) await updateProject.mutateAsync({...values, id: item?.id! });
        else await createProject.mutateAsync(values);
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
                  <DialogTitle>{item ? 'Edit Project' : 'New Project'}</DialogTitle>
                  <Divider />
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="name">Name</InputLabel>
                          <TextField
                            fullWidth
                            id="name"
                            placeholder="Enter Project Name"
                            {...getFieldProps('name')}
                            error={Boolean(touched.name && errors.name)}
                            helperText={touched.name && errors.name}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="description">Description</InputLabel>
                          <TextField
                            fullWidth
                            id="description"
                            placeholder="Enter Description"
                            {...getFieldProps('description')}
                            error={Boolean(touched.description && errors.description)}
                            helperText={touched.description && errors.description}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="assign-member" >Assign Member</InputLabel>
                          <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            value={formik.values.member}
                            onChange={(e) => {
                              const val = e.target.value as unknown;
                              if (Array.isArray(val)) {
                                formik.setFieldValue(
                                  'member',
                                  val.map((v) => (typeof v === 'string' ? parseInt(v, 10) : v))
                                );
                              } else if (typeof val === 'string') {
                                // when value comes as comma separated string
                                formik.setFieldValue(
                                  'member',
                                  val.split(',').map((v) => parseInt(v, 10))
                                );
                              } else {
                                formik.setFieldValue('member', []);
                              }
                            }}
                            input={<OutlinedInput id="select-multiple-chip" placeholder="Assign Member" />}
                            placeholder='Assign Member'
                            renderValue={(selected) => {
                              const arr = Array.isArray(selected) ? selected : [];
                              return arr.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {arr.map((value) => {
                                    const id = typeof value === 'string' ? parseInt(value, 10) : value;
                                    return (
                                      <Chip
                                        key={id}
                                        label={members?.find((u) => u.id === id)?.username}
                                        variant="light"
                                        color="primary"
                                        size="small"
                                      />
                                    );
                                  })}
                                </Box>
                              ) : (
                                <p style={{ color: '#999' }}>Assign Member</p>
                              );
                            }}
                          >
                            {members?.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.username}
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
                            value={formik.values.status}
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
                                  color={selected === "ACTIVE" || selected === "DONE" ? "success" : "error"}
                                  size="small"
                                />
                              ) : (
                                <p style={{ color: '#999', margin: 0 }}>
                                  Select Status
                                </p>
                              )
                            }
                          >
                            {projectStatus.map((status) => (
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
              {item && <AlertItemDelete item={item} open={openAlert} handleClose={handleAlertClose} />}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
