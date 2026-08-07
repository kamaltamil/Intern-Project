import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message, Divider, Tag, Upload } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateUser, fetchMe } from '../api/queries';
import api from '../api/api';
import { setAuth } from '../store/slices/authSlice';
import DashboardLayout from '../components/DashboardLayout';

const { Title, Text } = Typography;

const resolveProfileImage = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  try {
    return `${new URL(api.defaults.baseURL).origin}${image}`;
  } catch (e) {
    return image;
  }
};

function ProfilePage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, token, refreshToken } = useSelector((state) => state.auth);
  const { data: fetchedUser, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
  const profileUser = fetchedUser || user;
  const [editing, setEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedImage, setSavedImage] = useState(() => resolveProfileImage(profileUser?.profileImage || user?.profileImage || null));
  const [previewImage, setPreviewImage] = useState(() => resolveProfileImage(profileUser?.profileImage || user?.profileImage || null));
  const [form] = Form.useForm();

  useEffect(() => {
    const nextImage = resolveProfileImage(profileUser?.profileImage || user?.profileImage || null);
    setSavedImage(nextImage);
    setPreviewImage(nextImage);
  }, [profileUser?.profileImage, user?.profileImage]);

  const roleColor = {
    Admin: 'red',
    Manager: 'orange',
    Member: 'blue',
  };

  const onEditClick = () => {
    form.setFieldsValue({
      name: profileUser?.name || '',
      email: profileUser?.email || '',
      username: profileUser?.username || '',
    });
    setSelectedFile(null);
    setPreviewImage(savedImage);
    setEditing(true);
  };

  const onCancel = () => {
    setSelectedFile(null);
    setPreviewImage(savedImage);
    setEditing(false);
    form.resetFields();
  };

  const profileMutation = useMutation({
    mutationFn: (payload) => updateUser({ id: profileUser?._id || user?._id, payload }),
    onSuccess: (updatedUser) => {
      dispatch(
        setAuth({
          user: updatedUser,
          token,
          refreshToken,
        })
      );
      const nextImage = resolveProfileImage(updatedUser?.profileImage || null);
      setSavedImage(nextImage);
      setPreviewImage(nextImage);
      queryClient.setQueryData(['me'], updatedUser);
      queryClient.invalidateQueries(['me']);
      message.success('Profile updated successfully');
      setEditing(false);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  const onFinish = (values) => {
    const id = profileUser?._id || user?._id;
    if (!id) {
      message.error('User not found');
      return;
    }

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('username', values.username);
    if (values.password) {
      formData.append('password', values.password);
    }
    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    profileMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <Title level={4} className="!text-[#2E2A27]">My Profile</Title>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              size={72}
              src={previewImage}
              style={{ backgroundColor: '#C76A34', fontSize: 28 }}
            >
              {!previewImage && (profileUser?.name?.charAt(0)?.toUpperCase() || 'U')}
            </Avatar>
            <div>
              <div className="text-xl font-semibold text-[#2E2A27]">{profileUser?.name || 'Unknown'}</div>
              <div className="text-[#A74E2B] text-sm">@{profileUser?.username || 'user'}</div>
              <Tag color={roleColor[profileUser?.role] || 'default'} className="mt-1">
                {profileUser?.role || 'Member'}
              </Tag>
            </div>
          </div>

          <Divider />

          {isUserLoading ? (
            <div className="py-10">
              <p>Loading profile...</p>
            </div>
          ) : isUserError ? (
            <div className="py-10">
              <p>Unable to load profile data.</p>
            </div>
          ) : !editing ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Full Name</Text>
                <Text strong>{profileUser?.name || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Email</Text>
                <Text strong>{profileUser?.email || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Username</Text>
                <Text strong>@{profileUser?.username || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Role</Text>
                <Tag color={roleColor[profileUser?.role] || 'default'}>{profileUser?.role || 'Member'}</Tag>
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
              <Form.Item label="Profile Photo">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={({ file }) => {
                    const selected = file.originFileObj || file;
                    if (selected) {
                      setSelectedFile(selected);
                      const reader = new FileReader();
                      reader.onload = (e) => setPreviewImage(e.target.result);
                      reader.readAsDataURL(selected);
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} type="default">
                    Choose Photo
                  </Button>
                </Upload>
              </Form.Item>

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
                  loading={profileMutation.isLoading}
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
