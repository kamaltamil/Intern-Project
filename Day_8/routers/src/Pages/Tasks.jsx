import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Card, Tag, Space, Row, Col, Typography, Radio, Empty, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import api from '../api';
import CustomButton from '../Components/CustomButton/CustomButton';

const { Title, Text } = Typography;
const { Option } = Select;

const Tasks = () => {
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const currentUserId = localStorage.getItem('userId');

  // Fetch all tasks matching the logged-in user
  const fetchTasks = async () => {
    if (!currentUserId) return;
    try {
      const response = await api.get('/tasks', {
        params: { userId: currentUserId }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to sync tasks from server.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Form submission logic to add a new task
  const handleAddTask = async (values) => {
    try {
      const response = await api.post('/tasks', {
        userId: currentUserId,
        title: values.title,
        status: values.status // 'In Progress' or 'Completed'
      });
      setTasks([...tasks, response.data]);
      form.resetFields(['title']);
      message.success('Task created successfully.');
    } catch (error) {
      console.error('Error adding task:', error);
      message.error('Failed to save task.');
    }
  };

  // Change task status dynamically on the fly
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      message.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      message.error('Failed to update status.');
    }
  };

  // Render tag based on status string matching
  const renderStatusTag = (status) => {
    if (status === 'Completed') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
    }
    return <Tag color="processing" icon={<SyncOutlined spin />}>In Progress</Tag>;
  };

  // Filter tasks locally based on active view state
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'All') return true;
    return task.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Workspace Tasks</Title>
      
      {/* Top Creation Form Box Container */}
      <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Form form={form} layout="inline" onFinish={handleAddTask} initialValues={{ status: 'In Progress' }} style={{ width: '100%' }}>
          <Form.Item name="title" rules={[{ required: true, message: 'Please input task title!' }]} style={{ flex: 1, marginRight: 12 }}>
            <Input placeholder="What needs to be done?" prefix={<ClockCircleOutlined style={{ color: '#bfbfbf' }} />} size="large" />
          </Form.Item>
          <Form.Item name="status" style={{ width: 140, marginRight: 12 }}>
            <Select size="large">
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginRight: 0 }}>
            <CustomButton variant="primary" htmlType="submit" icon={<PlusOutlined />} size="large">
              Add Task
            </CustomButton>
          </Form.Item>
        </Form>
      </Card>

      {/* Filter Segment Selector Layout */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Radio.Group value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} buttonStyle="solid">
          <Radio.Button value="All">All ({tasks.length})</Radio.Button>
          <Radio.Button value="In Progress">In Progress ({tasks.filter(t => t.status === 'In Progress').length})</Radio.Button>
          <Radio.Button value="Completed">Completed ({tasks.filter(t => t.status === 'Completed').length})</Radio.Button>
        </Radio.Group>
        <Text type="secondary">Showing {filteredTasks.length} tasks</Text>
      </div>

      {/* Tasks Render List Grid */}
      {filteredTasks.length === 0 ? (
        <Empty description="No tasks found matching this criteria." style={{ marginTop: 40 }} />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTasks.map(task => (
            <Col span={24} key={task.id}>
              <Card hoverable styles={{ body: { padding: '16px 24px' } }} style={{ borderRadius: 8 }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size="middle">
                      {renderStatusTag(task.status)}
                      <Text delete={task.status === 'Completed'} style={{ fontSize: 16, fontWeight: 500 }}>
                        {task.title}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      {task.status === 'In Progress' ? (
                        <CustomButton variant="primary" size="small" onClick={() => handleStatusUpdate(task.id, 'Completed')}>
                          Mark Complete
                        </CustomButton>
                      ) : (
                        <CustomButton variant="default" size="small" onClick={() => handleStatusUpdate(task.id, 'In Progress')}>
                          Reopen Task
                        </CustomButton>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Tasks;
