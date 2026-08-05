import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  TeamOutlined,
  CrownOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

function RoleSidebar() {
  const { role, theme } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === 'dark';

  const commonItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  ];

  const adminItems = [
    { key: '/users', icon: <TeamOutlined />, label: 'User Management' },
    { key: '/roles', icon: <TagsOutlined />, label: 'Role Management' },
    { key: '/bookings', icon: <CalendarOutlined />, label: 'Bookings' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const managerItems = [
    { key: '/approval', icon: <CalendarOutlined />, label: 'Booking Approval' },
    { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const memberItems = [
    { key: '/bookings', icon: <CalendarOutlined />, label: 'My Bookings' },
    { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  let items = [...commonItems, ...memberItems];
  if (role === 'Admin') items = [...commonItems, ...adminItems];
  if (role === 'Manager') items = [...commonItems, ...managerItems];

  const selectedKey = location.pathname === '/' ? '/' : location.pathname;

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        background: isDark ? '#1a1a2e' : '#ffffff',
        borderRight: `1px solid ${isDark ? '#2d2d44' : '#ECE6DF'}`,
        minHeight: '100vh',
      }}
    >
      <div
        style={{ color: '#C76A34' }}
        className="p-5 text-2xl font-semibold flex items-center gap-2"
      >
        <CrownOutlined />
        HotelPro
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        theme={isDark ? 'dark' : 'light'}
        style={{
          background: isDark ? '#1a1a2e' : '#ffffff',
          border: 'none',
        }}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}

export default RoleSidebar;
