import React, { lazy, Suspense } from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import { Spin } from "antd";

/* -------------------------------------------------------------------------- */
/*                                Components                                  */
/* -------------------------------------------------------------------------- */

import DashboardLayout from "../components/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

/* -------------------------------------------------------------------------- */
/*                                Public Pages                                */
/* -------------------------------------------------------------------------- */

const LoginPage = lazy(() => import("../pages/LoginPage"));

const SignupPage = lazy(() => import("../pages/SignupPage"));

const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));

const PublicHome = lazy(() => import("./PublicHome"));

/* -------------------------------------------------------------------------- */
/*                              Dashboard Pages                               */
/* -------------------------------------------------------------------------- */

const DashboardHome = lazy(() => import("./DashboardHome"));

const ProfilePage = lazy(() => import("../pages/ProfilePage"));

const UsersManagementPage = lazy(() => import("../pages/UsersManagementPage"));

const RoleManagementPage = lazy(() => import("../pages/RoleManagementPage"));

const BookingPage = lazy(() => import("../pages/BookingPage"));

const RoomManagementPage = lazy(() => import("../pages/RoomManagementPage"));

const ReportsPage = lazy(() => import("../pages/ReportsPage"));

const ApprovalPage = lazy(() => import("../pages/ApprovalPage"));


/* -------------------------------------------------------------------------- */
/*                                  Loader                                    */
/* -------------------------------------------------------------------------- */

const Loader = (
  <div className="flex min-h-screen items-center justify-center">
    <Spin size="large" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                App Routes                                  */
/* -------------------------------------------------------------------------- */

function AppRoutes() {
  return (
    <Suspense fallback={Loader}>
      <Routes>
        {/* ================================================================== */}
        {/* Public Routes                                                      */}
        {/* ================================================================== */}

        <Route path="/" element={<PublicHome />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ================================================================== */}
        {/* Authentication Protection                                          */}
        {/* ================================================================== */}

        <Route element={<ProtectedRoute />}>
          {/* ================================================================ */}
          {/* Dashboard Layout - Mounted Once                                  */}
          {/* ================================================================ */}

          <Route element={<DashboardLayout />}>
            {/* -------------------------------------------------------------- */}
            {/* Dashboard                                                       */}
            {/* -------------------------------------------------------------- */}

            <Route path="/dashboard" element={<DashboardHome />} />

            {/* -------------------------------------------------------------- */}
            {/* Profile                                                         */}
            {/* -------------------------------------------------------------- */}

            <Route path="/profile" element={<ProfilePage />} />

            {/* -------------------------------------------------------------- */}
            {/* Users                                                           */}
            {/* -------------------------------------------------------------- */}

            <Route element={<ProtectedRoute resource="users" action="view" />}>
              <Route path="/users" element={<UsersManagementPage />} />
            </Route>

            {/* -------------------------------------------------------------- */}
            {/* Roles                                                           */}
            {/* -------------------------------------------------------------- */}

            <Route element={<ProtectedRoute resource="roles" action="view" />}>
              <Route path="/roles" element={<RoleManagementPage />} />
            </Route>

            {/* -------------------------------------------------------------- */}
            {/* Bookings                                                        */}
            {/* -------------------------------------------------------------- */}

            <Route
              element={<ProtectedRoute resource="bookings" action="view" />}
            >
              <Route path="/bookings" element={<BookingPage />} />
            </Route>

            {/* -------------------------------------------------------------- */}
            {/* Rooms                                                           */}
            {/* -------------------------------------------------------------- */}

            <Route element={<ProtectedRoute resource="rooms" action="view" />}>
              <Route path="/rooms" element={<RoomManagementPage />} />
            </Route>

            {/* -------------------------------------------------------------- */}
            {/* Reports                                                         */}
            {/* -------------------------------------------------------------- */}

            <Route
              element={<ProtectedRoute resource="reports" action="view" />}
            >
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* -------------------------------------------------------------- */}
            {/* Approval                                                        */}
            {/* -------------------------------------------------------------- */}

            <Route
              element={<ProtectedRoute resource="approval" action="view" />}
            >
              <Route path="/approval" element={<ApprovalPage />} />
            </Route>
          </Route>
        </Route>

        {/* ================================================================== */}
        {/* Unknown Route                                                      */}
        {/* ================================================================== */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
