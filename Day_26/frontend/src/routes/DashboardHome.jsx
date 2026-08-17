import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchMyPermissions } from "../api/queries";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ManagerDashboardPage from "../pages/ManagerDashboardPage";
import MemberDashboardPage from "../pages/MemberDashboardPage";
import DynamicRoleDashboard from "../pages/DynamicRoleDashboard";

/**
 * DashboardHome
 *
 * Renders the correct dashboard page based on the user's role and database configuration.
 *
 * 1. If the role has a custom dashboardConfig defined in database → DynamicRoleDashboard
 * 2. If no custom config is configured:
 *    - Admin   → AdminDashboardPage (built-in default)
 *    - Manager → ManagerDashboardPage (built-in default)
 *    - Member  → MemberDashboardPage (built-in default)
 * 3. Custom role with no config → DynamicRoleDashboard (graceful empty state)
 */
function DashboardHome() {
  const { role, dashboardConfig: authDashboardConfig } = useSelector(
    (state) => state.auth
  );
  const roleName = typeof role === "object" ? role?.name : role || "Member";

  const { data: permData } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: fetchMyPermissions,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const dashboardConfig =
    permData?.dashboardConfig ||
    permData?.roleDoc?.dashboardConfig ||
    authDashboardConfig;

  const hasCustomConfig =
    dashboardConfig &&
    ((Array.isArray(dashboardConfig.stats) &&
      dashboardConfig.stats.length > 0) ||
      Boolean(dashboardConfig.banner?.title));

  if (hasCustomConfig) {
    return (
      <DynamicRoleDashboard
        dashboardConfig={dashboardConfig}
        roleName={roleName}
      />
    );
  }

  if (roleName === "Admin") {
    return <AdminDashboardPage />;
  }

  if (roleName === "Manager") {
    return <ManagerDashboardPage />;
  }

  if (roleName === "Member") {
    return <MemberDashboardPage />;
  }

  return (
    <DynamicRoleDashboard
      dashboardConfig={
        dashboardConfig || { stats: [], banner: { enabled: false } }
      }
      roleName={roleName}
    />
  );
}

export default DashboardHome;


