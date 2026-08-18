import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { fetchReports, updateBooking } from "../api/queries";
import { bookingStatusConfig } from "../components/booking/BookingHelpers";
import PermissionGate from "../components/PermissionGate";
import CustomTable from "../components/CustomTable";
import CustomCard from "../components/CustomCard";

const { Title, Text } = Typography;

const STATUS_FLOW = {
  Booked: ["CheckedIn", "Cancelled"],
  CheckedIn: ["CheckedOut"],
};

const STATUS_LABELS = {
  Booked: "Booked",
  CheckedIn: "Checked In",
  CheckedOut: "Checked Out",
  Cancelled: "Cancelled",
};

const getStatusColor = (status) =>
  bookingStatusConfig[status]?.color || "default";

function ReportsPage() {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const {
    data = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });

  const summary = data.summary || {};
  const statusCounts = data.statusCounts || {};
  const monthlyStats = data.monthlyStats || [];
  const roomUsage = data.roomUsage || [];
  const bookings = data.bookings || [];

  const { mutate: changeBookingStatus, isPending: isUpdating } = useMutation({
    mutationFn: updateBooking,
    onSuccess: () => {
      message.success("Booking status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (updateError) => {
      message.error(
        updateError?.response?.data?.message || "Unable to update booking status.",
      );
    },
  });

  const maxMonthlyBookings = Math.max(
    ...monthlyStats.map((item) => item.bookings),
    1,
  );

  const statusData = [
    "Booked",
    "CheckedIn",
    "CheckedOut",
    "Cancelled",
  ].map((status) => ({
    key: status,
    status,
    count: statusCounts[status] || 0,
  }));

  const primaryStats = [
    {
      title: "Total Bookings",
      value: summary.totalBookings || 0,
      icon: <CalendarOutlined />,
    },
    {
      title: "Active Bookings",
      value: summary.activeBookings || 0,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      title: "Active Users",
      value: summary.activeUsers || 0,
      icon: <TeamOutlined />,
      color: "#1890ff",
    },
    {
      title: "Revenue",
      value: `₹${Number(summary.revenue || 0).toLocaleString("en-IN")}`,
      icon: <DollarOutlined />,
    },
  ];

  const summaryStats = [
    {
      title: "Completed",
      value: summary.completedBookings || 0,
      icon: <HomeOutlined />,
      color: "#52c41a",
    },
    {
      title: "Cancelled",
      value: summary.cancelledBookings || 0,
      icon: <CloseCircleOutlined />,
      color: "#ff4d4f",
    },
    {
      title: "Total Rooms",
      value: summary.totalRooms || 0,
      icon: <HomeOutlined />,
    },
    {
      title: "Avg. Booking Value",
      value: `₹${Number(summary.averageBookingValue || 0).toLocaleString("en-IN")}`,
      icon: <DollarOutlined />,
    },
  ];

  const roomColumns = [
    {
      title: "Room",
      dataIndex: "roomNumber",
      render: (value) => `#${value}`,
    },
    { title: "Type", dataIndex: "type" },
    { title: "Bookings", dataIndex: "bookings" },
    { title: "Active Nights", dataIndex: "nights" },
  ];

  const bookingColumns = [
    {
      title: "Guest",
      dataIndex: ["user", "name"],
      render: (_, record) => record.user?.name || record.user?.username || "—",
    },
    {
      title: "Room",
      dataIndex: ["room", "roomNumber"],
      render: (value) => (value ? `#${value}` : "—"),
    },
    {
      title: "Status",
      dataIndex: "bookingStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: "Change Status",
      key: "statusAction",
      render: (_, record) => {
        const nextStatuses = STATUS_FLOW[record.bookingStatus] || [];

        if (!nextStatuses.length) return <Text type="secondary">—</Text>;

        return (
          <PermissionGate resource="bookings" action="update">
            <Select
              size="small"
              placeholder="Update"
              value={undefined}
              loading={isUpdating}
              style={{ minWidth: 145 }}
              options={nextStatuses.map((status) => ({
                value: status,
                label: STATUS_LABELS[status] || status,
              }))}
              onChange={(bookingStatus) =>
                changeBookingStatus({
                  id: record._id,
                  payload: { bookingStatus },
                })
              }
            />
          </PermissionGate>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Title
          level={4}
          className="!mb-1"
          style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
        >
          Reports
        </Title>
        <Text className="text-gray-400 text-sm">
          Hotel booking analytics, occupancy activity, revenue and status trends.
        </Text>
      </div>

      {isError && (
        <Alert
          type="error"
          showIcon
          message={
            error?.response?.data?.message || "Unable to load reports."
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {primaryStats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <CustomCard
              loading={isLoading}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card title="Booking Trend" className="h-full">
            <div className="flex h-64 items-end gap-4 overflow-x-auto px-2 pb-6 pt-4">
              {monthlyStats.map((item) => (
                <div
                  key={item.key}
                  className="flex h-full min-w-[54px] flex-1 flex-col items-center justify-end gap-2"
                >
                  <Text className="text-xs">{item.bookings}</Text>
                  <div
                    className="w-8 rounded-t-lg bg-[#C76A34] transition-all"
                    style={{
                      height: `${Math.max(
                        (item.bookings / maxMonthlyBookings) * 75,
                        item.bookings ? 8 : 2,
                      )}%`,
                    }}
                  />
                  <Text type="secondary" className="text-xs">
                    {item.label}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card title="Booking Status" className="h-full">
            <div className="space-y-4">
              {statusData.map((item) => {
                const percentage = summary.totalBookings
                  ? Math.round((item.count / summary.totalBookings) * 100)
                  : 0;

                return (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between">
                      <Tag color={getStatusColor(item.status)}>
                        {STATUS_LABELS[item.status]}
                      </Tag>
                      <Text strong>{item.count}</Text>
                    </div>
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      size="small"
                      status={
                        item.status === "Cancelled" ? "exception" : "normal"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {summaryStats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <CustomCard
              loading={isLoading}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <CustomTable
            title="Room Utilization"
            loading={isLoading}
            rowKey="roomId"
            dataSource={roomUsage}
            columns={roomColumns}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "No room usage data." }}
            scroll={{ x: 480 }}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Booking Status Summary">
            <Table
              loading={isLoading}
              rowKey="key"
              dataSource={statusData}
              pagination={false}
              columns={[
                {
                  title: "Status",
                  dataIndex: "status",
                  render: (status) => (
                    <Tag color={getStatusColor(status)}>
                      {STATUS_LABELS[status]}
                    </Tag>
                  ),
                },
                { title: "Count", dataIndex: "count" },
              ]}
              locale={{ emptyText: "No booking data." }}
            />
          </Card>
        </Col>
      </Row>

      <CustomTable
        title="Recent Bookings"
        isLoading={isLoading}
        rowKey="_id"
        dataSource={bookings}
        columns={bookingColumns}
        pagination={{ pageSize: 6 }}
        locale={{ emptyText: "No bookings found." }}
        scroll={{ x: 650 }}
      />
    </div>
  );
}

export default ReportsPage;
