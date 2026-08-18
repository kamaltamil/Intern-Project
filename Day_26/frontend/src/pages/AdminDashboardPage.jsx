import { Row, Col, Skeleton, Alert } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, fetchReports } from '../api/queries';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';
import LandingBanner from '../components/LandingBanner';

function AdminDashboardPage() {
  const navigate = useNavigate();

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const {
    data: report = {},
    isLoading: isReportsLoading,
    isError: isReportsError,
    error: reportsError,
  } = useQuery({ queryKey: ['reports'], queryFn: fetchReports });

  const safeUsers = Array.isArray(users) ? users : [];
  const getRoleName = (r) => (typeof r === 'object' ? r?.name : r) || '';
  const totalManagers = safeUsers.filter((item) => getRoleName(item.role) === 'Manager').length;
  const totalMembers = safeUsers.filter((item) => getRoleName(item.role) === 'Member').length;
  const revenue = Number(report.summary?.revenue || 0);

  if (isUsersLoading || isReportsLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (isUsersError || isReportsError) {
    return (
      <Alert
        type="error"
        message={
          usersError?.message ||
          reportsError?.message ||
          'Unable to load dashboard data'
        }
      />
    );
  }

  const dashboardStats = [
    { title: 'Total Users', value: safeUsers.length, icon: <TeamOutlined /> },
    { title: 'Total Managers', value: totalManagers, icon: <CrownOutlined /> },
    { title: 'Total Members', value: totalMembers, icon: <UserOutlined /> },
    {
      title: 'Revenue',
      value: `₹${revenue.toLocaleString('en-IN')}`,
      icon: <DollarOutlined />,
    },
  ];

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        {dashboardStats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <CustomCard title={stat.title} value={stat.value} icon={stat.icon} />
          </Col>
        ))}
      </Row>

      <LandingBanner
        image="/dashboard/admin-hero.jpg"
        alt="Hotel lobby"
        title="HotelPro Admin Console"
        subtitle="Oversee rooms, bookings, staff roles, and revenue — all in one place."
        actionLabel="Manage All Users"
        onAction={() => navigate('/users')}
      />
    </div>
  );
}

export default AdminDashboardPage;