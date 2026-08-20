import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice"; 

// reuse your existing permission -> route map if one already exists
const MODULE_ROUTES = {
  users: "/users",
  roles: "/roles",
  bookings: "/bookings",
  reports: "/reports",
  approval: "/approval",
  profile: "/profile",
  dashboard: "/dashboard",
  rooms: "/rooms",
}

function UnauthorizedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, permissions } = useSelector((state) => state.auth);

  console.log("Permissions",permissions);

  const allowedPermission = permissions?.find(
    (p) => p.action?.view && MODULE_ROUTES[p.resource]
  );

  console.log(allowedPermission)

  const allowedRoute = allowedPermission
    ? MODULE_ROUTES[allowedPermission.resource]
    : null;

  console.log(allowedRoute)

  const handleClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (allowedRoute) {
      navigate(allowedRoute);
    } else {
      dispatch(logout());
      navigate("/", {
        state: {
          authMessage:
            "You don't have permission to view the application, please try next time.",
        },
      });
    }
  };

  let buttonLabel;

  if (!token) {
    buttonLabel = "Go to Login";
  } else if (allowedRoute) {
    const routeName = allowedRoute.replace("/", "") || "home"; // handles "/" -> ""
    buttonLabel = `Redirect to ${routeName.charAt(0).toUpperCase() + routeName.slice(1)}`;
  } else {
    buttonLabel = "Back to Home";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE]">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you do not have permission to access this page."
        extra={
          <Button
            type="primary"
            onClick={handleClick}
            style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
          >
            {buttonLabel}
          </Button>
        }
      />
    </div>
  );
}

export default UnauthorizedPage;