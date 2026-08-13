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

     console.log("SIGNUP onFinish called");

    if (!recaptchaToken) {
      message.error("Please complete the reCAPTCHA verification");
      return;
    }

    console.log(recaptchaToken)

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
      placeholder: "Enter your full name",
      rules: [
        { required: true }, { min: 5 }
      ],
    },
    {
      type: "input",
      label: "Email",
      name: "email",
      placeholder: "Enter your email",
      rules: [{ required: true }, { type: "email" }],
    },
    {
      type: "input",
      label: "Username",
      name: "username",
      placeholder: "Choose username",
      rules: [{ required: true }, { min: 5 }],
    },
    {
      type: "password",
      label: "Password",
      name: "password",
      placeholder: "Create password",
      rules: [{ required: true }, { min: 6 }],
    },
    {
      key: "reCaptcha",
      render:()=>(
        <div className="flex justify-center mt-4">
          <ReCAPTCHA
            size="normal"
            theme="light" 
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={setRecaptchaToken}
            onExpired={() => setRecaptchaToken(null)}
            onErrored={() => setRecaptchaToken(null)}
            />
        </div>)
          
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

        {/* <div className="flex justify-center mt-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={setRecaptchaToken}
            onExpired={() => setRecaptchaToken(null)}
            onErrored={() => setRecaptchaToken(null)}
          />
        </div> */}

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
