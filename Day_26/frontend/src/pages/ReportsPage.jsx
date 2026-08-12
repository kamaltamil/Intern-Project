import { Card, Col, Row, Select, Statistic, Table, Tag, Typography, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { fetchReports, updateBooking } from "../api/queries";
import { usePermission } from "../hooks/usePermission";
import { bookingStatusConfig, formatDate } from "../components/booking/BookingHelpers";

const { Title, Text } = Typography;

const STATUS_TRANSITIONS = {
  "Pending Approval": ["Payment Pending", "Rejected", "Cancelled"],
  "Payment Pending": ["Booked", "Cancelled"],
  Booked: ["CheckedIn", "Cancelled"],
  CheckedIn: ["CheckedOut"],
  CheckedOut: [],
  Cancelled: [],
  Rejected: [],
};

function ReportsPage() {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const canUpdate = usePermission("bookings", "update");
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
  const roomUsage = data.roomUsage || [];
  const bookings = data.bookings || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, bookingStatus }) =>
      updateBooking({ id, payload: { bookingStatus } }),
    onSuccess: () => {
      message.success("Booking status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      message.error(
        err?.response?.data?.message || "Unable to update booking status",
      );
    },
  });

  const statusCards = [
    {
      title: "Booked",
      value: statusCounts.Booked || 0,
      icon: <CalendarOutlined />,
    },
    {
      title: "Checked In",
      value: statusCounts.CheckedIn || 0,
      icon: <CheckCircleOutlined />,
    },
    {
      title: "Checked Out",
      value: statusCounts.CheckedOut || 0,
      icon: <HomeOutlined />,
    },
    {
      title: "Cancelled",
      value: statusCounts.Cancelled || 0,
      icon: <CloseCircleOutlined />,
    },
  ];

  const bookingColumns = [
    {
      title: "Room",
      dataIndex: "room",
      render: (room) => (room ? `#${room.roomNumber}` : "—"),
    },
    {
      title: "Guest",
      dataIndex: "user",
      render: (user) => user?.name || "—",
    },
    {
      title: "Check In",
      dataIndex: "startDate",
      render: formatDate,
    },
    {
      title: "Check Out",
      dataIndex: "endDate",
      render: formatDate,
    },
    {
      title: "Status",
      dataIndex: "bookingStatus",
      render: (status) => (
        <Tag color={bookingStatusConfig[status]?.color}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Change Status",
      key: "statusUpdate",
      render: (_, record) => {
        if (!canUpdate) return <Text type="secondary">No access</Text>;

        const options = STATUS_TRANSITIONS[record.bookingStatus] || [];
        if (options.length === 0) return <Text type="secondary">—</Text>;

        return (
          <Select
            size="small"
            placeholder="Select status"
            value={undefined}
            loading={statusMutation.isPending && statusMutation.variables?.id === record._id}
            disabled={statusMutation.isPending}
            style={{ minWidth: 150 }}
            options={options.map((status) => ({
              value: status,
              label: status,
            }))}
            onChange={(bookingStatus) =>
              statusMutation.mutate({ id: record._id, bookingStatus })
            }
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Title
          level={4}
          className="!mb-1"
          style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
        >
          Reports
        </Title>
        <Text type="secondary">
          Booking analytics, status distribution, revenue and room utilization.
        </Text>
      </div>

      {isError && (
        <Card>
          <Text type="danger">
            {error?.response?.data?.message || "Unable to load reports."}
          </Text>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        {statusCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card>
              <Statistic
                loading={isLoading}
                title={card.title}
                value={card.value}
                prefix={card.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Booking Summary">
            <Row gutter={[16, 16]}>
              <Col xs={12} md={8}>
                <Statistic title="Total" value={summary.totalBookings || 0} />
              </Col>
              <Col xs={12} md={8}>
                <Statistic title="Active" value={summary.activeBookings || 0} />
              </Col>
              <Col xs={12} md={8}>
                <Statistic title="Revenue" value={summary.revenue || 0} prefix="₹" />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Room Utilization">
            <Table
              loading={isLoading}
              rowKey="roomId"
              dataSource={roomUsage}
              pagination={{ pageSize: 6 }}
              columns={[
                {
                  title: "Room",
                  dataIndex: "roomNumber",
                  render: (value) => `#${value}`,
                },
                { title: "Type", dataIndex: "type" },
                { title: "Bookings", dataIndex: "bookings" },
                { title: "Active Nights", dataIndex: "nights" },
              ]}
              locale={{ emptyText: "No room usage data." }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Booking Status Management"
        extra={
          <Text type="secondary">
            {canUpdate
              ? "Booking Update permission enabled"
              : "Booking Update permission required"}
          </Text>
        }
      >
        <Table
          loading={isLoading}
          rowKey="_id"
          dataSource={bookings}
          columns={bookingColumns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 900 }}
          locale={{ emptyText: "No booking records." }}
        />
      </Card>
    </div>
  );
}

export default ReportsPage;
