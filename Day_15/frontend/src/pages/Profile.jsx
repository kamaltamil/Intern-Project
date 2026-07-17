import "./Profile.css";
import { useContext } from "react";
import { Card, Descriptions, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { AuthContext } from "../context/AuthContext";

const { Title } = Typography;

const Profile = () => {
  const { user } = useContext(AuthContext);

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
};

export default Profile;
