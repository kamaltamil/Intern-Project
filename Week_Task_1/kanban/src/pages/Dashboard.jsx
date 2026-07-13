import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import KanbanBoard from '../components/Board/KanbanBoard';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <KanbanBoard />
    </DashboardLayout>
  );
};

export default Dashboard;
