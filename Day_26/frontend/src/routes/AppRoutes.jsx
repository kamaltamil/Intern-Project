import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const UsersManagementPage = lazy(() => import("../pages/UsersManagementPage"));
const RoleManagementPage = lazy(() => import("../pages/RoleManagementPage"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const ApprovalPage = lazy(() => import("../pages/ApprovalPage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const DashboardHome = lazy(() => import("./DashboardHome"));
const PublicHome = lazy(() => import("./PublicHome"));

const Loader = (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={Loader}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/" element={<PublicHome />} />

        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute resource="users" action="view"><UsersManagementPage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute resource="roles" action="view"><RoleManagementPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute resource="bookings" action="view"><BookingPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute resource="reports" action="view"><ReportsPage /></ProtectedRoute>} />
        <Route path="/approval" element={<ProtectedRoute resource="approval" action="view"><ApprovalPage /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
