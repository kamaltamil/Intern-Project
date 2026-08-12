import { Row, Col, Skeleton, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../api/queries";
import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import LandingBanner from "../components/LandingBanner";

function ManagerDashboardPage() {
  const navigate = useNavigate();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const getRoleName = (r) => (typeof r === "object" ? r?.name : r) || "";

  const members = users.filter((item) => getRoleName(item.role) === "Member");

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
        <Alert
          type="error"
          message={error?.message || "Unable to load manager dashboard data"}
        />
      </DashboardLayout>
    );
  }

  const managerStats = [
    { title: "Today Bookings", value: members.length, color: "#C76A34" },
    { title: "Pending Bookings", value: members.length, color: "#C76A34" },
    { title: "Room Availability", value: 18, color: "#C76A34" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Row gutter={[16, 16]}>
          {managerStats.map((stat) => (
            <Col xs={24} sm={12} lg={8} key={stat.title}>
              <CustomCard
                title={stat.title}
                value={stat.value}
                color={stat.color}
              />
            </Col>
          ))}
        </Row>

        <LandingBanner
          image="/dashboard/manager-hero.jpg"
          alt="Hotel reception"
          title="HotelPro Manager Console"
          subtitle="Review bookings, track room availability, and manage your team's day-to-day."
          actionLabel="View Bookings"
          onAction={() => navigate("/bookings")}
        />
      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboardPage;