import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
// import Profile from "../pages/Profile"; // Import Profile directly since it's not lazy-loaded
const Profile = React.lazy(() => import("../pages/Profile"));

// Lazy-loaded pages — each page is split into a separate JS chunk
// and downloaded only when the user navigates to that route.
const Login = React.lazy(() => import("../pages/Login"));
const Register = React.lazy(() => import("../pages/Register"));
const TasksPage = React.lazy(() => import("../pages/Tasks"));
const Users = React.lazy(() => import("../pages/Users"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

// Shown while a lazy chunk is being downloaded
const PageLoader = (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
    <Spin size="large" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={PageLoader}>
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
    </Suspense>
  );
};

export default AppRoutes;
