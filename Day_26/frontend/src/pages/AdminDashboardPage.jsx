import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Skeleton, Alert, Button, Tag, Form, Input, Avatar } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';
import CustomTable from '../components/CustomTable';
import { resolveProfileImage } from "../utils/image";
import { ROLE_COLORS } from "../constants/roleColors";

const getFallbackRoleColor = (roleName) => {
  const match = ROLE_COLORS.find(
    (c) => c.label.toLowerCase() === roleName?.toLowerCase()
  );
  return match ? match.value : "#722ed1";
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  // Defensive: never let a bad/failed response crash the page
  const safeUsers = Array.isArray(users) ? users : [];

  const getRoleName = (r) => (typeof r === 'object' ? r?.name : r) || '';

  const filteredUsers = safeUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    const roleName = getRoleName(user.role);
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      roleName.toLowerCase().includes(query)
    );
  });

  const totalManagers = safeUsers.filter((item) => getRoleName(item.role) === 'Manager').length;
  const totalMembers = safeUsers.filter((item) => getRoleName(item.role) === 'Member').length;
  const revenue = safeUsers.length * 125;

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
      render: (role) => {
        const name = getRoleName(role);
        const color = typeof role === 'object' && role?.color ? role.color : getFallbackRoleColor(name);
        return <Tag color={color}>{name || 'Member'}</Tag>;
      },
    },
  ];

  const searchInput = () => (
    <div className="flex justify-between items-center gap-2">
        <h5 className="font-semibold" style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>Users</h5>
        <Form>
          <Form.Item className="mb-0 ml-auto">
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
          dataSource={searchQuery ? filteredUsers : safeUsers.slice(0, 5)}
          columns={columns}
          pagination={false}
          tableTitleRender={() => searchInput()}
        />
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;