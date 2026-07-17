import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const API = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

function TaskManager() {
  const [auth, setAuth] = useState({ user: null, token: '' });
  const [mode, setMode] = useState('login');
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('taskAuth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setAuth(parsed);
      if (parsed.token) {
        loadTasks(parsed.token);
        if (parsed.user?.role === 'Admin') {
          loadUsers(parsed.token);
        }
      }
    }
  }, []);

  async function loadTasks(token) {
    try {
      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load tasks');
    }
  }

  async function loadUsers(token) {
    try {
      const res = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load users');
    }
  }

  async function handleAuth(values) {
    try {
      const url = mode === 'login' ? `${API}/auth/login` : `${API}/auth/register`;
      const res = await axios.post(url, values);
      const nextAuth = { user: res.data.user, token: res.data.token };
      setAuth(nextAuth);
      localStorage.setItem('taskAuth', JSON.stringify(nextAuth));
      setMessage(res.data.message || 'Success');
      loadTasks(res.data.token);
      if (res.data.user?.role === 'Admin') {
        loadUsers(res.data.token);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Auth failed');
    }
  }

  async function handleCreateTask(values) {
    try {
      const res = await axios.post(`${API}/tasks`, values, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prev) => [res.data, ...prev]);
      taskForm.resetFields();
      setMessage('Task created');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create task');
    }
  }

  async function handleUpdateTask(task) {
    try {
      const updated = { ...task, status: task.status === 'pending' ? 'completed' : 'pending' };
      const res = await axios.put(`${API}/tasks/${task.id}`, updated, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
      setMessage('Task updated');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  }

  async function handleDeleteTask(id) {
    try {
      await axios.delete(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setMessage('Task deleted');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed');
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      const res = await axios.put(`${API}/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsers((prev) => prev.map((item) => (item.id === res.data.user.id ? res.data.user : item)));
      setMessage('Role updated');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Role update failed');
    }
  }

  function logout() {
    localStorage.removeItem('taskAuth');
    setAuth({ user: null, token: '' });
    setTasks([]);
    setUsers([]);
    setMessage('Logged out');
  }

  if (!auth.user) {
    return (
      <div className="shell">
        <Card className="auth-card" bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={2} style={{ marginBottom: 0 }}>Task Manager</Title>
            <Text type="secondary">Manage your work with a clean role-based dashboard.</Text>
            <Space>
              <Button type={mode === 'login' ? 'primary' : 'default'} onClick={() => setMode('login')}>Login</Button>
              <Button type={mode === 'register' ? 'primary' : 'default'} onClick={() => setMode('register')}>Signup</Button>
            </Space>
            <Form form={form} layout="vertical" onFinish={handleAuth}>
              <Form.Item name="username" rules={[{ required: true, message: 'Please enter username' }]}> 
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}> 
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                {mode === 'login' ? 'Login' : 'Create account'}
              </Button>
            </Form>
            {message && <Alert type="info" message={message} />}
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div className="shell">
      <Row gutter={[16, 16]} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Task Dashboard</Title>
          <Text type="secondary">Welcome {auth.user.username} ({auth.user.role})</Text>
        </Col>
        <Col>
          <Button onClick={logout}>Logout</Button>
        </Col>
      </Row>

      <Card title="Create Task" style={{ marginBottom: 16 }}>
        <Form form={taskForm} layout="vertical" onFinish={handleCreateTask} initialValues={{ status: 'pending' }}>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="title" rules={[{ required: true, message: 'Please enter title' }]}> 
                <Input placeholder="Title" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="description" rules={[{ required: true, message: 'Please enter description' }]}> 
                <Input placeholder="Description" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="status">
                <Select>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Button type="primary" htmlType="submit" block>Add Task</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Your Tasks" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {tasks.map((task) => (
            <Card key={task.id} size="small" className="task-card">
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5} style={{ marginBottom: 4 }}>{task.title}</Title>
                  <Paragraph style={{ marginBottom: 4 }}>{task.description}</Paragraph>
                  <Tag color={task.status === 'completed' ? 'green' : 'blue'}>{task.status}</Tag>
                </Col>
                <Col>
                  <Space>
                    <Button size="small" onClick={() => handleUpdateTask(task)}>
                      {task.status === 'pending' ? 'Mark done' : 'Mark pending'}
                    </Button>
                    <Button size="small" danger onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </Card>

      {auth.user.role === 'Admin' && (
        <Card title="Admin Panel">
          <Space direction="vertical" style={{ width: '100%' }}>
            {users.map((user) => (
              <Card key={user.id} size="small">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{user.username}</Text>
                    <br />
                    <Text type="secondary">{user.role}</Text>
                  </Col>
                  <Col>
                    <Button size="small" onClick={() => handleRoleChange(user.id, user.role === 'Admin' ? 'User' : 'Admin')}>
                      Toggle role
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Card>
      )}

      {message && <Alert style={{ marginTop: 12 }} type="info" message={message} />}
    </div>
  );
}

export default TaskManager;
