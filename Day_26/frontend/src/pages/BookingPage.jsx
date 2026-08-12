import { useState } from "react";
import { Button, Alert, Typography, message, Row, Col } from "antd";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
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
import { fetchRooms, fetchBookings, createBooking } from "../api/queries";
import { usePermission } from "../hooks/usePermission";

const { Title } = Typography;

function BookingPage() {
  const queryClient = useQueryClient();
  const { role, theme } = useSelector((state) => state.auth);
  const canViewUsers = usePermission("users", "view");
  const isDark = theme === "dark";

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useQuery({ queryKey: ["rooms"], queryFn: fetchRooms });

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
      setBookModalOpen(false);
    },
    onError: (error) =>
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Booking failed",
      ),
  });

  const openBookingModal = () => {
    if (rooms.length === 0) refetchRooms();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
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
        title={`${pageTitle} (${bookings.length})`}
        extraHeader={
          <Button loading={bookingsLoading} onClick={refetchBookings}>
            Refresh
          </Button>
        }
        rowKey="_id"
        isLoading={bookingsLoading}
        dataSource={bookings}
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
