import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Modal, Input, Typography, Button, Select, message, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import KanbanColumn from './KanbanColumn';
import { getTasks } from '../../api/tasksApi';
import { getColumns, createColumn } from '../../api/columnsApi';
import './KanbanBoard.css';

const { Text } = Typography;

const PRESET_COLORS = [
  { label: 'Sky Blue',  value: '#49C4E5' },
  { label: 'Purple',   value: '#8471F2' },
  { label: 'Green',    value: '#67E2AE' },
  { label: 'Orange',   value: '#F2994A' },
  { label: 'Red',      value: '#EB5757' },
  { label: 'Teal',     value: '#219653' },
];

const KanbanBoard = () => {
  const qc            = useQueryClient();
  const activeBoardId = useSelector((s) => s.ui.activeBoardId);

  const [colModalOpen, setColModalOpen] = useState(false);
  const [colName,      setColName]      = useState('');
  const [colColor,     setColColor]     = useState('#49C4E5');

  /* ── Columns ── */
  const {
    data: columns = [],
    isLoading: colsLoading,
  } = useQuery({
    queryKey: ['columns', activeBoardId],
    queryFn:  () => getColumns(activeBoardId),
    enabled:  !!activeBoardId,
  });

  /* ── Tasks ── */
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError,
  } = useQuery({
    queryKey: ['tasks', activeBoardId],
    queryFn:  () => getTasks(activeBoardId),
    enabled:  !!activeBoardId,
  });

  /* ── Create column ── */
  const createColMutation = useMutation({
    mutationFn: createColumn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['columns', activeBoardId] });
      message.success('Column added!');
      setColModalOpen(false);
      setColName('');
      setColColor('#49C4E5');
    },
    onError: () => message.error('Failed to add column.'),
  });

  const handleAddColumn = () => {
    if (!colName.trim()) { message.warning("Column name can't be empty"); return; }
    createColMutation.mutate({
      boardId: activeBoardId,
      name:    colName.trim(),
      color:   colColor,
      order:   columns.length,
    });
  };

  const isLoading = colsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="board-center">
        <Spin size="large" tip="Loading board…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="board-center">
        <Empty
          description={
            <Text type="secondary">
              Could not load tasks. Is json-server running on port 3001?
            </Text>
          }
        />
      </div>
    );
  }

  if (!activeBoardId) {
    return (
      <div className="board-center">
        <Empty description={<Text type="secondary">Select or create a board to get started.</Text>} />
      </div>
    );
  }

  const getColumnTasks = (colName) =>
    tasks.filter((t) => t.status === colName);

  return (
    <>
      <div className="board-scroll">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getColumnTasks(col.name)}
            allColumns={columns}
          />
        ))}

        {/* Add new column */}
        <div className="board-add-col">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            className="board-add-col-btn"
            onClick={() => setColModalOpen(true)}
            block
          >
            New Column
          </Button>
        </div>
      </div>

      {/* Add Column Modal */}
      <Modal
        title="Add New Column"
        open={colModalOpen}
        onOk={handleAddColumn}
        onCancel={() => { setColModalOpen(false); setColName(''); }}
        okText="Add Column"
        confirmLoading={createColMutation.isPending}
        centered
        destroyOnClose
        okButtonProps={{ style: { borderRadius: 20 } }}
        cancelButtonProps={{ style: { borderRadius: 20 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              COLUMN NAME
            </Text>
            <Input
              style={{ marginTop: 8 }}
              placeholder="e.g. In Review"
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              onPressEnter={handleAddColumn}
              autoFocus
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              COLOUR
            </Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={colColor}
              onChange={setColColor}
              options={PRESET_COLORS.map((c) => ({
                value: c.value,
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.value, display: 'inline-block' }} />
                    {c.label}
                  </span>
                ),
              }))}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KanbanBoard;
