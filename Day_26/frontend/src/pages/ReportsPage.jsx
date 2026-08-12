import { Alert, Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, HomeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { fetchReports } from "../api/queries";
import { bookingStatusConfig } from "../components/booking/BookingHelpers";

const { Title, Text } = Typography;

function ReportsPage() {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const { data = {}, isLoading, isError, error } = useQuery({ queryKey: ["reports"], queryFn: fetchReports });
  const summary = data.summary || {};
  const statusCounts = data.statusCounts || {};
  const roomUsage = data.roomUsage || [];

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ key: status, status, count }));
  const roomColumns = [
    { title: "Room", dataIndex: "roomNumber", render: (value) => `#${value}` },
    { title: "Type", dataIndex: "type" },
    { title: "Bookings", dataIndex: "bookings" },
    { title: "Active Nights", dataIndex: "nights" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Title level={4} className="!mb-1" style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>Reports</Title>
        <Text type="secondary">Booking analytics, status distribution, revenue and room utilization.</Text>
      </div>
      {isError && <Alert type="error" showIcon message={error?.response?.data?.message || "Unable to load reports."} />}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><Card><Statistic loading={isLoading} title="Total Bookings" value={summary.totalBookings || 0} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic loading={isLoading} title="Active Bookings" value={summary.activeBookings || 0} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic loading={isLoading} title="Completed" value={summary.completedBookings || 0} prefix={<HomeOutlined />} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic loading={isLoading} title="Revenue" value={summary.revenue || 0} prefix="₹" /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Booking Status Summary">
            <Table loading={isLoading} rowKey="key" dataSource={statusData} pagination={false} columns={[
              { title: "Status", dataIndex: "status", render: (status) => <Tag color={bookingStatusConfig[status]?.color}>{status}</Tag> },
              { title: "Count", dataIndex: "count" },
            ]} locale={{ emptyText: "No booking data." }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Room Utilization">
            <Table loading={isLoading} rowKey="roomId" dataSource={roomUsage} columns={roomColumns} pagination={{ pageSize: 6 }} locale={{ emptyText: "No room usage data." }} />
          </Card>
        </Col>
      </Row>
      <Card title="Additional Metrics">
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}><Statistic title="Rejected" value={summary.rejectedBookings || 0} prefix={<CloseCircleOutlined />} /></Col>
          <Col xs={12} md={6}><Statistic title="Cancelled" value={summary.cancelledBookings || 0} prefix={<CloseCircleOutlined />} /></Col>
          <Col xs={12} md={6}><Statistic title="Payment Pending" value={statusCounts["Payment Pending"] || 0} /></Col>
          <Col xs={12} md={6}><Statistic title="Booked" value={statusCounts.Booked || 0} /></Col>
        </Row>
      </Card>
    </div>
  );
}

export default ReportsPage;
