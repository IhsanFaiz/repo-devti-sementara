'use client';

// MATERIAL - UI
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import Image from 'next/image';


// ==============================|| SAMPLE PAGE ||============================== //

const DashboardView = () => {
  const user = useUser()

  return (
    <MainCard>
      <Typography variant="h2">
        {`Hello, ${user?.username} 👋`}
      </Typography>
      <Typography variant="body1" className='mt-5 flex'>
        Do you Know? Able is used by more than 2.4K+ Customers worldwide. This new v9 version is the major release of Able Pro Dashboard
        Template with having brand new modern User Interface.
      </Typography>
    </MainCard>
  )
} 

export default DashboardView;
