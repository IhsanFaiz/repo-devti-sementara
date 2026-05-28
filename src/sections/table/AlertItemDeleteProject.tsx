import { useTheme } from '@mui/material/styles';
import { Dialog, Button, Stack, Typography, DialogContent } from '@mui/material';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import { ThemeMode } from 'types/config';
import { Trash } from 'iconsax-react';
import {ProjectApiResponse} from 'components/table/ProjectTableServer';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { api } from 'trpc/react';

interface Props {
  item?: ProjectApiResponse | null;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertItemDelete({ item, open, handleClose }: Props) {
  const theme = useTheme();
  const utils = api.useUtils();
  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      utils.project.getAll.invalidate();
      utils.project.getPagination.invalidate();
      openSnackbar({
        open: true,
        message: 'project deleted successfully.',
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
        message: ctx.message || 'Error deleting project.',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
      console.error('Error deleting project:', ctx.message);
    }
  });

  const deletehandler = async () => {
    try {
      await deleteProject.mutateAsync({ id: item?.id! });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
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
              Are you sure you want to delete?
            </Typography>
            <Typography align="center">
              By deleting
              <Typography variant="subtitle1" component="span">
                {' '}
                {item?.name}{' '}
              </Typography>
              project, all data associated with that project will also be deleted.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deletehandler} disabled={deleteProject.isPending} autoFocus>
              {deleteProject.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
