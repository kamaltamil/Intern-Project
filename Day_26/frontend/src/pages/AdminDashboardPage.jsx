import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Skeleton, Alert, Button, Tag, Form, Input } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUsers, startUserLoading, setUserError } from '../store/slices/userSlice';

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users = [], loading, error } = useSelector((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (users.length > 0) return;

    const loadUsers = async () => {
      try {
        dispatch(startUserLoading(true));
        const response = await api.get('/users');
        dispatch(setUsers(response.data || []));
      } catch {
        dispatch(setUserError('Unable to load dashboard data'));
      } finally {
        dispatch(startUserLoading(false));
      }
    };

    loadUsers();
  }, [dispatch]);

  // Filter users based on search query (name, email, or role)
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const totalManagers = users.filter((item) => item.role === 'Manager').length;
  const totalMembers = users.filter((item) => item.role === 'Member').length;
  const revenue = users.length * 125;

  const roleColor = { Admin: 'red', Manager: 'orange', Member: 'blue' };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#C76A34] flex items-center justify-center text-white text-xs font-bold">
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span>{name}</span>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role) => <Tag color={roleColor[role] || 'default'}>{role}</Tag>,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 4 }} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic
                title="Total Users"
                value={users.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#C76A34' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic
                title="Total Managers"
                value={totalManagers}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#C76A34' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic
                title="Total Members"
                value={totalMembers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#C76A34' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic
                title="Revenue"
                value={revenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#C76A34' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-[#2E2A27]">Recent Users</span>
            <Button
              type="primary"
              style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
              onClick={() => navigate('/users')}
            >
              Manage All Users
            </Button>
          </div>
          <div>
            <Form className='px-5'>
              <Form.Item label='Find User'>
                <Input.Search
                  placeholder="Search by name, email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={(val) => setSearchQuery(val)}
                  allowClear
                />
              </Form.Item>
            </Form>
          </div>
          <div className='overflow-auto'>
            <Table
              rowKey="_id"
              dataSource={
                searchQuery
                  ? filteredUsers              // show all filtered results when searching
                  : users.slice(0, 5)          // show only first 5 when no search
              }
              columns={columns}
              pagination={false}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;
