import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Tag, Modal, Form, Select, DatePicker,
  message, Skeleton, Alert, Typography, Space, Descriptions, Empty,
} from 'antd';
import {
  PlusOutlined, CalendarOutlined, HomeOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import {
  setRooms, setBookings, startBookingLoading, setBookingError,
} from '../store/slices/bookingSlice';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ── Status config ─────────────────────────────────────────────────────────────
const bookingStatusConfig = {
  'Payment Pending': { color: 'gold' },
  Booked:           { color: 'blue' },
  CheckedIn:        { color: 'green' },
  CheckedOut:       { color: 'default' },
  Cancelled:        { color: 'red' },
};

const roomTypeColor = { Single: 'cyan', Double: 'geekblue', Suite: 'purple' };

const roomStatusColor = { Available: 'green', Occupied: 'red', Maintenance: 'orange' };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => (d ? dayjs(d).format('DD MMM YYYY') : '—');

const nightsBetween = (start, end) => {
  const n = dayjs(end).diff(dayjs(start), 'day');
  return `${n} night${n !== 1 ? 's' : ''}`;
};

// ─────────────────────────────────────────────────────────────────────────────

function BookingPage() {
  const dispatch = useDispatch();
  const { role, user } = useSelector((state) => state.auth);
  const { rooms = [], bookings = [], loading, error } = useSelector((state) => state.booking);

  // modal states
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // ── Data loaders ────────────────────────────────────────────
  const loadRooms = async (force = false) => {
    if (!force && rooms.length > 0) return;
    try {
      const response = await api.get('/rooms');
      dispatch(setRooms(response.data?.rooms || []));
    } catch {
      // non-critical
    }
  };

  const loadBookings = async () => {
    try {
      dispatch(startBookingLoading());
      const response = await api.get('/booking');
      dispatch(setBookings(response.data?.bookings || []));
    } catch (err) {
      dispatch(setBookingError(err?.response?.data?.message || 'Unable to load bookings'));
    }
  };

  useEffect(() => {
    loadRooms();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open / close booking modal ──────────────────────────────
  const openBookModal = () => {
    form.resetFields();
    loadRooms(); // ensure rooms are loaded
    setBookModalOpen(true);
  };

  const closeBookModal = () => {
    setBookModalOpen(false);
    form.resetFields();
  };

  // ── View booking detail ─────────────────────────────────────
  const openViewModal = (record) => {
    setSelectedBooking(record);
    setViewModalOpen(true);
  };

  // ── Submit booking ──────────────────────────────────────────
  const handleBookRoom = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;
      setSubmitting(true);

      await api.post('/booking/new', {
        roomId: values.roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      message.success('🎉 Room booked! Your booking is pending payment confirmation.');
      closeBookModal();
      await loadBookings();
    } catch (err) {
      if (err?.errorFields) return; // form validation
      message.error(
        err?.response?.data?.message || err?.response?.data?.error || 'Booking failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table columns ───────────────────────────────────────────

  // View action — shared by both column sets
  const viewAction = (record) => (
    <Button
      icon={<EyeOutlined />}
      size="small"
      onClick={() => openViewModal(record)}
      style={{ borderColor: '#C76A34', color: '#C76A34' }}
    >
      View
    </Button>
  );

  // Admin / Manager columns
  const adminColumns = [
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      render: (room) =>
        room ? (
          <Space direction="vertical" size={0}>
            <span className="font-semibold">#{room.roomNumber}</span>
            <Tag color={roomTypeColor[room.type] || 'default'} className="text-xs">
              {room.type}
            </Tag>
          </Space>
        ) : '—',
    },
    {
      title: 'Guest',
      dataIndex: 'user',
      key: 'user',
      render: (u) =>
        u ? (
          <Space direction="vertical" size={0}>
            <span className="font-medium">{typeof u === 'object' ? u.name || '—' : u}</span>
            {typeof u === 'object' && u.email && (
              <span className="text-xs text-gray-400">{u.email}</span>
            )}
          </Space>
        ) : '—',
    },
    {
      title: 'Check-In',
      dataIndex: 'startDate',
      key: 'startDate',
      render: fmtDate,
    },
    {
      title: 'Check-Out',
      dataIndex: 'endDate',
      key: 'endDate',
      render: fmtDate,
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, r) =>
        r.startDate && r.endDate ? nightsBetween(r.startDate, r.endDate) : '—',
    },
    {
      title: 'Room Status',
      dataIndex: 'roomStatus',
      key: 'roomStatus',
      render: (s) => <Tag color={roomStatusColor[s] || 'default'}>{s}</Tag>,
    },
    {
      title: 'Booking Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (s) => (
        <Tag color={bookingStatusConfig[s]?.color || 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => <Space>{viewAction(record)}</Space>,
    },
  ];

  // Member columns
  const memberColumns = [
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      render: (room) =>
        room ? (
          <Space>
            <HomeOutlined className="text-[#C76A34]" />
            <Space direction="vertical" size={0}>
              <span className="font-semibold">
                #{room.roomNumber} — {room.type}
              </span>
              {room.price && (
                <span className="text-xs text-gray-400">₹{room.price}/night</span>
              )}
            </Space>
          </Space>
        ) : '—',
    },
    {
      title: 'Check-In',
      dataIndex: 'startDate',
      key: 'startDate',
      render: fmtDate,
    },
    {
      title: 'Check-Out',
      dataIndex: 'endDate',
      key: 'endDate',
      render: fmtDate,
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, r) =>
        r.startDate && r.endDate ? nightsBetween(r.startDate, r.endDate) : '—',
    },
    {
      title: 'Total Cost',
      key: 'cost',
      render: (_, r) => {
        const price = r.room?.price;
        if (!price || !r.startDate || !r.endDate) return '—';
        const nights = dayjs(r.endDate).diff(dayjs(r.startDate), 'day');
        return <span className="font-semibold text-[#C76A34]">₹{nights * price}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (s) => (
        <Tag color={bookingStatusConfig[s]?.color || 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => <Space>{viewAction(record)}</Space>,
    },
  ];

  const columns = role === 'Member' ? memberColumns : adminColumns;
  const pageTitle =
    role === 'Admin' ? 'All Bookings' : role === 'Manager' ? 'Member Bookings' : 'My Bookings';

  // ── Summary stats ───────────────────────────────────────────
  const totalBookings  = bookings.length;
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === 'Booked' || b.bookingStatus === 'CheckedIn'
  ).length;
  const pendingPayment = bookings.filter((b) => b.bookingStatus === 'Payment Pending').length;
  const cancelled      = bookings.filter((b) => b.bookingStatus === 'Cancelled').length;

  // ── Cost preview (inside booking form) ─────────────────────
  const CostPreview = () => {
    const dateRange = form.getFieldValue('dateRange');
    const roomId    = form.getFieldValue('roomId');
    const room      = rooms.find((r) => r._id === roomId);
    if (!dateRange || !room) return null;
    const [start, end] = dateRange;
    const nights = end.diff(start, 'day');
    if (nights <= 0) return null;
    return (
      <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-sm text-[#C76A34] font-medium mt-2">
        <span>{nights} night{nights !== 1 ? 's' : ''}</span>
        <span className="mx-2">×</span>
        <span>₹{room.price}</span>
        <span className="mx-2">=</span>
        <strong className="text-base">₹{nights * room.price}</strong>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-[#C76A34] text-2xl" />
            <Title level={4} className="!text-[#2E2A27] !mb-0">{pageTitle}</Title>
          </div>

          {/* Make Booking — available to Members (Admin/Manager view-only) */}
          {role === 'Member' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openBookModal}
              style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
            >
              Make Booking
            </Button>
          )}
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-[#C76A34]">{totalBookings}</div>
            <div className="text-gray-500 mt-1 text-sm">Total</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-green-500">{activeBookings}</div>
            <div className="text-gray-500 mt-1 text-sm">Active</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-yellow-500">{pendingPayment}</div>
            <div className="text-gray-500 mt-1 text-sm">Pending Payment</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-red-400">{cancelled}</div>
            <div className="text-gray-500 mt-1 text-sm">Cancelled</div>
          </Card>
        </div>

        {/* ── Bookings Table ── */}
        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-[#2E2A27]">
              {pageTitle} ({bookings.length})
            </span>
            <Button onClick={loadBookings} size="small" loading={loading}>
              Refresh
            </Button>
          </div>

          {loading && bookings.length === 0 ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : bookings?.length === 0 ? (
            <Empty
              description={
                <span className="text-gray-400">
                  {role === 'Member'
                    ? 'No bookings yet. Click "Make Booking" to reserve a room!'
                    : 'No bookings found.'}
                </span>
              }
            >
              {role === 'Member' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openBookModal}
                  style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
                >
                  Make Booking Now
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              rowKey="_id"
              dataSource={bookings}
              columns={columns}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: 700 }}
            />
          )}
        </Card>
      </div>

      {/* ── Make Booking Modal ── */}
      <Modal
        title={
          <span className="text-[#2E2A27] font-semibold flex items-center gap-2">
            <HomeOutlined className="text-[#C76A34]" />
            Make a Booking
          </span>
        }
        open={bookModalOpen}
        onOk={handleBookRoom}
        onCancel={closeBookModal}
        okText="Confirm Booking"
        okButtonProps={{
          style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
          loading: submitting,
        }}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">

          {/* Room selector */}
          <Form.Item
            name="roomId"
            label="Select Room"
            rules={[{ required: true, message: 'Please select a room' }]}
          >
            <Select
              placeholder="Choose an available room..."
              showSearch
              optionFilterProp="label"
              loading={rooms.length === 0}
            >
              {rooms.map((room) => (
                <Option
                  key={room._id}
                  value={room._id}
                  label={`Room ${room.roomNumber} ${room.type}`}
                >
                  <Space>
                    <Tag color={roomTypeColor[room.type] || 'default'}>{room.type}</Tag>
                    <span className="font-medium">Room #{room.roomNumber}</span>
                    <span className="text-gray-400 text-xs">₹{room.price}/night</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Date range */}
          <Form.Item
            name="dateRange"
            label="Check-In → Check-Out"
            rules={[
              { required: true, message: 'Please select check-in and check-out dates' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const [start, end] = value;
                  if (end.diff(start, 'day') < 1) {
                    return Promise.reject(new Error('Minimum stay is 1 night'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <RangePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              format="DD MMM YYYY"
            />
          </Form.Item>

          {/* Live cost preview */}
          <Form.Item shouldUpdate noStyle>
            {() => <CostPreview />}
          </Form.Item>

        </Form>
      </Modal>

      {/* ── View Booking Detail Modal ── */}
      <Modal
        title={
          <span className="text-[#2E2A27] font-semibold flex items-center gap-2">
            <CalendarOutlined className="text-[#C76A34]" />
            Booking Details
          </span>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        }
        width={520}
        destroyOnClose
      >
        {selectedBooking && (
          <Descriptions column={1} bordered size="small" className="mt-4">
            <Descriptions.Item label="Room">
              {selectedBooking.room ? (
                <Space>
                  <Tag color={roomTypeColor[selectedBooking.room.type] || 'default'}>
                    {selectedBooking.room.type}
                  </Tag>
                  <span>Room #{selectedBooking.room.roomNumber}</span>
                </Space>
              ) : '—'}
            </Descriptions.Item>

            {/* Show guest info for Admin/Manager */}
            {role !== 'Member' && (
              <Descriptions.Item label="Guest">
                {selectedBooking.user ? (
                  <Space direction="vertical" size={0}>
                    <span>{typeof selectedBooking.user === 'object' ? selectedBooking.user.name : selectedBooking.user}</span>
                    {selectedBooking.user?.email && (
                      <span className="text-xs text-gray-400">{selectedBooking.user.email}</span>
                    )}
                  </Space>
                ) : '—'}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Check-In">
              {fmtDate(selectedBooking.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Check-Out">
              {fmtDate(selectedBooking.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {selectedBooking.startDate && selectedBooking.endDate
                ? nightsBetween(selectedBooking.startDate, selectedBooking.endDate)
                : '—'}
            </Descriptions.Item>

            {selectedBooking.room?.price && (
              <Descriptions.Item label="Total Cost">
                <span className="font-bold text-[#C76A34]">
                  ₹{
                    dayjs(selectedBooking.endDate).diff(dayjs(selectedBooking.startDate), 'day')
                    * selectedBooking.room.price
                  }
                </span>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Room Status">
              <Tag color={roomStatusColor[selectedBooking.roomStatus] || 'default'}>
                {selectedBooking.roomStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Booking Status">
              <Tag color={bookingStatusConfig[selectedBooking.bookingStatus]?.color || 'default'}>
                {selectedBooking.bookingStatus}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

    </DashboardLayout>
  );
}

export default BookingPage;