// PROJECT IMPORTS
import { roleAccess } from 'config';
import allPages from './all-page';

// TYPES
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [allPages]
};

/**
 * Filter menu items based on user role
 * @param menu - Menu items to filter
 * @param userRole - Current user's role
 * @returns Filtered menu items
 */
export const getMenuByRole = (menu: { items: NavItemType[] }, userRole?: string): { items: NavItemType[] } => {
  if (!userRole) return menu;

  const allowedPaths = roleAccess[userRole as keyof typeof roleAccess] || [];

  return {
    items: menu.items
      .map((group) => ({
        ...group,
        children: group.children?.filter((item) => {
          // Check if the path is in the allowed paths
          return allowedPaths.includes(item.url || '');
        })
      }))
      .filter((group) => {
        // Filter out groups that have no children after filtering
        return group.children && group.children.length > 0;
      })
  };
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
