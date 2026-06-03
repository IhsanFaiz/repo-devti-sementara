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
  Tooltip
} from '@mui/material';
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { Trash } from 'iconsax-react';
import AlertItemDelete from './AlertItemDeleteUsers';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { UserApiResponse } from 'components/table/UserTable';
import { api } from 'trpc/react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: UserApiResponse | null;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

function getInitialValues(item: UserApiResponse | null) {
  return {
    id: item?.id || 0,
    username: item?.username || '',
    email: item?.email || '',
    roleId: item?.roleId || 0,
    password: ''
  };
}

export default function TableModal({ open, modalToggler, item }: Props) {
  const ItemSchema = Yup.object().shape({
    username: Yup.string().min(1).required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    roleId: Yup.number().required('Role is required')
  });

  const { data: userDetail } = api.user.getById.useQuery(
    { id: item?.id || 0 },
    { enabled: Boolean(item?.id) }
  );

  const { data: roles } = api.role.getAll.useQuery();

  const editingItem = userDetail ?? item;

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const utils = api.useUtils();
  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
      utils.user.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'User created successfully.',
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
        message: ctx.message || 'Error creating user.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error creating user:', ctx.message);
    }
  });

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
      utils.user.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'User updated successfully.',
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
        message: ctx.message || 'Error updating user.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error updating user:', ctx.message);
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(editingItem ?? null),
    validationSchema: ItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (item) await updateUser.mutateAsync({ id: item?.id!, username: values.username, email: values.email, roleId: Number(values.roleId) });
        else await createUser.mutateAsync({ username: values.username, email: values.email, password: values.password, roleId: Number(values.roleId) });
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
                  <DialogTitle>{item ? 'Edit User' : 'New User'}</DialogTitle>
                  <Divider />
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="username">Username</InputLabel>
                          <TextField
                            fullWidth
                            id="username"
                            placeholder="Enter Username"
                            {...getFieldProps('username')}
                            error={Boolean(touched.username && errors.username)}
                            helperText={touched.username && errors.username}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="email">Email</InputLabel>
                          <TextField
                            fullWidth
                            id="email"
                            placeholder="Enter Email"
                            {...getFieldProps('email')}
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Stack>
                      </Grid>
                      {!item && (
                        <Grid item xs={12}>
                          <Stack spacing={1}>
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <TextField
                              fullWidth
                              id="password"
                              type="password"
                              placeholder="Enter Password"
                              {...getFieldProps('password')}
                              error={Boolean(touched.password && errors.password)}
                              helperText={touched.password && errors.password}
                            />
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel id="role-label">Role</InputLabel>
                          <Select
                            labelId="role-label"
                            id="role-select"
                            value={formik.values.roleId}
                            onChange={(e) => formik.setFieldValue('roleId', Number(e.target.value))}
                            input={<OutlinedInput label="Role" />}
                          >
                            {roles?.map((r: any) => (
                              <MenuItem key={r.id} value={r.id}>
                                {r.name}
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
