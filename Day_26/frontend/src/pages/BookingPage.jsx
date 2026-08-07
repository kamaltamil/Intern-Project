import { useState } from "react";
import { Button, Alert, Typography, message } from "antd";

import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";

import { useSelector } from "react-redux";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "../components/DashboardLayout";

import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";

import BookingModal from "../components/booking/BookingModal";
import BookingDetailsModal from "../components/booking/BookingDetailsModal";

import BookingStats from "../components/booking/BookingStats";

import { getBookingColumns } from "../components/booking/BookingColumns";

import { getPageTitle } from "../components/booking/BookingHelpers";

import { fetchRooms, fetchBookings, createBooking } from "../api/queries";

const { Title } = Typography;

function BookingPage() {
  const queryClient = useQueryClient();

  const { role } = useSelector((state) => state.auth);

  const [bookModalOpen, setBookModalOpen] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  /* ---------------------------------------------------------------- */

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  /* ---------------------------------------------------------------- */

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsQueryError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  /* ---------------------------------------------------------------- */

  const bookingMutation = useMutation({
    mutationFn: createBooking,

    onSuccess: () => {
      message.success("Room booked successfully.");

      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      setBookModalOpen(false);
    },

    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Booking failed",
      );
    },
  });

  /* ---------------------------------------------------------------- */

  const openBookingModal = () => {
    if (rooms.length === 0) {
      refetchRooms();
    }

    setBookModalOpen(true);
  };

  /* ---------------------------------------------------------------- */

  const openViewModal = (booking) => {
    setSelectedBooking(booking);

    setViewModalOpen(true);
  };

  /* ---------------------------------------------------------------- */

  const closeViewModal = () => {
    setViewModalOpen(false);

    setSelectedBooking(null);
  };

  /* ---------------------------------------------------------------- */

  const pageTitle = getPageTitle(role);

  const columns = getBookingColumns(role, openViewModal);

  const stats = BookingStats(bookings);

  /* ---------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* ---------- Header ---------- */}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-2xl text-[#C76A34]" />

            <Title level={4} className="!mb-0 !text-[#2E2A27] dark:!text-[#f0f0f0]">
              {pageTitle}
            </Title>
          </div>

          {role === "Member" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openBookingModal}
              style={{
                backgroundColor: "#C76A34",
                borderColor: "#C76A34",
              }}
            >
              Make Booking
            </Button>
          )}
        </div>

        {/* ---------- Error ---------- */}

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

        {/* ---------- Statistics ---------- */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((item) => (
            <CustomCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>

        {/* ---------- Table ---------- */}

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
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
        />

        {/* ---------- Booking Modal ---------- */}

        <BookingModal
          open={bookModalOpen}
          rooms={rooms}
          roomsLoading={roomsLoading}
          loading={bookingMutation.isPending}
          onCancel={() => setBookModalOpen(false)}
          onSubmit={(payload) => bookingMutation.mutate(payload)}
        />

        {/* ---------- Details Modal ---------- */}

        <BookingDetailsModal
          open={viewModalOpen}
          booking={selectedBooking}
          role={role}
          onClose={closeViewModal}
        />
      </div>
    </DashboardLayout>
  );
}

export default BookingPage;
