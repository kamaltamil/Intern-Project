import { Breadcrumb as AntBreadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { hasPermission } from "../../utils/hasPermission";

const ROUTES = {
  "/dashboard": {
    label: "Dashboard",
    resource: "dashboard",
  },
  "/users": {
    label: "User Management",
    resource: "users",
  },
  "/roles": {
    label: "Role Management",
    resource: "roles",
  },
  "/bookings": {
    label: "Bookings",
    resource: "bookings",
  },
  "/approval": {
    label: "Booking Approval",
    resource: "approval",
  },
  "/reports": {
    label: "Reports",
    resource: "reports",
  },
  "/rooms": {
    label: "Room Management",
    resource: "rooms",
  },
  "/profile": {
    label: "Profile",
    resource: "profile",
  },
};

function Breadcrumb() {
  const location = useLocation();
  const permissions = useSelector((state) => state.auth.permissions);
  const currentRoute = ROUTES[location.pathname];

  if (!currentRoute) {
    return null;
  }

  if (!hasPermission(permissions, currentRoute.resource, "view")) {
    return null;
  }

  const items =
    location.pathname === "/dashboard"
      ? [currentRoute]
      : [ROUTES["/dashboard"], currentRoute];

  const visibleItems = items.filter((item) =>
    hasPermission(permissions, item.resource, "view")
  );

  return (
    <div className="mb-4 min-w-0 overflow-x-auto">
      <AntBreadcrumb
        items={visibleItems}
        itemRender={(item, params, routes) => {
          const isLast = routes.indexOf(item) === routes.length - 1;
          const path = Object.keys(ROUTES).find(
            (routePath) => ROUTES[routePath] === item
          );

          if (isLast || !path) {
            return <span className="whitespace-nowrap">{item.label}</span>;
          }

          return (
            <Link to={path} className="whitespace-nowrap">
              {item.label}
            </Link>
          );
        }}
      />
    </div>
  );
}

export default Breadcrumb;
