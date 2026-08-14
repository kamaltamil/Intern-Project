import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import DashboardLayout from "../components/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));
const PublicHome = lazy(() => import("./PublicHome"));
const DashboardHome = lazy(() => import("./DashboardHome"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const UsersManagementPage = lazy(() => import("../pages/UsersManagementPage"));
const RoleManagementPage = lazy(() => import("../pages/RoleManagementPage"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const RoomManagementPage = lazy(() => import("../pages/RoomManagementPage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const ApprovalPage = lazy(() => import("../pages/ApprovalPage"));

// Displays a common loading state while a lazy-loaded route component is fetched.
const Loader = (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

// Defines public routes and the protected dashboard routes used by the application.
function AppRoutes() {
  return (
    <Suspense fallback={Loader}>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute resource="dashboard" action="view" />}>
              <Route path="/dashboard" element={<DashboardHome />} />
            </Route>

            <Route element={<ProtectedRoute resource="profile" action="view" />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute resource="users" action="view" />}>
              <Route path="/users" element={<UsersManagementPage />} />
            </Route>

            <Route element={<ProtectedRoute resource="roles" action="view" />}>
              <Route path="/roles" element={<RoleManagementPage />} />
            </Route>

            <Route element={<ProtectedRoute resource="bookings" action="view" />}>
              <Route path="/bookings" element={<BookingPage />} />
            </Route>

            <Route element={<ProtectedRoute resource="rooms" action="view" />}>
              <Route path="/rooms" element={<RoomManagementPage />} />
            </Route>

            <Route element={<ProtectedRoute resource="reports" action="view" />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute resource="approval" action="view" />}>
              <Route path="/approval" element={<ApprovalPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
