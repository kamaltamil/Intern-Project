import { Row, Col, Skeleton, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/queries";
import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";

function ManagerDashboardPage() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const members = users.filter((item) => item.role === "Member");

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
          {  managerStats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <CustomCard
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                  key={stat.title}
                />
              </Col>
            ))
          }
        </Row>

        <CustomTable
          dataSource={members}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
            { title: "Role", dataIndex: "role" },
          ]}
          pagination={{ pageSize: 5 }}
        />

      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboardPage;
