import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "../utils/hasPermission";

// Protects authenticated routes and, when requested, checks the user's RBAC permission.
function ProtectedRoute({
  resource,
  action = "view",
}) {
  const { token, permissions } = useSelector(
    (state) => state.auth
  );

  /* ---------------- No Login ---------------- */

  if (!token) {
    return <Navigate to="/" replace />;
  }

  /* ---------------- Permission Check ---------------- */

  if (resource) {
    const allowed = hasPermission(
      permissions,
      resource,
      action
    );

    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;