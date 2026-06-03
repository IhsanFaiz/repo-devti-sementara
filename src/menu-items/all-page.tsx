// THIRD-PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2, TableDocument, Paperclip2, Profile, } from 'iconsax-react';
import { Users2, Compass, FileText, BriefcaseBusiness, ClipboardListIcon, FileChartColumnIcon } from 'lucide-react';

// TYPE
import { NavItemType } from 'types/menu';

// ICONS
const icons = {
  samplePage: DocumentCode2,
  table: TableDocument,
  project: Paperclip2,
  user: Profile,
  employee: Users2,
  onboarding: Compass,
  applicant: FileText,
  selection: ClipboardListIcon,
  team: BriefcaseBusiness,
  request: FileChartColumnIcon
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const allPages: NavItemType = {
  id: 'menu',
  title: <FormattedMessage id="menu" />,
  type: 'group',
  children: [

// ==============================|| MENU ITEMS - DEVTI DEVELOPMENT ||============================== //

    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      icon: icons.samplePage,
      url: '/dashboard'
    },
    {
      id: 'request',
      title: <FormattedMessage id="App Request" />,
      type: 'item',
      icon: icons.request,
      url: '/request'
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
    },



// ==============================|| MENU ITEMS - DEVTI GUIDELINES ||============================== //

    {
      id: 'applicant',
      title: <FormattedMessage id="applicant" />,
      type: 'item',
      icon: icons.applicant,
      url: '/applicant'
    },
    {
      id: 'selection',
      title: <FormattedMessage id="selection" />,
      type: 'item',
      icon: icons.selection,
      url: '/selection'
    },
    {
      id: 'onboarding',
      title: <FormattedMessage id="onboarding" />,
      type: 'item',
      icon: icons.onboarding,
      url: '/onboarding'
    },
    {
      id: 'employee',
      title: <FormattedMessage id="employee" />,
      type: 'item',
      icon: icons.employee,
      url: '/employee'
    },
    {
      id: 'team&project',
      title: <FormattedMessage id="Team & Project" />,
      type: 'item',
      icon: icons.team,
      url: '/team'
    },
    {
      id: 'taskList',
      title: <FormattedMessage id="Task List" />,
      type: 'item',
      icon: icons.applicant,
      url: '/task-list'
    },
  ]
};

export default allPages;
