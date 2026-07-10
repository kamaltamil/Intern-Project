import React, { Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Typography, Tabs, Spin } from 'antd';

// 1. Remove the standard imports and replace them with React.lazy()
const MovieList = lazy(() => import('./features/movies/MovieList'));
const Watchlist = lazy(() => import('./features/watchlist/Watchlist'));

const { Header, Content } = Layout;
const { Title } = Typography;

// 2. Create a fallback UI to show while the chunk is downloading
const FallbackSpinner = () => (
  <div style={{ textAlign: 'center', padding: '50px 0' }}>
    <Spin size="large" />
    <div style={{ marginTop: 10, color: '#888' }}>Loading component...</div>
  </div>
);

function App() {
  const watchlistCount = useSelector((state) => state.watchlist.items.length);

  // 3. Wrap your lazy components in <Suspense>
  const tabItems = [
    {
      key: '1',
      label: 'Search Movies',
      children: (
        <Suspense fallback={<FallbackSpinner />}>
          <MovieList />
        </Suspense>
      ),
    },
    {
      key: '2',
      label: `My Watchlist (${watchlistCount})`,
      children: (
        <Suspense fallback={<FallbackSpinner />}>
          <Watchlist />
        </Suspense>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 50px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>FlickFinder</Title>
      </Header>
      
      <Content style={{ padding: '40px 50px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 400 }}>
          <Tabs defaultActiveKey="1" items={tabItems} size="large" />
        </div>
      </Content>
    </Layout>
  );
}

export default App;