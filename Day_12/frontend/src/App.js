import React from 'react';
import { Typography } from 'antd';
import FilterInput from './components/FilterInput';
import PostsTable from './components/PostsTable';

const { Title } = Typography;

export default function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>Global Post Dashboard</Title>
      <FilterInput />
      <PostsTable />
    </div>
  );
}