import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LandingPage from "../pages/LandingPage";

function PublicHome() {
  const { token } = useSelector((state) => state.auth);

  // Logged-in users cannot access the landing page
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Guest users can access the landing page
  return <LandingPage />;
}

export default PublicHome;