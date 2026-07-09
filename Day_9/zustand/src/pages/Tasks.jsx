import React from 'react';
import { Form, Input, Button, Select, Alert, List } from 'antd';
import { useTaskStore } from '../stores/useTaskStore'; // Or Redux hooks

const { Option } = Select;
const ENABLE_PRIORITY = process.env.REACT_APP_ENABLE_TASK_PRIORITY === 'true';

const Tasks = () => {
  const { items, loading, error, addTask } = useTaskStore();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    await addTask(values);
    form.resetFields();
  };

  return (
    <div>
      <h2>Manage Tasks</h2>
      {error && <Alert message={error} type='error' showIcon style={{ marginBottom: 16 }} />}
      
      <Form form={form} layout='inline' onFinish={onFinish} style={{ marginBottom: 24 }}>
        <Form.Item name='title' rules={[{ required: true, min: 3, message: 'Minimum 3 characters' }]}>
          <Input placeholder='New Task Title' />
        </Form.Item>
        
        {ENABLE_PRIORITY && (
          <Form.Item name='priority' initialValue='Low'>
            <Select style={{ width: 120 }}>
              <Option value='Low'>Low</Option>
              <Option value='Medium'>Medium</Option>
              <Option value='High'>High</Option>
            </Select>
          </Form.Item>
        )}
        
        <Form.Item>
          <Button type='primary' htmlType='submit' loading={loading}>Add Task</Button>
        </Form.Item>
      </Form>

      <List
        bordered
        dataSource={items}
        renderItem={(item) => (
          <List.Item>
            {item.title} {ENABLE_PRIORITY && `- [${item.priority}]`}
          </List.Item>
        )}
      />
    </div>
  );
};

export default Tasks;