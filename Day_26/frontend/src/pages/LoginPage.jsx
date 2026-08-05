import { Card, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { setAuth } from '../store/slices/authSlice';
import { loginUser } from '../api/queries';
import CustomForm from '../components/CustomForm';

const { Title, Text } = Typography;

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { user, token, refreshToken } = data || {};
      if (!user || !token) {
        message.error('Invalid login response from backend');
        return;
      }
      dispatch(setAuth({ user, token, refreshToken }));
      message.success('Login successful');
      navigate('/');
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Invalid credentials');
    },
  });

  const onFinish = (values) => {
    loginMutation.mutate({ identifier: values.email, password: values.password });
  };

  if (token) {
    return <Navigate to="/" replace />;
  }

  const loginForm = [
    {
      label: 'Email or Username',
      name: 'email',
      rules: [{ required: true, message: 'Email or username is required' }],
      placeholder: 'Enter your email or username',
    },
    {
      label: 'Password',
      name: 'password',
      rules: [{ required: true, message: 'Password is required' }],
      placeholder: 'Enter your password',
    },
    {
      type: 'submit',
      label: 'Sign In',
      buttonProps: {
        type: 'primary',
        htmlType: 'submit',
        block: true,
        size: 'large',
        loading: loginMutation.isLoading,
        style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
      },
    },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">Sign In</Title>
        <Text className="text-[#A74E2B]">Welcome back to HotelPro Dashboard</Text>

        <CustomForm form={loginForm} onFinish={onFinish} />
        
        <div className="text-center mt-4 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#C76A34] font-medium">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
