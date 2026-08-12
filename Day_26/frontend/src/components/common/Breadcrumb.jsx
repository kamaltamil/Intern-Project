import { Breadcrumb as AntBreadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { hasPermission } from "../../utils/hasPermission";

const ROUTES = {
  "/dashboard": { label: "Dashboard", resource: "dashboard" },
  "/users": { label: "User Management", resource: "users" },
  "/roles": { label: "Role Management", resource: "roles" },
  "/bookings": { label: "Bookings", resource: "bookings" },
  "/approval": { label: "Booking Approval", resource: "approval" },
  "/reports": { label: "Reports", resource: "reports" },
  "/rooms": { label: "Room Management", resource: "rooms" },
  "/profile": { label: "Profile", resource: "profile" },
};

const BreadcrumbItem = ({ item, isLast, isDark }) => {
  const color = isDark ? "#f0f0f0" : "#2E2A27";
  const linkColor = isDark ? "#aeb7c6" : "#756C65";

  if (isLast) {
    return (
      <span className="whitespace-nowrap" style={{ color }}>
        {item.label}
      </span>
    );
  }

  return (
    <Link
      to={item.path}
      className="whitespace-nowrap text-sm"
      style={{ color }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color = isDark ? "#ffffff" : "#2E2A27";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = linkColor;
      }}
    >
      {item.label}
    </Link>
  );
};

function renderBreadcrumbItem(item, params, routes, isDark) {
  const isLast = routes.indexOf(item) === routes.length - 1;

  return (
    <BreadcrumbItem
      item={item}
      isLast={isLast}
      isDark={isDark}
    />
  );
}

function Breadcrumb() {
  const location = useLocation();
  const { permissions, theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const currentRoute = ROUTES[location.pathname];

  if (!currentRoute) return null;

  if (!hasPermission(permissions, currentRoute.resource, "view")) {
    return null;
  }

  const items =
    location.pathname === "/dashboard"
      ? [{ ...currentRoute, path: "/dashboard" }]
      : [
          { ...ROUTES["/dashboard"], path: "/dashboard" },
          { ...currentRoute, path: location.pathname },
        ];

  const visibleItems = items.filter((item) =>
    hasPermission(permissions, item.resource, "view"),
  );

  const textColor = isDark ? "#f0f0f0" : "#2E2A27";
  const separatorColor = isDark ? "#8f98a8" : "#8B8179";

  return (
    <div
      className="mb-4 min-w-0 overflow-x-auto"
      style={{ color: textColor }}
    >
      <AntBreadcrumb
        separator={<span style={{ color: separatorColor }}>/</span>}
        items={visibleItems}
        itemRender={(item, params, routes) =>
          renderBreadcrumbItem(item, params, routes, isDark)
        }
      />
    </div>
  );
}

export default Breadcrumb;
