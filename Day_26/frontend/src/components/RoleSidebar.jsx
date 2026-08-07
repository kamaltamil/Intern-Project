import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  TeamOutlined,
  CrownOutlined,
  TagsOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

/**
 * All possible sidebar modules mapped by resource key.
 * The sidebar will only show modules where the user's role
 * has action.view = true (or if they are Admin, show all).
 */
const MODULE_MAP = {
  dashboard:  { key: '/',         icon: <DashboardOutlined />,  label: 'Dashboard' },
  users:      { key: '/users',    icon: <TeamOutlined />,       label: 'User Management' },
  roles:      { key: '/roles',    icon: <TagsOutlined />,       label: 'Role Management' },
  bookings:   { key: '/bookings', icon: <CalendarOutlined />,   label: 'Bookings' },
  reports:    { key: '/reports',  icon: <BarChartOutlined />,   label: 'Reports' },
  approval:   { key: '/approval', icon: <CheckCircleOutlined />,label: 'Booking Approval' },
  profile:    { key: '/profile',  icon: <UserOutlined />,       label: 'Profile' },
};

/** Full menu items for Admin (always shown, regardless of DB permissions) */
const ADMIN_DEFAULT_ITEMS = [
  MODULE_MAP.dashboard,
  MODULE_MAP.users,
  MODULE_MAP.roles,
  MODULE_MAP.bookings,
  MODULE_MAP.approval,
  MODULE_MAP.reports,
  MODULE_MAP.profile,
];

/** Fallback items for Manager when no permissions set in DB */
const MANAGER_DEFAULT_ITEMS = [
  MODULE_MAP.dashboard,
  MODULE_MAP.approval,
  MODULE_MAP.profile,
];

/** Fallback items for Member when no permissions set in DB */
const MEMBER_DEFAULT_ITEMS = [
  MODULE_MAP.dashboard,
  MODULE_MAP.bookings,
  MODULE_MAP.profile,
];

function buildItemsFromPermissions(rolePermissions) {
  // Dashboard is always visible
  const items = [MODULE_MAP.dashboard];

  // Always add profile
  const hasProfile = rolePermissions.some(
    (p) => p.resource?.toLowerCase() === 'profile'
  );

  rolePermissions.forEach((perm) => {
    const resource = perm.resource?.toLowerCase();
    if (!resource) return;
    // Only show if view permission is granted
    if (perm.action?.view && MODULE_MAP[resource]) {
      items.push(MODULE_MAP[resource]);
    }
  });

  // Ensure profile is always included at the end
  if (!hasProfile && !items.some((i) => i.key === '/profile')) {
    items.push(MODULE_MAP.profile);
  }

  // Deduplicate
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

function RoleSidebar() {
  const { role, theme, rolePermissions } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === 'dark';
  const normalizedRole =
    typeof role === 'string'
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : 'Member';

  const brandItem = {
    key: 'brand',
    icon: <CrownOutlined />,
    label: 'HotelPro',
    style: {
      color: '#C76A34',
      fontSize: '20px',
      fontWeight: 700,
    }
  };

  let menuItems;

  if (normalizedRole === 'Admin') {
    // Admin always sees the full menu
    menuItems = [brandItem, ...ADMIN_DEFAULT_ITEMS];
  } else if (rolePermissions && rolePermissions.length > 0) {
    // Any custom role — build sidebar from DB permissions
    menuItems = [brandItem, ...buildItemsFromPermissions(rolePermissions)];
  } else if (normalizedRole === 'Manager') {
    // Manager with no DB permissions yet — show default manager menu
    menuItems = [brandItem, ...MANAGER_DEFAULT_ITEMS];
  } else {
    // Member (or unrecognised role) with no DB permissions — show default member menu
    menuItems = [brandItem, ...MEMBER_DEFAULT_ITEMS];
  }

  const selectedKey = location.pathname === '/' ? '/' : location.pathname;

  const siderStyle = {
    background: isDark ? '#1a1a2e' : '#ffffff',
    borderRight: `1px solid ${isDark ? '#2d2d44' : '#ECE6DF'}`,
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 20,
    flex: '0 0 240px',
    overflowY: 'auto',
  };

  return (
    <Sider
      breakpoint="lg"
      collapsible="0"
      style={siderStyle}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        theme={isDark ? 'dark' : 'light'}
        onClick={({ key }) => {
          if (key !== 'brand') navigate(key);
        }}
      />
    </Sider>
  );
}

export default RoleSidebar;
