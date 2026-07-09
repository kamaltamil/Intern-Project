import React from 'react';
import { Form, Input, Button, Alert, Card } from 'antd';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const Login = () => {
  const { isAuthenticated, loading, error, login } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to='/dashboard/tasks' replace />;
  }

  const onFinish = (values) => {
    login(values); // store's login expects { email, password } — matches the form values
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title='Task Manager Login' style={{ width: 400 }}>
        {error && <Alert message={error} type='error' showIcon style={{ marginBottom: 16 }} />}
        <Form layout='vertical' onFinish={onFinish}>
          <Form.Item label='Email' name='email' rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder='admin@example.com' />
          </Form.Item>
          <Form.Item label='Password' name='password' rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
            <Input.Password placeholder='******' />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} block>
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;