// THIRD-PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2, TableDocument, Paperclip2, Profile } from 'iconsax-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  samplePage: DocumentCode2,
  table: TableDocument,
  project: Paperclip2,
  user: Profile,
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
      id: 'project',
      title: <FormattedMessage id="project" />,
      type: 'item',
      icon: icons.project,
      url: '/project'
    },
    {
      id: 'user',
      title: <FormattedMessage id="user" />,
      type: 'item',
      icon: icons.user,
      url: '/user'
    },
    {
      id: 'myProject',
      title: <FormattedMessage id="my project" />,
      type: 'item',
      icon: icons.project,
      url: '/my-project'
    }
  ]
};

export default allPages;
