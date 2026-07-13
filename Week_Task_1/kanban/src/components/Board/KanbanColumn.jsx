import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Typography, Popconfirm, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import TaskCard from '../Task/TaskCard';
import { deleteColumn } from '../../api/columnsApi';
import './KanbanColumn.css';

const { Text } = Typography;

const KanbanColumn = ({ column, tasks, allColumns }) => {
  const qc            = useQueryClient();
  const activeBoardId = useSelector((s) => s.ui.activeBoardId);

  const deleteMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['columns', activeBoardId] });
      message.success(`"${column.name}" column deleted.`);
    },
    onError: () => message.error('Failed to delete column.'),
  });

  return (
    <div className="kol">
      {/* Column header */}
      <div className="kol-header">
        <span className="kol-dot" style={{ background: column.color }} />
        <Text strong className="kol-title">
          {column.name.toUpperCase()} ({tasks.length})
        </Text>
        <Popconfirm
          title={`Delete "${column.name}"?`}
          description="Tasks in this column will remain but lose their status."
          onConfirm={() => deleteMutation.mutate(column.id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          placement="right"
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending}
            className="kol-del-btn"
          />
        </Popconfirm>
      </div>

      {/* Task cards */}
      <div className="kol-cards">
        {tasks.length === 0
          ? <div className="kol-empty" style={{ borderColor: column.color }} />
          : tasks.map((task) => (
              <TaskCard key={task.id} task={task} allColumns={allColumns} />
            ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
