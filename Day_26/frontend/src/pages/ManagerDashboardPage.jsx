import { Row, Col, Skeleton, Alert, Avatar, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/queries";
import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";
import { resolveProfileImage } from "../utils/image";
import { ROLE_COLORS } from "../constants/roleColors";

function ManagerDashboardPage() {
  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const getRoleName = (r) => (typeof r === "object" ? r?.name : r) || "";

  const getFallbackRoleColor = (roleName) => {
    const match = ROLE_COLORS.find(
      (c) => c.label.toLowerCase() === roleName?.toLowerCase()
    );
    return match ? match.value : "#722ed1";
  };

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
          {  managerStats.map((stat) => (
              <Col xs={24} sm={12} lg={8} key={stat.title}>
                <CustomCard
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                />
              </Col>
            ))
          }
        </Row>

        <CustomTable
          dataSource={members}
          columns={[
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
            { title: "Email", dataIndex: "email" },
            {
              title: 'Role',
              dataIndex: 'role',
              render: (role) => {
                const name = getRoleName(role);
                const color = typeof role === 'object' && role?.color ? role.color : getFallbackRoleColor(name);
                return <Tag color={color}>{name || 'Member'}</Tag>;
              },
            },
          ]}
          pagination={{ pageSize: 5 }}
        />

      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboardPage;
