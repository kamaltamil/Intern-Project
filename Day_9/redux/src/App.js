import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { customTheme } from './theme/theme';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import { logout, restoreSession } from './store/authSlice';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to='/login' replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { initializing } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const handleLogout = () => dispatch(logout());

  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider theme={customTheme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard/tasks' replace />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <DashboardLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to='tasks' replace />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='profile' element={<Profile />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;