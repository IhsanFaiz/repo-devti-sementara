'use client';


import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import Modal from '@mui/material/Modal';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { ProjectFieldApiResponse } from 'views/other/project/detail/detail';

import { api } from 'trpc/react';


interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  item?: ProjectFieldApiResponse | null;
  projectId: number;
}

function getInitialValues(
  item: ProjectFieldApiResponse | null,
  projectId: number
) {
  return {
    id: item?.id || 0,
    projectId,

    label: item?.label || '',
    type: item?.type || 'TEXT',
    placeholder: item?.placeholder || '',
    required: item?.required || false
  };
}

export default function TableModal({
  open,
  modalToggler,
  item,
  projectId
}: Props) {
  const utils = api.useUtils();

  const fieldTypes = [
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'DATE',
    'FILE',
    'IMAGE',
    'VIDEO'
  ];

  const ItemSchema = Yup.object().shape({
    label: Yup.string().required('Label is required'),
    type: Yup.string().required('Type is required')
  });

  const createField = api.projectField.create.useMutation({
    onSuccess: () => {
      utils.projectField.getByProjectId.invalidate({
        projectId
      });

      openSnackbar({
              open: true,
              message: 'Fiedl created successfully.',
              variant: 'alert',
              alert: {
                color: 'success'
              }
            } as SnackbarProps);

      closeModal();
    },

    onError: (err) => {
        console.error(err);
    }
  });

  const updateField = api.projectField.update.useMutation({
    onSuccess: () => {
      utils.projectField.getByProjectId.invalidate({
        projectId
      });

      closeModal();
    }
  });

  const formik = useFormik({
    initialValues: getInitialValues(item ?? null, projectId),
    validationSchema: ItemSchema,
    enableReinitialize: true,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (item) {
          await updateField.mutateAsync({
            id: values.id,
            label: values.label,
            type: values.type,
            placeholder: values.placeholder,
            required: values.required
          });
        } else {
          await createField.mutateAsync({
            projectId,
            label: values.label,
            type: values.type,
            placeholder: values.placeholder,
            required: values.required
          });
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const {
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps
  } = formik;

  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="project-field-modal"
          sx={{
            '& .MuiPaper-root:focus': {
              outline: 'none'
            }
          }}
        >
          <MainCard
            modal
            content={false}
            sx={{
              width: `calc(100% - 48px)`,
              minWidth: 340,
              maxWidth: 700,
              height: 'auto',
              maxHeight: 'calc(100vh - 48px)'
            }}
          >
            <SimpleBar
              sx={{
                maxHeight: 'calc(100vh - 48px)',
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              <FormikProvider value={formik}>
                <Form noValidate onSubmit={handleSubmit}>
                  <DialogTitle>
                    {item ? 'Edit Field' : 'Create Field'}
                  </DialogTitle>

                  <Divider />

                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel>
                            Field Label
                          </InputLabel>

                          <TextField
                            fullWidth
                            placeholder="Github Repository"
                            {...getFieldProps('label')}
                            error={Boolean(
                              touched.label && errors.label
                            )}
                            helperText={
                              touched.label && errors.label
                            }
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel>
                            Field Type
                          </InputLabel>

                          <Select
                            value={formik.values.type}
                            onChange={(e) =>
                              formik.setFieldValue(
                                'type',
                                e.target.value
                              )
                            }
                          >
                            {fieldTypes.map((type) => (
                              <MenuItem
                                key={type}
                                value={type}
                              >
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel>
                            Placeholder
                          </InputLabel>

                          <TextField
                            fullWidth
                            placeholder="Enter value..."
                            {...getFieldProps(
                              'placeholder'
                            )}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                formik.values.required
                              }
                              onChange={(e) =>
                                formik.setFieldValue(
                                  'required',
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="Required Field"
                        />
                      </Grid>
                    </Grid>
                  </DialogContent>

                  <Divider />

                  <DialogActions sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      ml="auto"
                    >
                      <Button
                        color="error"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {item ? 'Save' : 'Create'}
                      </Button>
                    </Stack>
                  </DialogActions>
                </Form>
              </FormikProvider>
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}