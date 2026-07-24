import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard/tasks" replace />;
  }

  return children;
};

export default ProtectedRoute;