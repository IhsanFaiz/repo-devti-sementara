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
import AlertItemDelete from './AlertItemDelete';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { BookApiResponse } from 'components/table/BookTable';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: BookApiResponse | null;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

function getInitialValues(item: BookApiResponse | null) {
  const newItem = {
    title: '',
    author: '',
    year: new Date().getFullYear(),
    genre: ''
  };

  if (item) {
    return _.merge({}, newItem, item);
  }

  return newItem;
}

export default function TableModal({ open, modalToggler, item }: Props) {
  const ItemSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    author: Yup.string().required('Author is required'),
    year: Yup.number().required('Year is required').integer('Year must be an integer'),
    genre: Yup.string().required('Genre is required')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };

  const utils = api.useUtils();
  const createBook = api.book.create.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      utils.book.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Book created successfully.',
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
        message: ctx.message || 'Error creating book.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error creating book:', ctx.message);
    }
  });

  const updateBook = api.book.update.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      utils.book.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'Book updated successfully.',
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
        message: ctx.message || 'Error updating book.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error updating book:', ctx.message);
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(item!),
    validationSchema: ItemSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (item) await updateBook.mutateAsync({ id: item?.id!, ...values });
        else await createBook.mutateAsync(values);
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
                  <DialogTitle>{item ? 'Edit Book' : 'New Book'}</DialogTitle>
                  <Divider />
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="title">Title</InputLabel>
                          <TextField
                            fullWidth
                            id="title"
                            placeholder="Enter Title"
                            {...getFieldProps('title')}
                            error={Boolean(touched.title && errors.title)}
                            helperText={touched.title && errors.title}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="author">Author</InputLabel>
                          <TextField
                            fullWidth
                            id="author"
                            placeholder="Enter Author"
                            {...getFieldProps('author')}
                            error={Boolean(touched.author && errors.author)}
                            helperText={touched.author && errors.author}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="year">Year</InputLabel>
                          <TextField
                            fullWidth
                            id="year"
                            type="number"
                            placeholder="Enter Year"
                            {...getFieldProps('year')}
                            error={Boolean(touched.year && errors.year)}
                            helperText={touched.year && errors.year}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="genre">Genre</InputLabel>
                          <TextField
                            fullWidth
                            id="genre"
                            placeholder="Enter Genre"
                            {...getFieldProps('genre')}
                            error={Boolean(touched.genre && errors.genre)}
                            helperText={touched.genre && errors.genre}
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
                          <Tooltip title="Delete Book" placement="top">
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
