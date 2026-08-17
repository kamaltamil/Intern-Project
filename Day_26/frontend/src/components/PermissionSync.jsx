import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPermissions } from "../api/queries";
import { setRolePermissions } from "../store/slices/authSlice";

function PermissionSync() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    const syncPermissions = async () => {
      try {
        const data = await fetchMyPermissions();
        if (cancelled || !data) return;

        dispatch(
          setRolePermissions({
            role: data.role?.name || data.role,
            roleColor: data.roleColor || data.user?.roleColor,
            roleDoc: data.roleDoc,
            dashboardConfig:
              data.dashboardConfig || data.roleDoc?.dashboardConfig,
            user: data.user,
            permissions: data.permissions || [],
          }),
        );
      } catch {
        // Keep the current authenticated state if the refresh request fails.
      }
    };

    syncPermissions();

    const handleFocus = () => syncPermissions();
    window.addEventListener("focus", handleFocus);
    const intervalId = window.setInterval(syncPermissions, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, [dispatch, token]);

  return null;
}

export default PermissionSync;
