import { Card, Typography, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react";
import { setAuth } from "../store/slices/authSlice";
import { loginUser } from "../api/queries";
import CustomForm from "../components/CustomForm";

const { Title, Text } = Typography;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

// Handles authentication, reCAPTCHA validation, and Redux session initialization.
function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Authenticates user and initializes user role, permissions, and tokens in Redux.
  const loginMutation = useMutation({
    mutationFn: loginUser,
    retry: 0,
    onSuccess: (data) => {
      const { user, token, refreshToken, role, dashboardConfig, permissions } = data || {};

      if (!user || !token) {
        message.error("Invalid login response from server");
        return;
      }

      // Clear stale cache and store active session credentials.
      queryClient.clear();
      dispatch(
        setAuth({
          user,
          token,
          refreshToken,
          role,
          dashboardConfig,
          permissions: permissions || [],
        }),
      );

      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      message.success("Login successful");
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      message.error(error?.response?.data?.message || "Invalid credentials");
    },
  });

  // Verify reCAPTCHA token before sending login request.
  const onFinish = (values) => {
    if (!recaptchaToken) {
      message.error("Please complete the reCAPTCHA verification");
      return;
    }

    loginMutation.mutate({
      identifier: values.email,
      password: values.password,
      recaptchaToken,
    });
  };

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const loginForm = [
    {
      type: "input",
      label: "Email or Username",
      name: "email",
      placeholder: "Enter your email or username",
      rules: [
        { required: true, message: "Email or username is required" },
        { 
          pattern: String.raw`^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9_]{3,16})$`, 
          message: "Please enter a valid email or username"
        }
      ],
    },
    {
      type: "password",
      label: "Password",
      name: "password",
      placeholder: "Enter your password",
      rules: [
        { required: true, message: "Password is required" },
        { 
          pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$`,
          message: "Please enter a valid password"
        }
      ],
    },
    {
      key: "reCaptcha",
      render: () => (
        <div className="flex justify-center mt-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={setRecaptchaToken}
            onExpired={() => setRecaptchaToken(null)}
            onErrored={() => setRecaptchaToken(null)}
          />
        </div>
      ),
    },
    {
      type: "submit",
      label: "Sign In",
      buttonProps: {
        type: "primary",
        htmlType: "submit",
        block: true,
        size: "large",
        loading: loginMutation.isPending,
        style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
      },
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">
          Sign In
        </Title>
        <Text className="text-[#A74E2B]">
          Welcome back to HotelPro Dashboard
        </Text>

        <CustomForm form={loginForm} onFinish={onFinish} />

        <div className="text-center mt-4 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#C76A34] font-medium">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
