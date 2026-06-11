// THIRD-PARTY
import { FormattedMessage } from 'react-intl';

// ASSETS
import { DocumentCode2, TableDocument, Paperclip2, Profile } from 'iconsax-react';
import { Users2, Compass, FileText, BriefcaseBusiness, ClipboardListIcon, FileChartColumnIcon, FileBadge } from 'lucide-react';

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
  request: FileChartColumnIcon,
  sla: FileBadge
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
      id: 'sla',
      title: <FormattedMessage id="Service Level Agreement (SLA)" />,
      type: 'item',
      icon: icons.sla,
      url: '/sla'
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
      type: 'collapse',
      icon: icons.applicant,
      url: '/applicant',
      breadcrumbs: true,
      children: [
        {
          id: 'add-applicant',
          title: <FormattedMessage id="add-applicant" />,
          type: 'item',
          url: '/applicant/add'
        },
        {
          id: 'detail-applicant',
          title: <FormattedMessage id="detail-applicant" />,
          type: 'item',
          url: '/applicant/detail'
        }
      ]
    },
    {
      id: 'selection',
      title: <FormattedMessage id="selection" />,
      type: 'collapse',
      icon: icons.selection,
      url: '/selection',
      breadcrumbs: true,
      children: [
        {
          id: 'detail-selection',
          title: <FormattedMessage id="detail-selection" />,
          type: 'item',
          url: '/selection/detail'
        }
      ]
    },
    {
      id: 'onboarding',
      title: <FormattedMessage id="onboarding" />,
      type: 'collapse',
      icon: icons.onboarding,
      url: '/onboarding',
      breadcrumbs: true,
      children: [
        {
          id: 'detail-onboarding',
          title: <FormattedMessage id="detail-onboarding" />,
          type: 'item',
          url: '/onboarding/detail'
        }
      ]
    },
    {
      id: 'employee',
      title: <FormattedMessage id="employee" />,
      type: 'collapse',
      icon: icons.employee,
      url: '/employee',
      breadcrumbs: true,
      children: [
        {
          id: 'add-employee',
          title: <FormattedMessage id="add-employee" />,
          type: 'item',
          url: '/employee/add'
        }
      ]
    },
    {
      id: 'team&project',
      title: <FormattedMessage id="Team & Project" />,
      type: 'collapse',
      icon: icons.team,
      url: '/team',
      breadcrumbs: true,
      children: [
        {
          id: 'add-team-project',
          title: <FormattedMessage id="Tambah Team & Project" />,
          type: 'item',
          url: '/team/add'
        }
      ]
    },
    {
      id: 'taskList',
      title: <FormattedMessage id="Task List" />,
      type: 'item',
      icon: icons.applicant,
      url: '/task-list'
    }
  ]
};

export default allPages;
