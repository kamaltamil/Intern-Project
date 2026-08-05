import { Card, Row, Col, Skeleton } from "antd";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";

function MemberDashboardPage() {
  const { user } = useSelector((state) => state.auth);


  if (!user) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 4 }} />
      </DashboardLayout>
    );
  }

  const upcoming = user?.upcomingBookings?.length || 0;
  const history = user?.bookingHistory?.length || 0;

  const memberStats = [
    { title: 'Upcoming Stay', value: upcoming, icon: <TeamOutlined /> },
    { title: 'Booking History', value: history, icon: <UserOutlined /> }
  ];
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Row gutter={[16, 16]}>
          {
            memberStats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <CustomCard 
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              </Col>
            ))
          }
        </Row>

        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="text-lg font-semibold text-[#2E2A27]">
            Member Summary
          </div>
          <p className="text-[#A74E2B] mt-2">
            Profile and booking details will be populated from the backend users
            API.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default MemberDashboardPage;
