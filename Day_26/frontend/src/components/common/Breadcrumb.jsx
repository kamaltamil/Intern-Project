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

const BreadcrumbItem = ({
  item,
  isLast,
  isDark,
}) => {
  const textClass = isDark
    ? "text-gray-200"
    : "text-gray-700";

  if (isLast) {
    return (
      <span
        className={`whitespace-nowrap ${textClass}`}
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      to={item.path}
      className={`whitespace-nowrap text-sm ${
        isDark
          ? "text-gray-400 hover:text-white"
          : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {item.label}
    </Link>
  );
};

function renderBreadcrumbItem(
  item,
  params,
  routes,
  isDark
) {
  const isLast =
    routes.indexOf(item) === routes.length - 1;

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

  const { permissions, theme } = useSelector(
    (state) => state.auth
  );

  const isDark = theme === "dark";

  const currentRoute =
    ROUTES[location.pathname];

  if (!currentRoute) {
    return null;
  }

  if (
    !hasPermission(
      permissions,
      currentRoute.resource,
      "view"
    )
  ) {
    return null;
  }

  const items =
    location.pathname === "/dashboard"
      ? [
          {
            ...currentRoute,
            path: "/dashboard",
          },
        ]
      : [
          {
            ...ROUTES["/dashboard"],
            path: "/dashboard",
          },
          {
            ...currentRoute,
            path: location.pathname,
          },
        ];

  const visibleItems = items.filter((item) =>
    hasPermission(
      permissions,
      item.resource,
      "view"
    )
  );

  return (
    <div
      className={`mb-4 min-w-0 overflow-x-auto ${
        isDark
          ? "text-gray-200"
          : "text-gray-700"
      }`}
    >
      <AntBreadcrumb
        separator="/"
        items={visibleItems}
        itemRender={(item, params, routes) =>
          renderBreadcrumbItem(
            item,
            params,
            routes,
            isDark
          )
        }
      />
    </div>
  );
}

export default Breadcrumb;