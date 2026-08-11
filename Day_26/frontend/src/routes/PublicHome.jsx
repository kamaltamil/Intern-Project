import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";

function PublicHome() {
  const { token, role } = useSelector((state) => state.auth);

  if (!token) {
    return <LandingPage />;
  }

  if (role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "Manager") {
    return <Navigate to="/manager" replace />;
  }

  return <Navigate to="/member" replace />;
}

export default PublicHome;
