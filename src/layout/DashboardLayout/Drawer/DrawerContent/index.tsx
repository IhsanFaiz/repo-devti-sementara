// PROJECT IMPORTS
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';
import NavUser from './NavUser';
import Profile from './Profile';
import { useGetMenuMaster } from 'api/menu';
import Search from './Search';

// ==============================|| DRAWER CONTENT ||============================== //

const DrawerContent = () => {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      <Profile />
      {drawerOpen && <Search />}

      <SimpleBar
        sx={{
          flexGrow: 1,
          '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
        }}
      >
        <Navigation />
      </SimpleBar>

      {/* The NavUser will now sit at the bottom.
        If you literally meant "align-self: flex-end" (to align it to the right),
        wrap it in a Box: <Box sx={{ alignSelf: 'flex-end' }}><NavUser /></Box>
      */}
      {drawerOpen && <NavUser />}
    </>
  );
};

export default DrawerContent;
