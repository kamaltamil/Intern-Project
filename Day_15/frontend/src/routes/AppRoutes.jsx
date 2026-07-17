import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import TasksPage from "../pages/Tasks";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<ProtectedRoute allowedRoles={["Admin"]}><Users /></ProtectedRoute>} />
      </Route>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
