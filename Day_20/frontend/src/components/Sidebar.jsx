import "./Sidebar.css";
import React from "react";
import { Menu } from "antd";
import {
  ProfileOutlined,
  CheckSquareOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

// React.memo prevents re-renders when DashboardLayout re-renders
// due to unrelated state changes (e.g., sidebar collapse toggle).
const Sidebar = React.memo(({ collapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const sidebarItems = [
    {
      key: "tasks",
      icon: <CheckSquareOutlined />,
      label: <NavLink to="/dashboard/tasks">Tasks</NavLink>,
    },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: <NavLink to="/dashboard/profile">Profile</NavLink>,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <NavLink to="/dashboard/users">Users</NavLink>,
      condition: user?.role === "Admin",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    }
  ]

  return (
    <>
      <div className="logo">{collapsed ? "TM" : "Task Manager"}</div>

      <Menu theme="dark" mode="inline">
        {sidebarItems.map((item) => {
          if (item.condition === false) return null; 
          return (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              onClick={item.onClick}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu>
    </>
  );
});

export default Sidebar;
