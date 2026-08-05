import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ManagerDashboardPage from '../pages/ManagerDashboardPage';
import MemberDashboardPage from '../pages/MemberDashboardPage';
import ProfilePage from '../pages/ProfilePage';
import UsersManagementPage from '../pages/UsersManagementPage';
import RoleManagementPage from '../pages/RoleManagementPage';
import ProtectedRoute from './ProtectedRoute';
import BookingPage from '../pages/BookingPage';

function DashboardHome() {
  const { role } = useSelector((state) => state.auth);
  if (role === 'Admin') return <AdminDashboardPage />;
  if (role === 'Manager') return <ManagerDashboardPage />;
  return <MemberDashboardPage />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<div className="flex items-center justify-center min-h-screen text-xl text-red-500">Unauthorized Access</div>} />

        {/* Protected routes - all roles */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Member']}>
              <DashboardHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Member']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <RoleManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes - can be built out later */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Member']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <div className="flex items-center justify-center min-h-screen text-xl text-[#C76A34]">Reports - Coming Soon</div>
            </ProtectedRoute>
          }
        />


        <Route
          path="/approval"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <div className="flex items-center justify-center min-h-screen text-xl text-[#C76A34]">Booking Approval - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
