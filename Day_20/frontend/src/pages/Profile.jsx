import "./Profile.css";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Avatar, Typography, message, Spin } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { uploadProfileImage } from "../api/authApi";
import { normalizeUserData, setUser } from "../store/authSlice";

const { Title, Text } = Typography;

/**
 * Profile page — displays user info and allows uploading a profile image.
 * The avatar acts as the upload trigger: hover reveals a camera icon overlay.
 */
const Profile = React.memo(() => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      message.error("Only JPG, PNG or WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error("Image must be smaller than 2 MB.");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadProfileImage(file);
      const updatedUser = normalizeUserData(response);
      dispatch(setUser(updatedUser));
      message.success("Profile image updated!");
    } catch (err) {
      message.error(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  };

  return (
    <Card className="profile-card">
      <div className="profile-header">
        {/* Clickable avatar with camera overlay */}
        <div
          className="avatar-wrapper"
          onClick={handleAvatarClick}
          title="Click to change profile photo"
        >
          <Spin spinning={uploading}>
            {user?.profileImage ? (
              <Avatar
                size={90}
                src={user.profileImage}
                className="profile-avatar"
              />
            ) : (
              <Avatar
                size={90}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
            )}
          </Spin>
          <div className="avatar-overlay">
            <CameraOutlined className="camera-icon" />
          </div>
        </div>

        <div className="profile-info">
          <Title level={3} style={{ margin: 0 }}>
            {user?.name}
          </Title>
          <Text type="secondary">@{user?.username}</Text>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>
        <Descriptions.Item label="Username">@{user?.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
});

export default Profile;
