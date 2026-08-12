import { Row, Col, Skeleton } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomCard from "../components/CustomCard";
import LandingBanner from "../components/LandingBanner";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";

function MemberDashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
    
        <Skeleton active paragraph={{ rows: 4 }} />
      
    );
  }

  const upcoming = user?.upcomingBookings?.length || 0;
  const history = user?.bookingHistory?.length || 0;

  const memberStats = [
    { title: 'Upcoming Stay', value: upcoming, icon: <TeamOutlined /> },
    { title: 'Booking History', value: history, icon: <UserOutlined /> }
  ];

  return (
  
      <div className="space-y-4">
        <Row gutter={[16, 16]}>
          {memberStats.map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <CustomCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            </Col>
          ))}
        </Row>

        <LandingBanner
          image="/dashboard/member-hero.jpg"
          alt="Hotel room"
          title="Welcome to HotelPro"
          subtitle="Book your next stay and keep track of your reservations, all in one place."
          actionLabel="Book a Room"
          onAction={() => navigate('/bookings')}
        />
      </div>
    
  );
}

export default MemberDashboardPage;