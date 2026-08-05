import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { setAuth } from '../store/slices/authSlice';

const { Title, Text } = Typography;

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await api.post('/users/login', {
        identifier: values.email,
        password: values.password,
      });

      const { user, token, refreshToken } = response.data || {};

      if (!user || !token) {
        message.error('Invalid login response from backend');
        return;
      }

      dispatch(
        setAuth({
          user,
          token,
          refreshToken,
        })
      );

      message.success('Login successful');
      navigate('/');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">Sign In</Title>
        <Text className="text-[#A74E2B]">Welcome back to HotelPro Dashboard</Text>

        <Form layout="vertical" className="mt-6" onFinish={onFinish}>
          <Form.Item
            label="Email or Username"
            name="email"
            rules={[{ required: true, message: 'Email or username is required' }]}
          >
            <Input placeholder="Enter your email or username" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
          >
            Sign In
          </Button>
        </Form>

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
