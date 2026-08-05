import { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message, Divider, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import { setAuth } from '../store/slices/authSlice';
import DashboardLayout from '../components/DashboardLayout';

const { Title, Text } = Typography;

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, token, refreshToken } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const roleColor = {
    Admin: 'red',
    Manager: 'orange',
    Member: 'blue',
  };

  const onEditClick = () => {
    form.setFieldsValue({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
    });
    setEditing(true);
  };

  const onCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    if (!user?._id) {
      message.error('User not found');
      return;
    }

    try {
      setLoading(true);
      const response = await api.patch(`/users/${user._id}`, {
        name: values.name,
        email: values.email,
        username: values.username,
        ...(values.password ? { password: values.password } : {}),
      });

      const updatedUser = response.data?.user || response.data;

      dispatch(
        setAuth({
          user: updatedUser,
          token,
          refreshToken,
        })
      );

      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <Title level={4} className="!text-[#2E2A27]">My Profile</Title>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              size={72}
              style={{ backgroundColor: '#C76A34', fontSize: 28 }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <div>
              <div className="text-xl font-semibold text-[#2E2A27]">{user?.name || 'Unknown'}</div>
              <div className="text-[#A74E2B] text-sm">@{user?.username || 'user'}</div>
              <Tag color={roleColor[user?.role] || 'default'} className="mt-1">
                {user?.role || 'Member'}
              </Tag>
            </div>
          </div>

          <Divider />

          {!editing ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Full Name</Text>
                <Text strong>{user?.name || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Email</Text>
                <Text strong>{user?.email || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Username</Text>
                <Text strong>@{user?.username || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Role</Text>
                <Tag color={roleColor[user?.role] || 'default'}>{user?.role || 'Member'}</Tag>
              </div>

              <div className="pt-4">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={onEditClick}
                  style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter your name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Username is required' }]}
              >
                <Input placeholder="Enter your username" />
              </Form.Item>

              <Form.Item
                label="New Password (leave blank to keep current)"
                name="password"
              >
                <Input.Password placeholder="Enter new password (optional)" />
              </Form.Item>

              <div className="flex gap-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
                >
                  Save Changes
                </Button>
                <Button icon={<CloseOutlined />} onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
