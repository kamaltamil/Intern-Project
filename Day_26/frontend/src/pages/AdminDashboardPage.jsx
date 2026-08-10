import { Row, Col, Skeleton, Alert, Button, Layout } from 'antd';
import { TeamOutlined, UserOutlined, CrownOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import CustomCard from '../components/CustomCard';

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

        {/* Landing image, replaces the recent-users table */}
<div
  className="relative rounded-2xl overflow-hidden shadow-sm
             h-48 sm:h-64 md:h-80 lg:h-96"
>
  <img
    src="/landing/landing.jpg"
    alt="Hotel lobby"
    className="w-full h-full object-cover"
  />
  <div
    className="absolute inset-0 flex flex-col justify-center items-start p-4 sm:p-6 md:p-8"
    style={{
      background:
        'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)',
    }}
  >
    <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
      HotelPro Admin Console
    </h2>
    <p className="text-white/90 mb-4 max-w-md text-sm sm:text-base">
      Oversee rooms, bookings, staff roles, and revenue — all in one place.
    </p>
    <Button
      type="primary"
      style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
      onClick={() => navigate('/users')}
    >
      Manage All Users
    </Button>
  </div>
</div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboardPage;