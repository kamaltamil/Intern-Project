import "./Profile.css";
import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

// React.memo — pure display component that only reads Redux state.
// Skips re-renders when DashboardLayout re-renders from sidebar toggle.
const Profile = React.memo(() => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Avatar size={70} icon={<UserOutlined />} />

        <div style={{ marginLeft: 20 }}>
          <Title level={3}>{user?.name}</Title>
        </div>
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>

        <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
});

export default Profile;
