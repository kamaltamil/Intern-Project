import React from 'react';
import { Flex, Form, Input, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import api from '../api'; // Correct import path based on your folder tree
import CustomButton from '../Components/CustomButton/CustomButton';

const { Title, Text } = Typography;

export const Login = () => {
  const [form] = Form.useForm();

  const handleLoginSubmit = async (values) => {
    try {
      const response = await api.get('/users', {
        params: {
          email: values.email,
          password: values.password
        }
      });

      const matchedUsers = response.data;

      if (matchedUsers.length > 0) {
        const user = matchedUsers[0];
        
        const mockToken = 'session_' + Math.random().toString(36).substring(2, 11);

        await api.post('/sessions', {
          id: mockToken,
          userId: user.id
        });

        localStorage.setItem('sessionToken', mockToken);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);

        message.success(`Welcome back, ${user.name}!`);

        window.location.href = '/dashboard/tasks'; 
      } else {
        message.error('Invalid email structure or incorrect account password.');
      }
    } catch (error) {
      console.error('Authentication process failed:', error);
      message.error('Database connectivity error. Check if json-server is up.');
    }
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: '85vh', width: '100%' }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>Welcome Back</Title>
          <Text type="secondary">Please enter your account details to log in</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          size="large"
          onFinish={handleLoginSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please provide an email address' },
              { type: 'email', message: 'Please enter a valid format email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="alex@example.com" 
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please provide your account password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="••••••••" 
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <CustomButton variant="primary" htmlType="submit" style={{ width: '100%' }}>
              Sign In
            </CustomButton>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  );
};

export default Login;
