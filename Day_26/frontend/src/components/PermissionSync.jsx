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
            permissions: data.permissions || [],
          }),
        );
      } catch {
        // Keep the current authenticated state if the refresh request fails.
      }
    };

    syncPermissions();

    const intervalId = window.setInterval(syncPermissions, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [dispatch, token]);

  return null;
}

export default PermissionSync;
