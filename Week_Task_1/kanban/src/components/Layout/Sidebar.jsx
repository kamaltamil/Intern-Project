import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Menu, Switch, Avatar, Button, Modal, Input, Tooltip,
  Typography, Drawer, message, Divider
} from 'antd';
import {
  AppstoreOutlined, PlusOutlined, EyeInvisibleOutlined,
  LogoutOutlined, MoonOutlined, SunOutlined, EyeOutlined,
} from '@ant-design/icons';
import { setActiveBoardId, setSidebarOpen, toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { getBoards, createBoard } from '../../api/boardsApi';
import { createColumn } from '../../api/columnsApi';
import './Sidebar.css';

const { Text, Title } = Typography;

/* ─── Sidebar content (shared between desktop aside & mobile Drawer) ─── */
const SidebarContent = ({ isMobile, onClose }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const activeBoardId = useSelector((s) => s.ui.activeBoardId);
  const themeMode     = useSelector((s) => s.ui.theme);
  const user          = useSelector((s) => s.auth.user);

  const [createOpen, setCreateOpen]   = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  /* ── Boards (user-specific) ── */
  const { data: boards = [], isFetching } = useQuery({
    queryKey: ['boards', user?.id],
    queryFn:  () => getBoards(user?.id),
    enabled:  !!user?.id,
  });

  // Validate that the active board exists in the user's boards list; if not, default to the first one.
  useEffect(() => {
    if (isFetching) return; // Skip during query refetching transitions (e.g. after adding a board)

    if (boards.length > 0) {
      const activeExists = boards.some((b) => String(b.id) === String(activeBoardId));
      if (!activeExists) {
        dispatch(setActiveBoardId(String(boards[0].id)));
      }
    } else {
      if (activeBoardId !== '') {
        dispatch(setActiveBoardId(''));
      }
    }
  }, [boards, activeBoardId, isFetching, dispatch]);

  const createMutation = useMutation({
    mutationFn: async (boardData) => {
      // 1. Create the board
      const newBoard = await createBoard(boardData);

      // 2. Add default columns: Todo, Doing, Done
      const defaultCols = [
        { boardId: newBoard.id, name: 'Todo', color: '#49C4E5', order: 0 },
        { boardId: newBoard.id, name: 'Doing', color: '#8471F2', order: 1 },
        { boardId: newBoard.id, name: 'Done', color: '#67E2AE', order: 2 }
      ];

      await Promise.all(defaultCols.map((col) => createColumn(col)));
      return newBoard;
    },
    onSuccess: (b) => {
      // Manually update local boards cache list immediately so the UI re-renders instantly
      qc.setQueryData(['boards', user?.id], (oldBoards = []) => {
        // Prevent duplicates if already present
        if (oldBoards.some(board => String(board.id) === String(b.id))) {
          return oldBoards;
        }
        return [...oldBoards, b];
      });

      qc.invalidateQueries({ queryKey: ['boards', user?.id] });
      qc.invalidateQueries({ queryKey: ['columns', b.id] });
      dispatch(setActiveBoardId(String(b.id)));
      message.success(`"${b.name}" created with default columns!`);
      setCreateOpen(false);
      setNewBoardName('');
    },
    onError: () => message.error('Failed to create board.'),
  });

  const handleCreate = () => {
    if (!newBoardName.trim()) { message.warning("Name can't be empty"); return; }
    createMutation.mutate({ name: newBoardName.trim(), userId: user?.id });
  };

  const handleBoardClick = ({ key }) => {
    dispatch(setActiveBoardId(key));
    if (isMobile && onClose) onClose();
  };


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    message.success('Logged out.');
  };

  const menuItems = [
    ...boards.map((b) => ({
      key:   b.id,
      icon:  <AppstoreOutlined />,
      label: b.name,
    })),
    {
      key:   '__create__',
      icon:  <PlusOutlined />,
      label: <Text style={{ color: 'var(--accent)', fontWeight: 700 }}>Create New Board</Text>,
    },
  ];

  return (
    <>
      {/* ── Logo ── */}
      <div className="sb-logo">
        <div className="sb-logo-dots">
          <span className="ld1" /><span className="ld2" /><span className="ld3" />
        </div>
        <Title level={4} style={{ margin: 0, letterSpacing: 4, fontWeight: 800 }}>kanban</Title>
      </div>

      <Text className="sb-board-count" type="secondary">
        ALL BOARDS ({boards.length})
      </Text>

      {/* ── Board menu ── */}
      <Menu
        mode="inline"
        selectedKeys={[activeBoardId]}
        items={menuItems}
        onClick={({ key }) => key === '__create__' ? setCreateOpen(true) : handleBoardClick({ key })}
        style={{ border: 'none', background: 'transparent', flex: 1 }}
      />

      <Divider style={{ margin: '8px 0', borderColor: 'var(--border)' }} />

      {/* ── Theme toggle ── */}
      <div className="sb-theme-row">
        <MoonOutlined style={{ fontSize: 16, color: themeMode === 'dark' ? 'var(--accent)' : 'var(--text-secondary)' }} />
        <Switch
          checked={themeMode === 'light'}
          onChange={() => dispatch(toggleTheme())}
          style={{ background: 'var(--accent)' }}
          size="small"
        />
        <SunOutlined style={{ fontSize: 16, color: themeMode === 'light' ? 'var(--accent)' : 'var(--text-secondary)' }} />
      </div>

      {/* ── User + logout ── */}
      {user && (
        <div className="sb-user-row">
          <Avatar size={32} style={{ background: 'var(--accent)', fontWeight: 700, fontSize: 11 }}>
            {user.avatar || user.name?.[0]}
          </Avatar>
          <div className="sb-user-info">
            <Text strong style={{ fontSize: 13, display: 'block' }}>{user.name}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{user.role}</Text>
          </div>
          <Tooltip title="Logout">
            <Button
              type="text"
              size="small"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            />
          </Tooltip>
        </div>
      )}

      {/* ── Hide sidebar (desktop only) ── */}
      {!isMobile && (
        <Button
          type="text"
          icon={<EyeInvisibleOutlined />}
          onClick={() => dispatch(setSidebarOpen(false))}
          className="sb-hide-btn"
          block
        >
          Hide Sidebar
        </Button>
      )}

      {/* ── Create Board Modal ── */}
      <Modal
        title="Create New Board"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); setNewBoardName(''); }}
        okText="Create Board"
        confirmLoading={createMutation.isPending}
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
            placeholder="e.g. Web Designer"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onPressEnter={handleCreate}
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
};

/* ─── Root Sidebar component ─── */
const Sidebar = () => {
  const dispatch    = useDispatch();
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

  return (
    <>
      {/* Desktop */}
      <aside className={`sb-desktop ${sidebarOpen ? 'sb-open' : 'sb-closed'}`}>
        <SidebarContent />
      </aside>

      {/* Show-sidebar pill (bottom-left, only when closed) */}
      {!sidebarOpen && (
        <Tooltip title="Show Sidebar" placement="right">
          <Button
            type="primary"
            shape="default"
            icon={<EyeOutlined />}
            className="sb-show-btn"
            onClick={() => dispatch(setSidebarOpen(true))}
          />
        </Tooltip>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        width={260}
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        className="kanban-drawer"
        styles={{ body: { background: 'var(--bg-secondary)', padding: 0 } }}
      >
        <SidebarContent isMobile onClose={() => dispatch(setSidebarOpen(false))} />
      </Drawer>
    </>
  );
};

export default Sidebar;
