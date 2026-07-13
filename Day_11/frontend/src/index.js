import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import themeConfig from './theme';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import ProductedRoute from './Components/ProductedRoute';
import Tasks from './Pages/Tasks';
import Profile from './Pages/Profile';
import NotFound from './Pages/NotFound';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={themeConfig}> 
      <BrowserRouter>
        <Routes>
          {/* Main App Layout containing sidebar structure */}
          <Route path="/" element={<App />}>
            {/* Auto redirect from root '/' straight to tasks if logged in */}
            <Route index element={<Navigate to="/dashboard/tasks" replace />} />
            
            {/* Protected dashboard layouts */}
            <Route path="dashboard" element={<ProductedRoute />}>
              <Route path="tasks" element={<Tasks />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          
          {/* Standalone Full-screen pages */}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);

reportWebVitals();
