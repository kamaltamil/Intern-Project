import { useSelector } from "react-redux";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ManagerDashboardPage from "../pages/ManagerDashboardPage";
import MemberDashboardPage from "../pages/MemberDashboardPage";

/**
 * DashboardHome
 *
 * Renders the correct dashboard page based on the user's role.
 *
 * Role is read from Redux state (set on login).
 *
 * Admin    → AdminDashboardPage
 * Manager  → ManagerDashboardPage
 * All else → MemberDashboardPage
 */
function DashboardHome() {
  const { role } = useSelector((state) => state.auth);

  if (role === "Admin") {
    return <AdminDashboardPage />;
  }

  if (role === "Manager") {
    return <ManagerDashboardPage />;
  }

  return <MemberDashboardPage />;
}

export default DashboardHome;
