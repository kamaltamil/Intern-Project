import { useMemo } from "react";
import { Row, Col, Skeleton, Empty, Card } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  DollarOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  fetchUsers,
  fetchBookings,
  fetchRooms,
  fetchPendingApprovals,
  fetchReports,
} from "../api/queries";
import CustomCard from "../components/CustomCard";
import LandingBanner from "../components/LandingBanner";

const ICON_MAP = {
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  HomeOutlined: <HomeOutlined />,
  DollarOutlined: <DollarOutlined />,
  CrownOutlined: <CrownOutlined />,
};

function DynamicRoleDashboard({ dashboardConfig = {}, roleName = "Custom Role" }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const statsConfig = dashboardConfig?.stats || [];
  const bannerConfig = dashboardConfig?.banner || {};

  // Check which data sets are needed based on configured widgets.
  const needsUsers = useMemo(
    () => statsConfig.some((s) => s.key === "totalUsers"),
    [statsConfig],
  );
  const needsBookings = useMemo(
    () =>
      statsConfig.some((s) =>
        [
          "totalBookings",
          "todayBookings",
          "activeBookings",
          "myUpcoming",
          "myHistory",
        ].includes(s.key),
      ),
    [statsConfig],
  );
  const needsRooms = useMemo(
    () => statsConfig.some((s) => ["availableRooms", "totalRooms"].includes(s.key)),
    [statsConfig],
  );
  const needsPending = useMemo(
    () => statsConfig.some((s) => s.key === "pendingApprovals"),
    [statsConfig],
  );
  const needsReports = useMemo(
    () => statsConfig.some((s) => s.key === "revenue"),
    [statsConfig],
  );

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: needsUsers,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    enabled: needsBookings,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: rooms = [], isLoading: isRoomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    enabled: needsRooms,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: pending = [], isLoading: isPendingLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: fetchPendingApprovals,
    enabled: needsPending,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: reports = {}, isLoading: isReportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    enabled: needsReports,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const isLoading =
    (needsUsers && isUsersLoading) ||
    (needsBookings && isBookingsLoading) ||
    (needsRooms && isRoomsLoading) ||
    (needsPending && isPendingLoading) ||
    (needsReports && isReportsLoading);

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  // Calculate dashboard values from the API data instead of configured sample values.
  const safeUsers = Array.isArray(users) ? users : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safePending = Array.isArray(pending) ? pending : [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayStart = new Date(todayStr);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  // Keep room availability based on bookings because rooms do not store a status field.
  const occupiedRoomIds = new Set(
    safeBookings
      .filter(
        (booking) =>
          ["Pending Approval", "Booked", "CheckedIn"].includes(
            booking.bookingStatus,
          ) &&
          new Date(booking.startDate) < tomorrowStart &&
          new Date(booking.endDate) > todayStart,
      )
      .map((booking) =>
        typeof booking.room === "object" ? booking.room?._id : booking.room,
      )
      .filter(Boolean)
      .map(String),
  );

  const statValues = {
    totalUsers: safeUsers.length,
    totalBookings: safeBookings.length,
    todayBookings: safeBookings.filter(
      (booking) => booking.startDate?.startsWith(todayStr),
    ).length,
    activeBookings: safeBookings.filter((booking) =>
      ["Booked", "CheckedIn"].includes(booking.bookingStatus),
    ).length,
    pendingApprovals: safePending.length,
    availableRooms: safeRooms.filter(
      (room) => !occupiedRoomIds.has(String(room._id)),
    ).length,
    totalRooms: safeRooms.length,
    myUpcoming: safeBookings.filter(
      (booking) =>
        (booking.user?._id === user?._id ||
          String(booking.user) === String(user?._id)) &&
        ["Pending Approval", "Payment Pending", "Booked"].includes(
          booking.bookingStatus,
        ) &&
        new Date(booking.endDate) >= todayStart,
    ).length,
    myHistory: safeBookings.filter(
      (booking) =>
        (booking.user?._id === user?._id ||
          String(booking.user) === String(user?._id)) &&
        ["CheckedOut", "Cancelled", "Rejected"].includes(
          booking.bookingStatus,
        ),
    ).length,
    revenue:
      reports.summary?.revenue !== undefined
        ? `₹${Number(reports.summary.revenue).toLocaleString("en-IN")}`
        : "₹0",
  };

  const hasStats = statsConfig.length > 0;
  const hasBanner =
    bannerConfig.enabled !== false &&
    (bannerConfig.title || bannerConfig.subtitle);

  if (!hasStats && !hasBanner) {
    return (
      <Card className="rounded-2xl border border-[#ECE6DF] text-center py-12">
        <Empty
          description={
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-700">
                Welcome to {roleName} Console
              </p>
              <p className="text-xs text-gray-400">
                No custom dashboard widgets configured for this role yet.
              </p>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasStats && (
        <Row gutter={[16, 16]}>
          {statsConfig.map((stat) => {
            const rawVal = statValues[stat.key];
            const displayVal = rawVal !== undefined ? rawVal : 0;
            const iconEl = ICON_MAP[stat.icon] || <CalendarOutlined />;

            return (
              <Col
                xs={24}
                sm={12}
                lg={statsConfig.length <= 3 ? 8 : 6}
                key={stat.key || stat.title}
              >
                <CustomCard
                  title={stat.title || stat.key}
                  value={displayVal}
                  icon={iconEl}
                  color={stat.color || "#C76A34"}
                />
              </Col>
            );
          })}
        </Row>
      )}

      {hasBanner && (
        <LandingBanner
          image={bannerConfig.image || "/dashboard/manager-hero.jpg"}
          alt={bannerConfig.title || `${roleName} Banner`}
          title={bannerConfig.title || `HotelPro ${roleName} Console`}
          subtitle={
            bannerConfig.subtitle ||
            "Access your permitted management and booking modules seamlessly."
          }
          actionLabel={bannerConfig.actionLabel || "View Dashboard"}
          onAction={() => {
            if (bannerConfig.actionUrl) {
              navigate(bannerConfig.actionUrl);
            } else {
              navigate("/bookings");
            }
          }}
        />
      )}
    </div>
  );
}

export default DynamicRoleDashboard;
