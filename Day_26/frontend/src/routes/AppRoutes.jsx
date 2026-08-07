import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLoadRolePermissions } from '../utils/useLoadRolePermissions';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const LoginPage           = lazy(() => import('../pages/LoginPage'));
const SignupPage           = lazy(() => import('../pages/SignupPage'));
const AdminDashboardPage   = lazy(() => import('../pages/AdminDashboardPage'));
const ManagerDashboardPage = lazy(() => import('../pages/ManagerDashboardPage'));
const MemberDashboardPage  = lazy(() => import('../pages/MemberDashboardPage'));
const ProfilePage          = lazy(() => import('../pages/ProfilePage'));
const UsersManagementPage  = lazy(() => import('../pages/UsersManagementPage'));
const RoleManagementPage   = lazy(() => import('../pages/RoleManagementPage'));
const ProtectedRoute       = lazy(() => import('./ProtectedRoute'));
const BookingPage          = lazy(() => import('../pages/BookingPage'));

/** Renders the correct dashboard based on the user's role stored in Redux */
function DashboardHome() {
  const rawRole = useSelector((state) => state.auth.role);
  const role =
    typeof rawRole === 'string'
      ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
      : 'Member';

  if (role === 'Admin') return <AdminDashboardPage />;
  if (role === 'Manager') return <ManagerDashboardPage />;
  return <MemberDashboardPage />;
}

const PageLoader = (
  <div className="flex items-center justify-center min-h-screen">
    <Spin size="large" />
  </div>
);

/**
 * AppRoutes
 *
 * All protected routes use ONLY requiredPermission for access control.
 * allowedRoles has been removed — roles and their permissions are managed
 * entirely through the DB (seeded via seed.js, configurable by Admin).
 *
 * Admin always bypasses the permission check inside ProtectedRoute.
 */

function PermissionLoaderWrapper({ children }) {
  useLoadRolePermissions();
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={PageLoader}>
      <PermissionLoaderWrapper>
        <BrowserRouter>
        <Routes>
          {/* ── Public ───────────────────────────────────────── */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/signup"       element={<SignupPage />} />
          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center min-h-screen text-xl text-red-500">
                Unauthorized Access
              </div>
            }
          />

          {/* ── Dashboard (all logged-in users) ──────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'dashboard', action: 'view' }}>
                <DashboardHome />
              </ProtectedRoute>
            }
          />

          {/* ── Profile (all logged-in users) ────────────────── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'profile', action: 'view' }}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ── User Management ──────────────────────────────── */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'users', action: 'view' }}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />

          {/* ── Role Management ──────────────────────────────── */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'roles', action: 'view' }}>
                <RoleManagementPage />
              </ProtectedRoute>
            }
          />

          {/* ── Bookings ─────────────────────────────────────── */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'bookings', action: 'view' }}>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          {/* ── Reports ──────────────────────────────────────── */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'reports', action: 'view' }}>
                <div className="flex items-center justify-center min-h-screen text-xl text-[#C76A34]">
                  Reports - Coming Soon
                </div>
              </ProtectedRoute>
            }
          />

          {/* ── Booking Approval ─────────────────────────────── */}
          <Route
            path="/approval"
            element={
              <ProtectedRoute requiredPermission={{ resource: 'approval', action: 'view' }}>
                <div className="flex items-center justify-center min-h-screen text-xl text-[#C76A34]">
                  Booking Approval - Coming Soon
                </div>
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </PermissionLoaderWrapper>
    </Suspense>
  );
}

export default AppRoutes;
