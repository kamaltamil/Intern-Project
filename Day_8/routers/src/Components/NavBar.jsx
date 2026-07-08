import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton/CustomButton';
import { Flex, Typography, message, theme } from 'antd';
import { LoginOutlined, LogoutOutlined, UserOutlined, ScheduleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('sessionToken');

  const { token: antdToken } = theme.useToken();

  const handleLogout = () => {
    localStorage.clear();
    message.success('Successfully logged out.');
    navigate('/login');
  };

  return (
    <Flex vertical justify="space-between" style={{ height: '100%' }}>
      <div>
        <Title level={3} style={{ color: antdToken.colorPrimary, marginTop: 0, marginBottom: 24 }}>
          Task Manager
        </Title>
        
        <nav>
          <Flex vertical gap="medium">
            {token && (
              <>
                <Link to="/dashboard/tasks" style={{ textDecoration: 'none' }}>
                  <CustomButton variant="primary" icon={<ScheduleOutlined />} style={{ width: '100%', textAlign: 'left' }}>
                    Tasks
                  </CustomButton>
                </Link>
                <Link to="/dashboard/profile" style={{ textDecoration: 'none' }}>
                  <CustomButton variant="primary" icon={<UserOutlined />} style={{ width: '100%', textAlign: 'left' }}>
                    Profile
                  </CustomButton>
                </Link>
              </>
            )}
          </Flex>
        </nav>
      </div>

      {/* Conditional Session Action Drawer Base */}
      <div style={{ marginTop: 'auto' }}>
        {!token ? (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <CustomButton variant="primary" icon={<LoginOutlined />} style={{ width: '100%' }}>
              Login
            </CustomButton>
          </Link>
        ) : (
          <CustomButton variant="secondary" icon={<LogoutOutlined />} onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </CustomButton>
        )}
      </div>
    </Flex>
  );
};

export default NavBar;
