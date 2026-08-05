import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Skeleton, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { setUsers, startUserLoading, setUserError } from '../store/slices/userSlice';

function ManagerDashboardPage() {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (users.length > 0) return;

    const loadUsers = async () => {
      try {
        dispatch(startUserLoading(true));
        const response = await api.get('/users');
        dispatch(setUsers(response.data || []));
      } catch {
        dispatch(setUserError('Unable to load manager dashboard data'));
      } finally {
        dispatch(startUserLoading(false));
      }
    };

    loadUsers();
  }, [dispatch, users.length]);

  const members = users.filter((item) => item.role === 'Member');

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
              <Statistic title="Today Bookings" value={members.length} valueStyle={{ color: '#C76A34' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic title="Pending Bookings" value={members.length} valueStyle={{ color: '#C76A34' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic title="Room Availability" value="18" valueStyle={{ color: '#C76A34' }} />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <Table
            rowKey="_id"
            dataSource={members}
            columns={[
              { title: 'Name', dataIndex: 'name' },
              { title: 'Email', dataIndex: 'email' },
              { title: 'Role', dataIndex: 'role' },
            ]}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboardPage;
