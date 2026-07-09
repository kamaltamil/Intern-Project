import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { customTheme } from './theme/theme';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile'; // <-- IMPORT ADDED HERE
import { logout } from './store/authSlice'; 
import API from './services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Use a simple boolean check
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return children;
};

const App = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

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
            {/* <-- ROUTE UPDATED HERE --> */}
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