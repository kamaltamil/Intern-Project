import { useState } from 'react';
import { Row, Col, Skeleton, Alert, Button, Tag, Form, Input, Avatar } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';
import CustomTable from '../components/CustomTable';
import { resolveProfileImage } from "../utils/image";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  // Defensive: never let a bad/failed response crash the page
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const totalManagers = safeUsers.filter((item) => item.role === 'Manager').length;
  const totalMembers = safeUsers.filter((item) => item.role === 'Member').length;
  const revenue = safeUsers.length * 125;

  const roleColor = { Admin: 'red', Manager: 'orange', Member: 'blue' };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name, record) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar
              src={resolveProfileImage(record.profileImage)}
              style={{ backgroundColor: "#C76A34" }}
            >
              {!record.profileImage &&
                (record.name?.charAt(0)?.toUpperCase() || "U")}
            </Avatar>

            <span>{name}</span>
          </div>
        );
      },
    },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role) => <Tag color={roleColor[role] || 'default'}>{role}</Tag>,
    },
  ];

  const tableHeader = () => (
    <div className="flex justify-between items-center gap-2">
        <Form>
          <Form.Item 
            label="Recent Users"
            className="mb-0 ml-auto font-semibold">
            <Input.Search
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={(val) => setSearchQuery(val)}
              allowClear
            />
          </Form.Item>
        </Form>
        <Button
              type="primary"
              style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
              onClick={() => navigate('/users')}
            >
              Manage All Users
        </Button>
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
    { title: 'Total Users', value: safeUsers.length, icon: <TeamOutlined /> },
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
              />
            </Col>
          ))}
        </Row>

       <CustomTable
          // title="Recent Users"
          dataSource={searchQuery ? filteredUsers : safeUsers.slice(0, 5)}
          columns={columns}
          pagination={{ pageSize: 3 }}
          tableTitleRender={() => tableHeader()}
        />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;