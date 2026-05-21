// THIRD-PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2, TableDocument, Paperclip2 } from 'iconsax-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  samplePage: DocumentCode2,
  table: TableDocument,
  project: Paperclip2
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
    },
    {
      id: 'project',
      title: <FormattedMessage id="project" />,
      type: 'item',
      icon: icons.project,
      url: '/project'
    }
  ]
};

export default allPages;
