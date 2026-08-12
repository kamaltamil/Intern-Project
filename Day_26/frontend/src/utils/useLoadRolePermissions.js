import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPermissions } from "../api/queries";
import { setRolePermissions } from "../store/slices/authSlice";

export function useLoadRolePermissions() {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const mountedRef = useRef(true);

  const loadPermissions = useCallback(async () => {
    if (!token || !role) return;

    try {
      const roleData = await fetchMyPermissions();

      if (mountedRef.current) {
        dispatch(
          setRolePermissions({
            role: roleData?.role?.name || roleData?.role || role,
            permissions: roleData?.permissions || [],
          })
        );
      }
    } catch (error) {
      if (mountedRef.current) {
        console.warn(
          "[useLoadRolePermissions] Failed to load permissions:",
          error?.message
        );
      }
    }
  }, [dispatch, role, token]);

  useEffect(() => {
    mountedRef.current = true;

    if (!token || !role) {
      return undefined;
    }

    loadPermissions();

    const refreshOnFocus = () => loadPermissions();
    window.addEventListener("focus", refreshOnFocus);

    const interval = window.setInterval(loadPermissions, 30000);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("focus", refreshOnFocus);
      window.clearInterval(interval);
    };
  }, [loadPermissions, role, token]);
}
