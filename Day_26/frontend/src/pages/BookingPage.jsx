import { useState } from "react";
import { Button, Alert, Typography, message, Row, Col, Select, Space } from "antd";
import { CalendarOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";
import PermissionGate from "../components/PermissionGate";
import BookingModal from "../components/booking/BookingModal";
import BookingDetailsModal from "../components/booking/BookingDetailsModal";
import BookingStats from "../components/booking/BookingStats";
import { getBookingColumns } from "../components/booking/BookingColumns";
import { getPageTitle } from "../components/booking/BookingHelpers";
import { fetchBookingRooms, fetchBookings, fetchRoles, createBooking } from "../api/queries";
import { usePermission } from "../hooks/usePermission";

const { Title } = Typography;

function BookingPage() {
  const queryClient = useQueryClient();
  const { role, theme, user, _id: authId } = useSelector((state) => state.auth);
  const canViewUsers = usePermission("users", "view");
  const canCreateBooking = usePermission("bookings", "create");
  const isDark = theme === "dark";

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    isError: roomsError,
    error: roomsQueryError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ["booking-rooms"],
    queryFn: () => fetchBookingRooms(),
    enabled: canCreateBooking,
  });

  console.log(rooms);
  
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsQueryError,
    refetch: refetchBookings,
  } = useQuery({ queryKey: ["bookings"], queryFn: fetchBookings });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      message.success("Booking request created successfully. Waiting for approval.");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-rooms"] });
      setBookModalOpen(false);
    },
    onError: (error) =>
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Booking failed",
      ),
  });

  const canViewRoles = usePermission("roles", "view");

  const { data: manageableRoles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: canViewRoles,
  });

  const currentUserId = user?._id || user?.id || authId;
  const normalizedCurrentUserId = currentUserId ? String(currentUserId) : "";

  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [onlyMine, setOnlyMine] = useState(false);

  // Keep the frontend filter aligned with the IDs returned by the backend.
  const filteredBookings = bookings.filter((booking) => {
    const bookingUserId =
      typeof booking.user === "object" ? booking.user?._id : booking.user;

    if (onlyMine && String(bookingUserId) !== normalizedCurrentUserId) {
      return false;
    }

    if (selectedRoleIds.length) {
      const roleId =
        typeof booking.user?.role === "object"
          ? booking.user.role?._id
          : booking.user?.role;

      if (!selectedRoleIds.includes(String(roleId))) return false;
    }

    return true;
  });

  const openBookingModal = () => {
    refetchRooms();
    setBookModalOpen(true);
  };

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedBooking(null);
  };

  const pageTitle = getPageTitle(role);
  const columns = getBookingColumns(canViewUsers, openViewModal);
  const stats = BookingStats(bookings);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sm:flex-row flex-col sm:gap-0 gap-3 sm:text-start text-center">
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-2xl text-[#C76A34]" />
          <Title
            level={4}
            className="!mb-0"
            style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
          >
            {pageTitle}
          </Title>
        </div>

        <PermissionGate resource="bookings" action="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openBookingModal}
            style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
          >
            Make Booking
          </Button>
        </PermissionGate>
      </div>

      {bookingsError && (
        <Alert
          type="error"
          showIcon
          message={
            bookingsQueryError?.response?.data?.message ||
            bookingsQueryError?.message ||
            "Unable to load bookings."
          }
        />
      )}

      {roomsError && (
        <Alert
          type="error"
          showIcon
          message={
            roomsQueryError?.response?.data?.message ||
            roomsQueryError?.message ||
            "Unable to load available rooms."
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <CustomCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Col>
        ))}
      </Row>

      <CustomTable
        title={`${pageTitle} (${filteredBookings.length})`}
        extraHeader={
          <Space wrap>
            <Button
              icon={<UserOutlined />}
              type={onlyMine ? "primary" : "default"}
              onClick={() => setOnlyMine((prev) => !prev)}
              style={
                onlyMine
                  ? { backgroundColor: "#C76A34", borderColor: "#C76A34" }
                  : {}
              }
            >
              Me
            </Button>

            {manageableRoles.length > 0 && (
              <Select
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                placeholder="Filter by role"
                style={{ minWidth: 220 }}
                value={selectedRoleIds}
                onChange={(values) => setSelectedRoleIds(values.map(String))}
                options={manageableRoles.map((r) => ({
                  value: String(r._id),
                  label: (
                    <Space>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: r.color || "#722ed1" }}
                      />
                      <span>{r.name}</span>
                    </Space>
                  ),
                }))}
              />
            )}

            <Button loading={bookingsLoading} onClick={refetchBookings}>
              Refresh
            </Button>
          </Space>
        }
        rowKey="_id"
        isLoading={bookingsLoading}
        dataSource={filteredBookings}
        columns={columns}
        pagination={{ pageSize: 5, showSizeChanger: false }}
      />

      <BookingModal
        open={bookModalOpen}
        rooms={rooms}
        roomsLoading={roomsLoading}
        loading={bookingMutation.isPending}
        onCancel={() => setBookModalOpen(false)}
        onSubmit={(payload) => bookingMutation.mutate(payload)}
      />

      <BookingDetailsModal
        open={viewModalOpen}
        booking={selectedBooking}
        canViewUsers={canViewUsers}
        onClose={closeViewModal}
      />
    </div>
  );
}

export default BookingPage;
