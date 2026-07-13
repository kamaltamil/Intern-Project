import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp, theme as antdTheme } from 'antd';
import store from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/* ── Applies data-theme to <html> for CSS variable switching ── */
const ThemeApplier = () => {
  const themeMode = useSelector((s) => s.ui.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);
  return null;
};

/* ── Redirects unauthenticated users to /login ── */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ── Redirects already-authed users away from /login ── */
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* ── Wraps entire app inside Provider so hooks work ── */
const AppContent = () => {
  const themeMode = useSelector((s) => s.ui.theme);
  const isDark = themeMode === 'dark';

  const antTheme = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#635FC7',
      colorLink: '#635FC7',
      borderRadius: 8,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      ...(isDark
        ? {
            colorBgContainer: '#2B2C37',
            colorBgElevated: '#2B2C37',
            colorBgBase: '#20212C',
            colorBgLayout: '#20212C',
            colorBorder: '#3E3F4E',
            colorText: '#FFFFFF',
            colorTextSecondary: '#828FA3',
          }
        : {
            colorBgContainer: '#FFFFFF',
            colorBgElevated: '#FFFFFF',
            colorBgBase: '#F4F7FD',
            colorBgLayout: '#F4F7FD',
            colorBorder: '#E4EBFA',
            colorText: '#000112',
            colorTextSecondary: '#828FA3',
          }),
    },
  };

  return (
    <ConfigProvider theme={antTheme}>
      <AntApp>
        <ThemeApplier />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
