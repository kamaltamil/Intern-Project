import { useState } from 'react';
import { Row, Col, Skeleton, Alert, Button, Tag, Form, Input } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';
import CustomTable from '../components/CustomTable';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

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

  const searchInput = () => (
    <div className="flex justify-between items-center">
      <h5 className="font-semibold text-[#2E2A27]">Users</h5>
        <Form>
          <Form.Item label='Find User' className="mb-0 ml-auto">
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
  );
 
  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 4 }} />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error?.message || 'Unable to load dashboard data'} />
      </DashboardLayout>
    );
  }

  const dashboardStats = [
    { title: 'Total Users', value: users.length, icon: <TeamOutlined /> },
    { title: 'Total Managers', value: totalManagers, icon: <CrownOutlined /> },
    { title: 'Total Members', value: totalMembers, icon: <UserOutlined />},
    { title: 'Revenue', value: revenue, icon: <DollarOutlined />},
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Row gutter={[16, 16]}>
           {dashboardStats.map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <CustomCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                key={stat.title}
              />
            </Col>
          ))}
        </Row>

       <CustomTable
          title="Recent Users"
          extraHeader={
            <Button
              type="primary"
              style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
              onClick={() => navigate('/users')}
            >
              Manage All Users
            </Button>
          }
          dataSource={searchQuery ? filteredUsers : users.slice(0, 5)}
          columns={columns}
          pagination={false}
          tableTitleRender={() => searchInput()}
        />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;
