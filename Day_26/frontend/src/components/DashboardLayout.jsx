import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import RoleSidebar from './RoleSidebar';
import TopHeader from './TopHeader';

const { Content } = Layout;

function DashboardLayout({ children }) {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === 'dark';

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#0f0f23' : '#F8F4EE' }}>
      <RoleSidebar />
      <Layout style={{ background: isDark ? '#0f0f23' : '#F8F4EE' }}>
        <TopHeader />
        <Content
          style={{
            padding: 24,
            background: isDark ? '#0f0f23' : '#F8F4EE',
            color: isDark ? '#f0f0f0' : '#2E2A27',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
