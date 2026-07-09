import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Dynamically set the active menu item based on the current URL path
  const selectedKey = location.pathname.includes('profile') ? 'profile' : 'tasks';

  const menuItems = [
    { key: 'tasks', label: <NavLink to='/dashboard/tasks'>Tasks</NavLink> },
    { key: 'profile', label: <NavLink to='/dashboard/profile'>Profile</NavLink> }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme='light'>
        <div style={{ height: 64, margin: 16, background: 'rgba(0,0,0,0.05)' }} />
        {/* Use selectedKeys instead of defaultSelectedKeys */}
        <Menu mode='inline' selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 24px' }}>
          <Button onClick={handleLogout} type='primary' danger>Logout</Button>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;