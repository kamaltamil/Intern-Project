import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { customTheme } from './theme/theme';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import { useAuthStore } from './stores/useAuthStore';
import API from './services/api';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('sessionToken');
      if (!token) { setLoading(false); return; }
      try {
        const res = await API.get(`/sessions?token=${token}`);
        setValid(res.data.length > 0);
      } catch { setValid(false); }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  return valid ? children : <Navigate to='/login' replace />;
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
          
          <Route path='*' element={
            <div style={{ padding: 24, textAlign: 'center' }}>
              <h2>404 - Page Not Found</h2>
              <a href='/dashboard'>Return to Dashboard</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;