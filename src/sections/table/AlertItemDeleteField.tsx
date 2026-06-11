import { useTheme } from '@mui/material/styles';
import { Dialog, Button, Stack, Typography, DialogContent } from '@mui/material';

import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

import { ThemeMode } from 'types/config';
import { Trash } from 'iconsax-react';

import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

import { api } from 'trpc/react';

interface ProjectField {
  id: number;
  projectId: number;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  createdAt: Date;
}

interface Props {
  item?: ProjectField | null;
  open: boolean;
  handleClose: () => void;
}

export default function AlertItemDeleteField({ item, open, handleClose }: Props) {
  const theme = useTheme();

  const utils = api.useUtils();

  const deleteField = api.projectField.delete.useMutation({
    onSuccess: () => {
      utils.projectField.getByProjectId.invalidate({
        projectId: item?.projectId
      });

      openSnackbar({
        open: true,
        message: 'Field deleted successfully.',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);

      handleClose();
    },

    onError: (ctx) => {
      openSnackbar({
        open: true,
        message: ctx.message || 'Error deleting field.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);

      console.error('Error deleting field:', ctx.message);
    }
  });

  const deleteHandler = async () => {
    if (!item) return;

    try {
      await deleteField.mutateAsync({
        id: item.id
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="field-delete-title"
      aria-describedby="field-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar
            color="error"
            sx={{
              width: 72,
              height: 72,
              fontSize: '1.75rem',
              color: theme.palette.mode === ThemeMode.DARK ? theme.palette.common.white : theme.palette.error[100]
            }}
          >
            <Trash />
          </Avatar>

          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              Are you sure?
            </Typography>

            <Typography align="center">
              By deleting
              <Typography variant="subtitle1" component="span">
                {' '}
                {item?.label}{' '}
              </Typography>
              field, all submitted values associated with this field will also be deleted.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>

            <Button fullWidth color="error" variant="contained" onClick={deleteHandler} disabled={deleteField.isPending}>
              {deleteField.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
