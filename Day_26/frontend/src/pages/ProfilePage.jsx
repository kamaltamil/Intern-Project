import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  message,
  Divider,
  Tag,
  Upload,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfile, fetchMe } from "../api/queries";
import { updateUserProfile } from "../store/slices/authSlice";
import { resolveProfileImage } from "../utils/image";
import { ROLE_COLORS, getFallbackRoleColor } from "../constants/roleColors";
import PermissionGate from "../components/PermissionGate";
import { usePermission } from "../hooks/usePermission";

const { Title, Text } = Typography;

function ProfilePage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, theme } = useSelector((state) => state.auth);
  const canUpdateProfile = usePermission("profile", "update");
  const isDark = theme === "dark";

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const profileUser = fetchedUser || user;
  const [editing, setEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedImage, setSavedImage] = useState(() =>
    resolveProfileImage(
      profileUser?.user?.profileImage || user?.profileImage || null,
    ),
  );
  const [previewImage, setPreviewImage] = useState(() =>
    resolveProfileImage(
      profileUser?.user?.profileImage || user?.profileImage || null,
    ),
  );
  const [form] = Form.useForm();

  useEffect(() => {
    const nextImage = resolveProfileImage(
      profileUser?.user?.profileImage || user?.profileImage || null,
    );
    setSavedImage(nextImage);
    setPreviewImage(nextImage);
  }, [profileUser?.user?.profileImage, user?.profileImage]);

  useEffect(() => {
    if (!canUpdateProfile && editing) {
      setEditing(false);
    }
  }, [canUpdateProfile, editing]);

  const roleName =
    typeof profileUser?.role === "object"
      ? profileUser.role?.name
      : profileUser?.role || "Member";
  const roleColor =
    typeof profileUser?.role === "object" && profileUser.role?.color
      ? profileUser.role.color
      : profileUser?.user?.roleColor ||
        profileUser?.roleColor ||
        user?.roleColor ||
        getFallbackRoleColor(roleName);

  const onEditClick = () => {
    if (!canUpdateProfile) return;

    form.setFieldsValue({
      name: profileUser?.user?.name || "",
      email: profileUser?.user?.email || "",
      username: profileUser?.user?.username || "",
    });
    setSelectedFile(null);
    setPreviewImage(savedImage);
    setEditing(true);
  };

  const onCancel = () => {
    setSelectedFile(null);
    setPreviewImage(savedImage);
    setEditing(false);
    form.resetFields();
  };

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const updatedUser = response?.user || {};
      dispatch(updateUserProfile(updatedUser));

      const nextImage = resolveProfileImage(updatedUser?.profileImage || null);
      setSavedImage(nextImage);
      setPreviewImage(nextImage);

      queryClient.setQueryData(["me"], response);
      queryClient.invalidateQueries({ queryKey: ["me"] });

      message.success("Profile updated successfully");
      setEditing(false);
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Failed to update profile",
      );
    },
  });

  const onFinish = (values) => {
    if (!canUpdateProfile) {
      message.error("You do not have permission to update your profile");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("username", values.username);

    if (values.password) {
      formData.append("password", values.password);
    }

    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    }

    profileMutation.mutate(formData);
  };

  if (isUserLoading) {
    return (
      <div className="py-10" >
        <p>Loading profile...</p>
      </div>
    );
  }
  if (isUserError) {
    return (
      <div className="py-10" >
        <p>Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4" >
      <Title level={4} style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>
        My Profile
      </Title>

      <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm" >
        <div className="flex items-center gap-4 mb-6" >
          <Avatar
            size={72}
            src={previewImage}
            style={{ backgroundColor: "#C76A34", fontSize: 28 }}
          >
            {!previewImage &&
              (profileUser?.user?.name?.charAt(0)?.toUpperCase() || "U")}
          </Avatar>
          <div>
            <div className="text-xl font-semibold text-[#2E2A27]" >
              {profileUser?.user?.name || "Unknown"}
            </div>
            <div className="text-[#A74E2B] text-sm" >
              @{profileUser?.user?.username || "user"}
            </div>
            <Tag color={roleColor} className="mt-1" >
              {roleName}
            </Tag>
          </div>
        </div>

        <Divider />

        { !editing ? (
          <div className="space-y-4" >
            <Descriptions
              title="User Profile"
              column={2}
              bordered
              items={[
                {
                  key: "1",
                  label: "Full Name",
                  children: (
                    <Text strong>{profileUser?.user?.name || "-"}</Text>
                  ),
                },
                {
                  key: "2",
                  label: "Email",
                  children: (
                    <Text strong>{profileUser?.user?.email || "-"}</Text>
                  ),
                },
                {
                  key: "3",
                  label: "Username",
                  children: (
                    <Text strong>@{profileUser?.user?.username || "-"}</Text>
                  ),
                },
                {
                  key: "4",
                  label: "Role",
                  children: <Tag color={roleColor}>{roleName}</Tag>,
                },
              ]}
            />

            <PermissionGate resource="profile" action="update" >
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onEditClick}
                style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
              >
                Edit Profile
              </Button>
            </PermissionGate>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Profile Photo" >
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={({ file }) => {
                  const selected = file.originFileObj || file;
                  if (selected) {
                    setSelectedFile(selected);
                    const reader = new FileReader();
                    reader.onload = (e) => setPreviewImage(e.target.result);
                    reader.readAsDataURL(selected);
                  }
                }}
              >
                <Button icon={<UploadOutlined />} type="default" >
                  Choose Photo
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Username is required" }]}
            >
              <Input placeholder="Enter your username" />
            </Form.Item>

            <Form.Item
              label="New Password (leave blank to keep current)"
              name="password"
            >
              <Input.Password placeholder="Enter new password (optional)" />
            </Form.Item>

            <div className="flex gap-2" >
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={profileMutation.isPending}
                style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
              >
                Save Changes
              </Button>
              <Button icon={<CloseOutlined />} onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default ProfilePage;
