import React, { useState, useEffect } from 'react';
import { Modal, Select, Checkbox, Dropdown, Typography, Button, Space, Form, Input, message } from 'antd';
import { EllipsisOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { updateTask, deleteTask } from '../../api/tasksApi';
import './TaskDetailsModal.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const TaskDetailsModal = ({ open, onClose, task, allColumns = [] }) => {
  const queryClient = useQueryClient();
  const activeBoardId = useSelector((state) => state.ui.activeBoardId);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [subtasks, setSubtasks] = useState([]);

  // Sync local subtask list when editing is triggered or when task prop updates
  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
    }
  }, [task, open]);

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeBoardId] });
      message.success('Task updated successfully');
      setIsEditing(false);
    },
    onError: () => message.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeBoardId] });
      message.success('Task deleted successfully');
      onClose();
    },
    onError: () => message.error('Delete failed'),
  });

  if (!task) return null;

  const statusOptions = allColumns.map((col) => ({
    value: col.name,
    label: col.name,
  }));

  // Toggle subtask checked status directly in list view
  const handleSubtaskToggle = (subtaskId, checked) => {
    const updatedSubtasks = (task.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: checked } : s
    );
    updateMutation.mutate({ id: task.id, subtasks: updatedSubtasks });
  };

  // Change task status directly in list view select dropdown
  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ id: task.id, status: newStatus });
  };

  // Edit form functions
  const startEdit = () => {
    editForm.setFieldsValue({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setSubtasks(task.subtasks || []);
    setIsEditing(true);
  };

  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { id: `s-${Date.now()}-${prev.length}`, title: '', completed: false }]);
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubtaskTitleChange = (id, title) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const handleSaveEdit = () => {
    editForm
      .validateFields()
      .then((values) => {
        const cleanedSubtasks = subtasks
          .filter((s) => s.title.trim())
          .map((s) => ({
            id: s.id,
            title: s.title.trim(),
            completed: s.completed || false,
          }));

        updateMutation.mutate({
          id: task.id,
          title: values.title.trim(),
          description: values.description || '',
          status: values.status,
          subtasks: cleanedSubtasks,
        });
      })
      .catch(() => {});
  };

  const completedCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;

  const handleDeleteConfirm = () => {
    Modal.confirm({
      title: 'Delete this task?',
      content: `Are you sure you want to permanently delete the task "${task.title}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(task.id);
        } catch {
          // Error message already shown by mutation
        }
      },
    });
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Task',
      onClick: startEdit,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: <span style={{ color: '#ff4d4f' }}>Delete Task</span>,
      danger: true,
      onClick: handleDeleteConfirm,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        setIsEditing(false);
        onClose();
      }}
      footer={
        isEditing ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsEditing(false)} style={{ borderRadius: 20 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveEdit}
              loading={updateMutation.isPending}
              style={{ borderRadius: 20 }}
            >
              Save Changes
            </Button>
          </Space>
        ) : null
      }
      width={480}
      centered
      destroyOnClose
      title={isEditing ? 'Edit Task' : null}
      closable={!isEditing}
    >
      {isEditing ? (
        <Form form={editForm} layout="vertical" requiredMark={false} style={{ paddingTop: 12 }}>
          {/* Title */}
          <Form.Item
            label={<Text strong>Title</Text>}
            name="title"
            rules={[{ required: true, message: "Can't be empty" }]}
          >
            <Input />
          </Form.Item>

          {/* Description */}
          <Form.Item label={<Text strong>Description</Text>} name="description">
            <TextArea rows={4} style={{ resize: 'none' }} />
          </Form.Item>

          {/* Subtasks editing list */}
          <Form.Item label={<Text strong>Subtasks</Text>}>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {subtasks.map((subtask) => (
                <Space key={subtask.id} style={{ display: 'flex', width: '100%' }} align="baseline">
                  <Input
                    style={{ flex: 1, minWidth: 380 }}
                    value={subtask.title}
                    onChange={(e) => handleSubtaskTitleChange(subtask.id, e.target.value)}
                    placeholder="e.g. Do research"
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
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      ) : (
        <div className="task-details">
          {/* Header */}
          <div className="task-details-header">
            <Title level={4} style={{ margin: 0, fontSize: 18 }}>
              {task.title}
            </Title>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button
                type="text"
                shape="circle"
                icon={<EllipsisOutlined style={{ fontSize: 24 }} />}
              />
            </Dropdown>
          </div>

          {/* Description */}
          {task.description ? (
            <Paragraph style={{ marginTop: 16, color: 'var(--text-secondary)' }}>
              {task.description}
            </Paragraph>
          ) : (
            <Paragraph style={{ marginTop: 16, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No description provided.
            </Paragraph>
          )}

          {/* Subtasks list view */}
          <div className="task-details-subtasks" style={{ marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 12 }}>
              Subtasks ({completedCount} of {totalCount})
            </Text>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="subtask-item">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={(e) => handleSubtaskToggle(subtask.id, e.target.checked)}
                    >
                      <span className={subtask.completed ? 'subtask-done' : ''}>
                        {subtask.title}
                      </span>
                    </Checkbox>
                  </div>
                ))
              ) : (
                <Text type="secondary" style={{ fontStyle: 'italic', fontSize: 13 }}>
                  No subtasks defined.
                </Text>
              )}
            </Space>
          </div>

          {/* Status dropdown */}
          <div className="task-details-status" style={{ marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8 }}>
              Current Status
            </Text>
            <Select
              value={task.status}
              options={statusOptions}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
              placeholder="Select column status"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailsModal;
