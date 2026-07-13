import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Typography, message, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { createTask } from '../../api/tasksApi';
import { getColumns } from '../../api/columnsApi';

const { TextArea } = Input;
const { Text } = Typography;

const AddTaskModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [subtasks, setSubtasks] = useState([{ id: Date.now(), title: '' }]);
  const queryClient = useQueryClient();
  const activeBoardId = useSelector((state) => state.ui.activeBoardId);

  // Fetch columns dynamically for status options
  const { data: columns = [] } = useQuery({
    queryKey: ['columns', activeBoardId],
    queryFn: () => getColumns(activeBoardId),
    enabled: !!activeBoardId && open,
  });

  const statusOptions = columns.map((col) => ({
    value: col.name,
    label: col.name,
  }));

  // Sync initial status selection with the first column when columns load
  useEffect(() => {
    if (columns.length > 0 && open) {
      form.setFieldsValue({ status: columns[0].name });
    }
  }, [columns, open, form]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeBoardId] });
      message.success('Task created successfully!');
      handleClose();
    },
    onError: () => {
      message.error('Failed to create task.');
    },
  });

  const handleClose = () => {
    form.resetFields();
    setSubtasks([{ id: Date.now(), title: '' }]);
    onClose();
  };

  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { id: Date.now(), title: '' }]);
  };

  const handleRemoveSubtask = (id) => {
    if (subtasks.length === 1) {
      setSubtasks([{ id: Date.now(), title: '' }]);
      return;
    }
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubtaskChange = (id, value) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s))
    );
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const validSubtasks = subtasks
          .filter((s) => s.title.trim())
          .map((s, index) => ({
            id: `s-${Date.now()}-${index}`,
            title: s.title.trim(),
            completed: false,
          }));

        const newTask = {
          boardId: activeBoardId,
          title: values.title.trim(),
          description: values.description || '',
          status: values.status,
          subtasks: validSubtasks,
        };

        createMutation.mutate(newTask);
      })
      .catch(() => {});
  };

  return (
    <Modal
      title="Add New Task"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okText="Create Task"
      confirmLoading={createMutation.isPending}
      width={480}
      centered
      destroyOnClose
      okButtonProps={{ style: { borderRadius: 20 } }}
      cancelButtonProps={{ style: { borderRadius: 20 } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ paddingTop: 12 }}
        requiredMark={false}
      >
        {/* Title */}
        <Form.Item
          label={<Text strong>Title</Text>}
          name="title"
          rules={[{ required: true, message: "Can't be empty" }]}
        >
          <Input placeholder="e.g. Take coffee break" />
        </Form.Item>

        {/* Description */}
        <Form.Item label={<Text strong>Description</Text>} name="description">
          <TextArea
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
            rows={4}
            style={{ resize: 'none' }}
          />
        </Form.Item>

        {/* Subtasks */}
        <Form.Item label={<Text strong>Subtasks</Text>}>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {subtasks.map((subtask) => (
              <Space key={subtask.id} style={{ display: 'flex', width: '100%' }} align="baseline">
                <Input
                  style={{ flex: 1, minWidth: 380 }}
                  placeholder="e.g. Make coffee"
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveSubtask(subtask.id)}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={handleAddSubtask}
              style={{ borderRadius: 20 }}
            >
              Add New Subtask
            </Button>
          </Space>
        </Form.Item>

        {/* Status */}
        <Form.Item
          label={<Text strong>Status</Text>}
          name="status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select
            placeholder="Select task column status"
            options={statusOptions}
            notFoundContent="Please add columns to this board first"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
