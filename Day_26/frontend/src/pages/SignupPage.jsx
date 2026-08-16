import { Card, Typography, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useState } from "react";
import { signupUser } from "../api/queries";
import CustomForm from "../components/CustomForm";

const { Title, Text } = Typography;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function SignupPage() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const signupMutation = useMutation({
    mutationFn: signupUser,
    retry: 0,
    onSuccess: () => {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      message.success("Account created successfully! Please log in.");
      navigate("/login");
    },
    onError: (error) => {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      message.error(
        error?.response?.data?.message || "Unable to create account",
      );
    },
  });

  const onFinish = (values) => {
    if (!recaptchaToken) {
      message.error("Please complete the reCAPTCHA verification");
      return;
    }

    signupMutation.mutate({
      name: values.name,
      email: values.email,
      username: values.username,
      password: values.password,
      recaptchaToken,
    });
  };

  if (token) {
    return <Navigate to="/" replace />;
  }

  const signupForm = [
    {
      type: "input",
      label: "Full Name",
      name: "name",
      placeholder: "Enter your name",
      rules: [
        { required: true, message: "Please enter your full name" },
        {
          pattern: String.raw`^([a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+)$`,
          message: "Please enter full name (only alphabets)",
        },
      ],
    },
    {
      type: "input",
      label: "Email",
      name: "email",
      placeholder: "Enter your email",
      rules: [
        { required: true, message: "Please enter your email" },
        {
          type: "email",
          message: "Please enter a valid email",
        },
      ],
    },
    {
      type: "input",
      label: "Username",
      name: "username",
      placeholder: "Choose username",
      rules: [
        { required: true, message: "Please enter your username" },
        {
          pattern: "^[a-zA-Z0-9_]{3,16}$",
          message:
            "Please enter valid a username (3-16 characters, alphanumeric/underscores)",
        },
      ],
    },
    {
      type: "password",
      label: "Password",
      name: "password",
      placeholder: "Create password",
      rules: [
        { required: true, message: "Password is required" },
        {
          pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$`,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
        },
      ],
    },
    {
      key: "reCaptcha",
      render: () => (
        <div className="flex justify-center">
          <ReCAPTCHA
            size="normal"
            theme="light"
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
      label: "Sign Up",
      buttonProps: {
        type: "primary",
        htmlType: "submit",
        block: true,
        size: "large",
        loading: signupMutation.isPending,
        style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
      },
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">
          Create Account
        </Title>
        <Text className="text-[#A74E2B]">Join the HotelPro Admin Portal</Text>

        <CustomForm form={signupForm} onFinish={onFinish} />

        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C76A34] font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default SignupPage;
