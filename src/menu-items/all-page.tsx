// THIRD-PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2, TableDocument } from 'iconsax-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  samplePage: DocumentCode2,
  table: TableDocument
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const allPages: NavItemType = {
  id: 'menu',
  title: <FormattedMessage id="menu" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
    },
    {
      id: 'table',
      title: <FormattedMessage id="table" />,
      type: 'item',
      icon: icons.table,
      url: '/table'
    }
  ]
};

export default allPages;
