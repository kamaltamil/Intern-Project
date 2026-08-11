import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

function PublicHome() {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <LandingPage />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default PublicHome;