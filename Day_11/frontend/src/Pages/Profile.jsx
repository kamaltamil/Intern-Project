import React, { useEffect, useState } from 'react';
import { Card, Avatar, Descriptions, Typography, Space, Spin, message } from 'antd';
// 1. Swapped ShieldOutlined with SafetyCertificateOutlined
import { UserOutlined, MailOutlined, IdcardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../api';

const { Title } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;
      try {
        const response = await api.get(`/users/${currentUserId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching profile information:', error);
        message.error('Failed to load user account profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" tip="Loading profile details..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={2}>Account Profile</Title>
      
      <Card 
        style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}
        styles={{ body: { padding: 32 } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Main User Avatar Header Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 24 }}>
            <Avatar 
              size={80} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>{userData?.name || 'User Profile'}</Title>
              <Typography.Text type="secondary">Workspace Platform Account Member</Typography.Text>
            </div>
          </div>

          {/* Structured Data Description Grid Block */}
          <Descriptions column={1} bordered layout="horizontal" size="middle">
            <Descriptions.Item label={<Space><IdcardOutlined />User Identifier ID</Space>}>
              <code>{userData?.id}</code>
            </Descriptions.Item>
            
            <Descriptions.Item label={<Space><UserOutlined />Full Account Name</Space>}>
              {userData?.name}
            </Descriptions.Item>
            
            <Descriptions.Item label={<Space><MailOutlined />Email Address</Space>}>
              {userData?.email}
            </Descriptions.Item>

            {/* 2. Updated the icon component down here */}
            <Descriptions.Item label={<Space><SafetyCertificateOutlined />Password Protection String</Space>}>
              <span style={{ letterSpacing: 2, color: '#bfbfbf' }}>••••••••</span> (Stored Encrypted)
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;
