import { useRef, useState } from 'react';
// MATERIAL - UI
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import useUser from 'hooks/useUser';

import { withBasePath } from 'utils/path';

// ASSETS
const avatar1 = withBasePath('/assets/images/users/avatar-6.png');
import { Logout } from 'iconsax-react';

// TYPES
import { ThemeMode } from 'types/config';
import { handleLogout } from 'utils/client-actions';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const ProfilePage = () => {
  const theme = useTheme();
  const user = useUser();

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Avatar alt="profile user" src={user ? user?.photo : avatar1} />
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 250
                },
                borderRadius: 1.5
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', maxWidth: '80%' }}>
                        <Avatar alt="profile user" src={user ? user?.photo : avatar1} />
                        <Stack sx={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                          <Typography variant="subtitle1" lineHeight={1.1}>
                            {user ? user?.fullName : ''}
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            {user ? user?.username : ''}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Tooltip title="Logout">
                        <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
                          <Logout variant="Bulk" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default ProfilePage;
