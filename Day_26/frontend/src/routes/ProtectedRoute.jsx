import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token } = useSelector((state) => state.auth);
  const rawRole = useSelector((state) => state.auth.role);
  const role = typeof rawRole === 'string'
    ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
    : 'Member';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
