import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button, Dropdown, Modal, Input,
  Typography, message, Tooltip,
} from 'antd';
import {
  PlusOutlined, EllipsisOutlined,
  EditOutlined, DeleteOutlined, MenuOutlined,
} from '@ant-design/icons';
import { setActiveBoardId, setSidebarOpen } from '../../store/slices/uiSlice';
import { getBoards, updateBoard, deleteBoard } from '../../api/boardsApi';
import axiosInstance from '../../api/axiosInstance';
import AddTaskModal from '../Task/AddTaskModal';
import './Header.css';

const { Text } = Typography;

const Header = () => {
  const dispatch      = useDispatch();
  const qc            = useQueryClient();
  const activeBoardId = useSelector((s) => s.ui.activeBoardId);
  const sidebarOpen   = useSelector((s) => s.ui.sidebarOpen);
  const user          = useSelector((s) => s.auth.user);

  const [addTaskOpen,  setAddTaskOpen]  = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [editName,     setEditName]     = useState('');

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn:  () => getBoards(user?.id),
    enabled:  !!user?.id,
  });

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  /* ── Edit board ── */
  const editMutation = useMutation({
    mutationFn: updateBoard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boards', user?.id] });
      message.success('Board updated!');
      setEditOpen(false);
    },
    onError: () => message.error('Update failed.'),
  });

  /* ── Delete board with cascade delete of tasks and columns ── */
  const deleteMutation = useMutation({
    mutationFn: async (boardId) => {
      // 1. Fetch child items belonging to this board
      const [columnsRes, tasksRes] = await Promise.all([
        axiosInstance.get(`/columns?boardId=${boardId}`),
        axiosInstance.get(`/tasks?boardId=${boardId}`)
      ]);

      const columnsToDelete = columnsRes.data || [];
      const tasksToDelete = tasksRes.data || [];

      // 2. Cascade delete tasks & columns in parallel
      await Promise.all([
        ...tasksToDelete.map((t) => axiosInstance.delete(`/tasks/${t.id}`)),
        ...columnsToDelete.map((c) => axiosInstance.delete(`/columns/${c.id}`)),
      ]);

      // 3. Delete parent board
      await deleteBoard(boardId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boards', user?.id] });
      qc.invalidateQueries({ queryKey: ['columns', activeBoardId] });
      qc.invalidateQueries({ queryKey: ['tasks', activeBoardId] });

      const remaining = boards.filter((b) => b.id !== activeBoardId);
      dispatch(setActiveBoardId(remaining[0]?.id ?? ''));
      message.success('Board and all associated tasks/columns deleted.');
    },
    onError: () => message.error('Delete failed.'),
  });

  const openEdit = () => {
    setEditName(activeBoard?.name || '');
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editName.trim()) { message.warning("Name can't be empty"); return; }
    editMutation.mutate({ id: activeBoardId, name: editName.trim() });
  };

  const handleDeleteClick = () => {
    if (!activeBoardId) return;
    Modal.confirm({
      title: 'Delete this board?',
      content: `Are you sure you want to permanently delete the board "${activeBoard?.name || ''}"? This will delete all columns and tasks inside it.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(activeBoardId);
        } catch {
          // Error message already shown by mutation
        }
      },
    });
  };

  const menuItems = [
    { key: 'edit',   icon: <EditOutlined />,   label: 'Edit Board',   onClick: openEdit },
    { key: 'delete', icon: <DeleteOutlined />, label: <span style={{ color: '#ff4d4f' }}>Delete Board</span>, danger: true, onClick: handleDeleteClick },
  ];

  return (
    <>
      <header className="hdr">
        {/* Left */}
        <div className="hdr-left">
          {/* Mobile hamburger */}
          {!sidebarOpen && (
            <Tooltip title="Open sidebar">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => dispatch(setSidebarOpen(true))}
                className="hdr-hamburger"
              />
            </Tooltip>
          )}
          <div className="hdr-logo-m">
            <div className="hm-dots">
              <span className="hmd1"/><span className="hmd2"/><span className="hmd3"/>
            </div>
            <Text strong style={{ fontSize: 20, letterSpacing: 3 }}>kanban</Text>
          </div>
          <Text strong className="hdr-board-name">
            {activeBoard?.name || 'Select a Board'}
          </Text>
        </div>

        {/* Right */}
        <div className="hdr-right">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            shape="round"
            onClick={() => setAddTaskOpen(true)}
            className="hdr-add-btn"
          >
            Add New Task
          </Button>

          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 22 }} />} />
          </Dropdown>
        </div>
      </header>

      {/* Edit Board Modal */}
      <Modal
        title="Edit Board"
        open={editOpen}
        onOk={handleEdit}
        onCancel={() => setEditOpen(false)}
        okText="Save Changes"
        confirmLoading={editMutation.isPending}
        centered
        destroyOnClose
        okButtonProps={{ style: { borderRadius: 20 } }}
        cancelButtonProps={{ style: { borderRadius: 20 } }}
      >
        <div style={{ paddingTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            BOARD NAME
          </Text>
          <Input
            style={{ marginTop: 8 }}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onPressEnter={handleEdit}
            autoFocus
          />
        </div>
      </Modal>

      {/* Add Task Modal */}
      <AddTaskModal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
    </>
  );
};

export default Header;
