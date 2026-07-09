import React from 'react';
import { Card, Avatar, Descriptions, Typography, Space, Empty } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/useAuthStore';

const { Title } = Typography;

const Profile = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Empty description="Profile data could not be loaded." style={{ marginTop: 40 }} />;
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={2}>Account Profile</Title>
      
      <Card 
        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}
        styles={{ body: { padding: 32 } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 24 }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>{user.name || 'User Profile'}</Title>
              <Typography.Text type="secondary">Workspace Platform Account Member</Typography.Text>
            </div>
          </div>

          <Descriptions column={1} bordered layout="horizontal" size="middle">
            <Descriptions.Item label={<Space><IdcardOutlined />User ID</Space>}>
              <code>{user.id}</code>
            </Descriptions.Item>
            <Descriptions.Item label={<Space><UserOutlined />Full Name</Space>}>
              {user.name}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><MailOutlined />Email Address</Space>}>
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label={<Space><SafetyCertificateOutlined />Password</Space>}>
              <span style={{ letterSpacing: 2, color: '#bfbfbf' }}>••••••••</span>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;