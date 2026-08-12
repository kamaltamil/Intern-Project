import { useState } from "react";
import { Alert, Button, Card, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { approveBooking, fetchPendingApprovals, rejectBooking } from "../api/queries";
import { formatDate, getNights, getTotalCost, bookingStatusConfig } from "../components/booking/BookingHelpers";

const { Title, Text } = Typography;

function ApprovalPage() {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState(null);

  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pendingApprovals"],
    queryFn: fetchPendingApprovals,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }) => action === "approve" ? approveBooking(id) : rejectBooking(id),
    onMutate: ({ id }) => setBusyId(id),
    onSuccess: (_, variables) => {
      message.success(variables.action === "approve" ? "Booking approved. Payment is now pending." : "Booking rejected.");
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => message.error(err?.response?.data?.message || "Unable to update booking."),
    onSettled: () => setBusyId(null),
  });

  const columns = [
    { title: "Room", render: (_, record) => record.room?.roomNumber ? `#${record.room.roomNumber}` : "—" },
    { title: "Guest", render: (_, record) => record.user?.name || record.user?.username || "—" },
    { title: "Check In", dataIndex: "startDate", render: formatDate },
    { title: "Check Out", dataIndex: "endDate", render: formatDate },
    { title: "Duration", render: (_, record) => `${getNights(record.startDate, record.endDate)} night(s)` },
    { title: "Amount", render: (_, record) => `₹${getTotalCost(record)}` },
    { title: "Status", dataIndex: "bookingStatus", render: (status) => <Tag color={bookingStatusConfig[status]?.color}>{status}</Tag> },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Popconfirm title="Approve this booking?" onConfirm={() => mutation.mutate({ id: record._id, action: "approve" })} okText="Approve">
            <Button type="primary" icon={<CheckOutlined />} loading={busyId === record._id}>Approve</Button>
          </Popconfirm>
          <Popconfirm title="Reject this booking?" onConfirm={() => mutation.mutate({ id: record._id, action: "reject" })} okText="Reject" okButtonProps={{ danger: true }}>
            <Button danger icon={<CloseOutlined />} loading={busyId === record._id}>Reject</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Title level={4} className="!mb-1" style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>Booking Approval</Title>
        <Text type="secondary">Review and approve pending room bookings before payment.</Text>
      </div>
      {isError && <Alert type="error" showIcon message={error?.response?.data?.message || "Unable to load pending bookings."} />}
      <Card>
        <div className="flex justify-end mb-4">
          <Button icon={<ReloadOutlined />} onClick={refetch} loading={isLoading}>Refresh</Button>
        </div>
        <Table rowKey="_id" loading={isLoading} dataSource={data} columns={columns} pagination={{ pageSize: 8 }} scroll={{ x: 900 }} locale={{ emptyText: "No bookings pending approval." }} />
      </Card>
    </div>
  );
}

export default ApprovalPage;
