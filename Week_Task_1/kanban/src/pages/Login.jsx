import React, { useState } from 'react';
import { Form, Input, Checkbox, Card, Button, Typography, message, Space, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { loginUser } from '../api/authApi';
import { loginSuccess } from '../store/slices/authSlice';
import './Login.css';

const { Title, Paragraph, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const user = await loginUser({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      dispatch(loginSuccess(user));
      message.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      message.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decorations */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <Card className="login-card" bordered={false}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-dots">
            <span className="lld-1" />
            <span className="lld-2" />
            <span className="lld-3" />
          </div>
          <Text strong style={{ fontSize: 24, letterSpacing: 4 }} className="login-logo-text">
            kanban
          </Text>
        </div>

        <Title level={3} style={{ margin: 0, textAlign: 'center', fontWeight: 800 }}>
          Welcome back
        </Title>
        <Paragraph style={{ textAlign: 'center', marginTop: 4, marginBottom: 28, color: 'var(--text-secondary)' }}>
          Sign in to your workspace
        </Paragraph>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label={<Text strong>Email</Text>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-secondary)' }} />}
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>Password</Text>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />}
              placeholder="••••••••"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <div className="login-form-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox><Text type="secondary">Remember me</Text></Checkbox>
            </Form.Item>
            <Button type="link" size="small" style={{ padding: 0, height: 'auto', fontWeight: 600 }}>
              Forgot password?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ borderRadius: 20, height: 46, fontWeight: 700 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Demo credentials hint */}
        <div className="login-demo-accounts">
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            Demo accounts
          </Text>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div className="login-demo-row">
              <Avatar style={{ backgroundColor: 'var(--accent)' }} size="small">
                JD
              </Avatar>
              <div className="login-demo-text">
                <Text strong style={{ fontSize: 12, display: 'block' }}>john@kanban.com</Text>
                <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>password123</Text>
              </div>
            </div>
            <div className="login-demo-row">
              <Avatar style={{ backgroundColor: 'var(--color-doing)' }} size="small">
                DU
              </Avatar>
              <div className="login-demo-text">
                <Text strong style={{ fontSize: 12, display: 'block' }}>demo@kanban.com</Text>
                <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>demo1234</Text>
              </div>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;
