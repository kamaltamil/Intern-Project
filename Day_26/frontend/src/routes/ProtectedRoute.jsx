import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

/**
 * ProtectedRoute — pure permission-based access control.
 *
 * Props:
 *  - requiredPermission: { resource: string, action: 'view'|'create'|'update'|'delete' }
 *                        Optional. If omitted, any logged-in user can access the route.
 */
function ProtectedRoute({ children, requiredPermission }) {
  const { token, role, rolePermissions, permissionsLoaded } = useSelector((state) => state.auth);

  const normalizedRole =
    typeof role === 'string'
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : null;

  // 1. Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin always bypasses permission checks
  if (normalizedRole === 'Admin') {
    return children;
  }

  // 3. Waiting for permissions to load from backend
  if (!permissionsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // 4. Permission check for non-Admin roles
  if (requiredPermission) {
    const { resource, action = 'view' } = requiredPermission;
    const permDoc = (rolePermissions || []).find(
      (p) => p.resource?.toLowerCase() === resource.toLowerCase()
    );
    const hasPermission = permDoc?.action?.[action] === true;

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
