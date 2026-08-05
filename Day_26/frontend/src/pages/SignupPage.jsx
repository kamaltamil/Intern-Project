import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

function SignupPage() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await api.post('/users', {
        name: values.name,
        email: values.email,
        username: values.username,
        password: values.password,
      });
      const createdUser = response.data?.user || response.data;

      if (createdUser) {
        message.success('Account created successfully! Please log in.');
        navigate('/login');
        return;
      }

      message.error('User creation response was empty');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md border border-[#ECE6DF]">
        <Title level={3} className="!text-[#2E2A27]">Create Account</Title>
        <Text className="text-[#A74E2B]">Join the HotelPro Admin Portal</Text>

        <Form layout="vertical" className="mt-6" onFinish={onFinish}>
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="Enter your full name" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input placeholder="Choose a username" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Create a password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
          >
            Sign Up
          </Button>
        </Form>

        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C76A34] font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default SignupPage;
