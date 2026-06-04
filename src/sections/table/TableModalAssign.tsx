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
  Tooltip,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip
} from '@mui/material';
import _ from 'lodash';
import { Trash } from 'iconsax-react';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { api } from 'trpc/react';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
  projectId: number;
}

// ==============================|| ITEM ADD / EDIT ||============================== //

export default function TableModalAssign({ open, modalToggler, projectId }: Props) {

  const {data: members} = api.user.getAll.useQuery();
  const { data: projectDetail } = api.project.getById.useQuery(
    { id: projectId || 0 },
    {
      enabled: Boolean(projectId)
    }
  );


  const [openAlert, setOpenAlert] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);


  const utils = api.useUtils();
  const assignMembersMutation = api.project.assignMembers.useMutation({
  onSuccess: () => {
    utils.project.invalidate();

    openSnackbar({
      open: true,
      message: 'Members assigned successfully.',
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);

    closeModal();
  }
});

  const handleAssign = async () => {
    if (!projectId) return;

    await assignMembersMutation.mutateAsync({
        projectId: projectId,
        members: selectedMembers
    });
};

  const closeModal = () => modalToggler(false);

  useEffect(() => {
        if (projectDetail) {
            setSelectedMembers(
            projectDetail.projectMembers.map((pm) => pm.userId)
            );
        }
    }, [projectDetail]);
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
                <form autoComplete="off" noValidate onSubmit={(e) => { e.preventDefault(); handleAssign(); }} >
                  <DialogTitle>{projectId ? 'Edit Project' : 'New Project'}</DialogTitle>
                  <Divider />
                  <DialogContent sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <InputLabel id="assign-member" >Assign Member</InputLabel>
                          <Select
                                multiple
                                value={selectedMembers}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setSelectedMembers(
                                    typeof value === 'string'
                                        ? value.split(',').map(Number)
                                        : value.map(Number)
                                    );
                                }}
                                input={<OutlinedInput placeholder="Assign Member" />}
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
                    </Grid>
                  </DialogContent>
                  <Divider />
                  <DialogActions sx={{ p: 2.5 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        {projectId && (
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
                          <Button
                                variant="contained"
                                onClick={handleAssign}
                                disabled={assignMembersMutation.isPending}
                                >
                                Save
                            </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </DialogActions>
                </form>
              {/* {projectId && <AlertItemDelete item={projectId} open={openAlert} handleClose={handleAlertClose} />} */}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
