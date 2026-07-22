import "./Sidebar.css";
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

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login");
  };

  return (
    <>
      <div className="logo">{collapsed ? "TM" : "Task Manager"}</div>

      <Menu theme="dark" mode="inline">
        <Menu.Item key="tasks" icon={<CheckSquareOutlined />}>
          <NavLink to="/dashboard/tasks">Tasks</NavLink>
        </Menu.Item>

        <Menu.Item key="profile" icon={<ProfileOutlined />}>
          <NavLink to="/dashboard/profile">Profile</NavLink>
        </Menu.Item>

        {user?.role === "Admin" && (
          <Menu.Item key="users" icon={<UserOutlined />}>
            <NavLink to="/dashboard/users">Users</NavLink>
          </Menu.Item>
        )}

        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu>
    </>
  );
};

export default Sidebar;
