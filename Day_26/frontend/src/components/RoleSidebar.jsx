import {
  Layout,
  Menu,
} from "antd";

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

import {
  useSelector,
} from "react-redux";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  hasPermission,
} from "../utils/hasPermission";

const {
  Sider,
} = Layout;

const ALL_MODULES = [
  {
    resource: "dashboard",
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    alwaysShow: true,
  },

  {
    resource: "users",
    key: "/users",
    icon: <TeamOutlined />,
    label: "User Management",
  },

  {
    resource: "roles",
    key: "/roles",
    icon: <TagsOutlined />,
    label: "Role Management",
  },

  {
    resource: "bookings",
    key: "/bookings",
    icon: <CalendarOutlined />,
    label: "Bookings",
  },

  {
    resource: "approval",
    key: "/approval",
    icon: <CheckCircleOutlined />,
    label: "Booking Approval",
  },

  {
    resource: "reports",
    key: "/reports",
    icon: <BarChartOutlined />,
    label: "Reports",
  },

  {
    resource: "rooms",
    key: "/rooms",
    icon: <HomeOutlined />,
    label: "Room Management",
  },

  {
    resource: "profile",
    key: "/profile",
    icon: <UserOutlined />,
    label: "Profile",
    alwaysShow: true,
  },
];

function RoleSidebar() {
  const {
    permissions,
    theme,
  } = useSelector(
    (state) => state.auth
  );

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const isDark =
    theme === "dark";

  const menuItems =
    ALL_MODULES
      .filter((module) => {
        if (
          module.alwaysShow
        ) {
          return true;
        }

        return hasPermission(
          permissions,
          module.resource,
          "view"
        );
      })
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

  const selectedKey =
    location.pathname === "/"
      ? "/"
      : location.pathname;

  return (
    <Sider
      breakpoint="lg"
      collapsible
      style={{
        background: isDark
          ? "#1a1a2e"
          : "#ffffff",

        borderRight: `1px solid ${
          isDark
            ? "#2d2d44"
            : "#ECE6DF"
        }`,

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
        selectedKeys={[
          selectedKey,
        ]}
        items={[
          brandItem,
          ...menuItems,
        ]}
        theme={
          isDark
            ? "dark"
            : "light"
        }
        onClick={({
          key,
        }) => {
          if (
            key !== "brand"
          ) {
            navigate(key);
          }
        }}
        style={{
          borderRight: 0,
          paddingTop: 8,
        }}
      />
    </Sider>
  );
}

export default RoleSidebar;