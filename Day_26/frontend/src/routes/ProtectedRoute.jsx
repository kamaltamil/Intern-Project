import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "../utils/hasPermission";

function ProtectedRoute({
  children,
  resource,
  action = "view",
}) {
  const { token, permissions } = useSelector((state) => state.auth);

  /* ---------------- No Login ---------------- */

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /* ---------- Routes without permission requirement ---------- */

  if (!resource) {
    return children;
  }

  /* --------------- Permission Check --------------- */

  const allowed = hasPermission(
    permissions,
    resource,
    action
  );

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;