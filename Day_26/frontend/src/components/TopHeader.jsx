import { Layout, Avatar, Dropdown, Button, Tooltip } from "antd";
import {
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout, setTheme } from "../store/slices/authSlice";
import { logoutUser } from "../api/queries";
import { resolveProfileImage } from "../utils/image";
import { persistor } from "../store/store";

const { Header } = Layout;

function TopHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user, theme } = useSelector((state) => state.auth);

  const isDark = theme === "dark";

  // --------------------------------------------------
  // Complete Logout
  // --------------------------------------------------
  const finishLogout = async () => {
    try {
      // 1. Clear React Query cache
      queryClient.clear();

      // 2. Clear Redux authentication state
      dispatch(logout());

      // 3. Make sure redux-persist writes the cleared
      //    authentication state to localStorage
      await persistor.flush();

      // 4. Force navigation to public landing page
      window.location.replace("/");
    } catch (error) {
      console.error("Logout cleanup error:", error);

      // Even if persistence flush fails,
      // still go to landing page.
      window.location.replace("/");
    }
  };

  // --------------------------------------------------
  // Logout Mutation
  // --------------------------------------------------
  const logoutMutation = useMutation({
    mutationFn: logoutUser,

    // Whether API succeeds or fails,
    // always clear local authentication.
    onSettled: () => {
      finishLogout();
    },
  });

  // --------------------------------------------------
  // Handle Logout
  // --------------------------------------------------
  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate();
  };

  // --------------------------------------------------
  // Theme Toggle
  // --------------------------------------------------
  const toggleTheme = () => {
    dispatch(setTheme(isDark ? "light" : "dark"));
  };

  // --------------------------------------------------
  // Dropdown Items
  // --------------------------------------------------
  const dropdownItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },

    {
      type: "divider",
    },

    {
      key: "logout",
      label: logoutMutation.isPending
        ? "Logging out..."
        : "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      disabled: logoutMutation.isPending,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: isDark ? "#16213e" : "#ffffff",
        borderBottom: `1px solid ${
          isDark ? "#2d2d44" : "#ECE6DF"
        }`,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
        flexShrink: 0,
      }}
    >
      {/* ---------------------------------------------
          Welcome Message
      --------------------------------------------- */}
      <div>
        <h2
          className="text-xl font-semibold text-clip"
          style={{
            color: isDark ? "#f0f0f0" : "#2E2A27",
            margin: 0,
          }}
        >
          Welcome{" "}
          {user?.name?.split(" ")[0] || "User"}
        </h2>
      </div>

      {/* ---------------------------------------------
          Right Side
      --------------------------------------------- */}
      <div className="flex items-center gap-3">

        {/* -------------------------------------------
            Theme Toggle
        ------------------------------------------- */}
        <Tooltip
          title={
            isDark
              ? "Switch to Light mode"
              : "Switch to Dark mode"
          }
        >
          <Button
            type="text"
            shape="circle"
            icon={
              isDark ? (
                <SunOutlined
                  style={{
                    color: "#facc15",
                    fontSize: 18,
                  }}
                />
              ) : (
                <MoonOutlined
                  style={{
                    color: "#7c3aed",
                    fontSize: 18,
                  }}
                />
              )
            }
            onClick={toggleTheme}
            style={{
              background: isDark
                ? "#2d2d44"
                : "#F8F4EE",
              border: "none",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Tooltip>

        {/* -------------------------------------------
            User Dropdown
        ------------------------------------------- */}
        <Dropdown
          menu={{
            items: dropdownItems,
          }}
          placement="bottomRight"
        >
          <div
            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg transition-colors"
            style={{
              background: isDark
                ? "#2d2d44"
                : "transparent",
            }}
          >
            {/* Profile Image */}
            <Avatar
              src={resolveProfileImage(
                user?.profileImage
              )}
              style={{
                backgroundColor: "#C76A34",
              }}
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </Avatar>

            {/* User Details */}
            <div className="flex flex-col leading-tight">
              <span
                className="font-medium text-sm"
                style={{
                  color: isDark
                    ? "#f0f0f0"
                    : "#2E2A27",
                }}
              >
                {user?.name || "User"}
              </span>

              <span
                className="text-xs"
                style={{
                  color:
                    typeof user?.role === "object"
                      ? user.role?.color ||
                        "#C76A34"
                      : user?.roleColor ||
                        "#C76A34",
                }}
              >
                {typeof user?.role === "object"
                  ? user.role?.name
                  : user?.role || "Member"}
              </span>
            </div>

            {/* Dropdown Icon */}
            <DownOutlined
              className="text-xs"
              style={{
                color: isDark
                  ? "#aaa"
                  : "#9ca3af",
              }}
            />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}

export default TopHeader;