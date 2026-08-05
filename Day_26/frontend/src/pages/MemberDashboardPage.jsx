import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Skeleton, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { setUsers, startUserLoading, setUserError } from '../store/slices/userSlice';

function MemberDashboardPage() {
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
        dispatch(setUserError('Unable to load member dashboard data'));
      } finally {
        dispatch(startUserLoading(false));
      }
    };

    loadUsers();
  }, [dispatch, users.length]);

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
              <Statistic title="Upcoming Stay" value={users.length || 0} valueStyle={{ color: '#C76A34' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
              <Statistic title="Booking History" value={users.length || 0} valueStyle={{ color: '#C76A34' }} />
            </Card>
          </Col>
        </Row>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="text-lg font-semibold text-[#2E2A27]">Member Summary</div>
          <p className="text-[#A74E2B] mt-2">Profile and booking details will be populated from the backend users API.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default MemberDashboardPage;
