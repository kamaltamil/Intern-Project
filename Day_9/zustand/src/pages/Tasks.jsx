import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Card, Tag, Space, Row, Col, Typography, Radio, Empty, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, FlagOutlined } from '@ant-design/icons';
import { useTaskStore } from '../stores/useTaskStore';
import { useAuthStore } from '../stores/useAuthStore';
import CustomButton from '../components/CustomButton/CustomButton';

const { Title, Text } = Typography;
const { Option } = Select;

const Tasks = () => {
  const [form] = Form.useForm();
  const { items, loading, fetchTasks, addTask, updateTaskStatus } = useTaskStore();
  const { user } = useAuthStore();
  
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
    }
  }, [fetchTasks, user]);

  const handleAddTask = async (values) => {
    try {
      await addTask({ ...values, userId: user.id });
      form.resetFields(['title']);
      message.success('Task created successfully.');
    } catch (error) {
      message.error('Failed to save task.');
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      message.success(`Task marked as ${newStatus}`);
    } catch (error) {
      message.error('Failed to update status.');
    }
  };

  const renderStatusTag = (status) => {
    if (status === 'Completed') return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
    return <Tag color="processing" icon={<SyncOutlined spin />}>In Progress</Tag>;
  };

  const renderPriorityTag = (priority) => {
    const colors = { High: 'red', Normal: 'blue', Low: 'default' };
    return <Tag color={colors[priority] || 'default'} icon={<FlagOutlined />}>{priority}</Tag>;
  };

  const filteredTasks = items.filter(task => filterStatus === 'All' || task.status === filterStatus);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Workspace Tasks</Title>
      
      <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Form form={form} layout="inline" onFinish={handleAddTask} initialValues={{ status: 'In Progress', priority: 'Normal' }} style={{ width: '100%', gap: '12px 0' }}>
          <Form.Item name="title" rules={[{ required: true, message: 'Please input task title!' }]} style={{ flex: 1, minWidth: 200, marginRight: 12 }}>
            <Input placeholder="What needs to be done?" prefix={<ClockCircleOutlined style={{ color: '#bfbfbf' }} />} size="large" />
          </Form.Item>
          
          <Form.Item name="priority" style={{ width: 120, marginRight: 12 }}>
            <Select size="large">
              <Option value="High">High</Option>
              <Option value="Normal">Normal</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" style={{ width: 140, marginRight: 12 }}>
            <Select size="large">
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginRight: 0 }}>
            <CustomButton variant="accent" htmlType="submit" icon={<PlusOutlined />} size="large" loading={loading}>
              Add
            </CustomButton>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Radio.Group value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} buttonStyle="solid">
          <Radio.Button value="All">All ({items.length})</Radio.Button>
          <Radio.Button value="In Progress">In Progress ({items.filter(t => t.status === 'In Progress').length})</Radio.Button>
          <Radio.Button value="Completed">Completed ({items.filter(t => t.status === 'Completed').length})</Radio.Button>
        </Radio.Group>
        <Text type="secondary">Showing {filteredTasks.length} tasks</Text>
      </div>

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
                      {renderPriorityTag(task.priority)}
                      <Text delete={task.status === 'Completed'} style={{ fontSize: 16, fontWeight: 500 }}>
                        {task.title}
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      {task.status === 'In Progress' ? (
                        <CustomButton variant="accent" size="small" onClick={() => handleStatusUpdate(task.id, 'Completed')}>
                          Mark Complete
                        </CustomButton>
                      ) : (
                        <CustomButton variant="secondary" size="small" onClick={() => handleStatusUpdate(task.id, 'In Progress')}>
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