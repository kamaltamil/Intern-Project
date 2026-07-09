import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CheckSquareOutlined, UserOutlined } from '@ant-design/icons';
import CustomButton from '../components/CustomButton/CustomButton';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const selectedKey = location.pathname.includes('profile') ? 'profile' : 'tasks';

  const menuItems = [
    { 
      key: 'tasks', 
      icon: <CheckSquareOutlined />,
      label: <NavLink to='/dashboard/tasks'>Tasks</NavLink> 
    },
    { 
      key: 'profile', 
      icon: <UserOutlined />,
      label: <NavLink to='/dashboard/profile'>Profile</NavLink> 
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider in Dark Mode with your custom blue color */}
      <Sider 
        theme='dark' 
        style={{ background: '#002147' }} 
      >
        <div style={{ height: 64, margin: '16px 24px', display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ color: '#C9A66B', margin: 0, letterSpacing: 1 }}>TASKMATE</Title>
        </div>
        <Menu 
          theme='dark' 
          mode='inline' 
          selectedKeys={[selectedKey]} 
          items={menuItems} 
          style={{ background: '#002147' }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#002147', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <CustomButton variant="accent" onClick={handleLogout}>
            Logout
          </CustomButton>
        </Header>
        
        <Content style={{ margin: '24px', padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;