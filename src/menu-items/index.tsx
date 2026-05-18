// PROJECT IMPORTS
import { roleAccess } from 'config';
import allPages from './all-page';

// TYPES
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [allPages]
};

const getMenuAccess = (menu: { items: NavItemType[] }) => {
  return {
    items: menu.items.map((group) => ({
      ...group,
      children: group.children?.map((item) => ({
        ...item,
        access: Object.entries(roleAccess)
          .filter(([role, paths]) => paths.includes(item.url!) || paths.includes('*'))
          .map(([role]) => role)
      }))
    }))
  };
};

const updatedMenuItems = getMenuAccess(menuItems);

export default updatedMenuItems;
