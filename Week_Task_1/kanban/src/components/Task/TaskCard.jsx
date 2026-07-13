import React, { useState } from 'react';
import { Card, Typography, Progress } from 'antd';
import TaskDetailsModal from './TaskDetailsModal';
import './TaskCard.css';

const { Text, Paragraph } = Typography;

const TaskCard = ({ task, allColumns }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const total     = task.subtasks?.length || 0;
  const completed = task.subtasks?.filter((s) => s.completed).length || 0;
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <Card
        className="task-card"
        hoverable
        size="small"
        onClick={() => setDetailsOpen(true)}
        styles={{ body: { padding: '16px' } }}
      >
        <Paragraph
          strong
          ellipsis={{ rows: 2 }}
          style={{ marginBottom: total > 0 ? 10 : 0, fontSize: 14 }}
        >
          {task.title}
        </Paragraph>

        {total > 0 && (
          <>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
              {completed} of {total} subtasks
            </Text>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor="var(--accent)"
              trailColor="var(--border)"
            />
          </>
        )}
      </Card>

      <TaskDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        task={task}
        allColumns={allColumns}
      />
    </>
  );
};

export default TaskCard;
