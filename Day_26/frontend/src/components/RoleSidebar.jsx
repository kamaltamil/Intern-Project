import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  TagsOutlined,
  CrownOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { hasPermission } from "../utils/hasPermission";
import { setSidebarCollapsed } from "../store/slices/dashboardSlice";

const { Sider } = Layout;

const ALL_MODULES = [
  { resource: "dashboard", key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { resource: "users", key: "/users", icon: <TeamOutlined />, label: "User Management" },
  { resource: "roles", key: "/roles", icon: <TagsOutlined />, label: "Role Management" },
  { resource: "bookings", key: "/bookings", icon: <CalendarOutlined />, label: "Bookings" },
  { resource: "approval", key: "/approval", icon: <CheckCircleOutlined />, label: "Booking Approval" },
  { resource: "reports", key: "/reports", icon: <BarChartOutlined />, label: "Reports" },
  { resource: "rooms", key: "/rooms", icon: <HomeOutlined />, label: "Room Management" },
  { resource: "profile", key: "/profile", icon: <UserOutlined />, label: "Profile" },
];

// Dynamically renders sidebar menu items based on the user's view permissions.
function RoleSidebar() {
  const { permissions, theme } = useSelector((state) => state.auth);
  const { sidebarCollapsed } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === "dark";

  // Filter modules based on whether the current user's role has 'view' permission.
  const menuItems = ALL_MODULES
    .filter((module) => hasPermission(permissions, module.resource, "view"))
    .map((module) => ({
      key: module.key,
      icon: module.icon,
      label: module.label,
    }));

  const brandItem = {
    key: "brand",
    icon: <CrownOutlined />,
    label: "HotelPro",
    style: {
      color: "#C76A34",
      fontSize: "18px",
      fontWeight: 700,
      cursor: "default",
      marginBottom: 8,
    },
  };

  return (
    <Sider
      breakpoint="lg"
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={(collapsed) => dispatch(setSidebarCollapsed(collapsed))}
      theme={isDark ? "dark" : "light"}
      style={{
        borderRight: `1px solid ${isDark ? "#2d2d44" : "#ECE6DF"}`,
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 20,
        flex: "0 0 240px",
        overflowY: "auto",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={[brandItem, ...menuItems]}
        theme={isDark ? "dark" : "light"}
        onClick={({ key }) => key !== "brand" && navigate(key)}
        style={{ borderRight: 0, paddingTop: 8 }}
      />
    </Sider>
  );
}

export default RoleSidebar;
