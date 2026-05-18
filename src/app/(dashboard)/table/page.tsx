import { Stack } from '@mui/material';
import BookTable from 'components/table/BookTable';
import BookTableServer from 'components/table/BookTableServer';

const Page = () => {
  return (
    <Stack spacing={2}>
      <BookTable />
      <BookTableServer />
    </Stack>
  );
};

export default Page;
