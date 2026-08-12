import { Row, Col, Skeleton, Alert } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';
import LandingBanner from '../components/LandingBanner';

function AdminDashboardPage() {
  const navigate = useNavigate();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const safeUsers = Array.isArray(users) ? users : [];
  const getRoleName = (r) => (typeof r === 'object' ? r?.name : r) || '';
  const totalManagers = safeUsers.filter((item) => getRoleName(item.role) === 'Manager').length;
  const totalMembers = safeUsers.filter((item) => getRoleName(item.role) === 'Member').length;
  const revenue = safeUsers.length * 125;

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
    { title: 'Total Members', value: totalMembers, icon: <UserOutlined /> },
    { title: 'Revenue', value: revenue, icon: <DollarOutlined /> },
  ];

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}

export default AdminDashboardPage;