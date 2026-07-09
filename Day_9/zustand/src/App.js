import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { customTheme } from './theme/theme';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import { useAuthStore } from './stores/useAuthStore';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const App = () => {
  const { logout } = useAuthStore();

  return (
    <ConfigProvider theme={customTheme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard/tasks' replace />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <DashboardLayout onLogout={logout} />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to='tasks' replace />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='profile' element={<Profile />} />
          </Route>
          <Route path='*' element={ <NotFound /> } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;