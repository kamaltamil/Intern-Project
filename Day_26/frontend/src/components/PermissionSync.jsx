import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { fetchMyPermissions } from "../api/queries";
import { setRolePermissions } from "../store/slices/authSlice";

function PermissionSync() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    const syncPermissions = async () => {
      try {
        const data = await fetchMyPermissions();

        if (cancelled || !data) return;

        /*
         * Update Redux.
         *
         * This updates:
         * - role
         * - roleColor
         * - dashboardConfig
         * - user
         * - permissions
         */
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

        /*
         * Keep React Query's ["me"] cache synchronized
         * with the same latest user data.
         *
         * ProfilePage uses ["me"], so without this update
         * the Profile page could continue displaying stale
         * data even though Redux has the latest role.
         */
        queryClient.setQueryData(["me"], data);
      } catch {
        /*
         * Keep the current authenticated state if the
         * permission synchronization request fails.
         */
      }
    };

    /*
     * Fetch immediately when PermissionSync mounts.
     */
    syncPermissions();

    /*
     * Fetch again whenever the browser window gets focus.
     */
    const handleFocus = () => {
      syncPermissions();
    };

    window.addEventListener("focus", handleFocus);

    /*
     * Check for role/permission changes every 5 seconds.
     */
    const intervalId = window.setInterval(syncPermissions, 5000);

    /*
     * Cleanup when the component unmounts or token changes.
     */
    return () => {
      cancelled = true;

      window.removeEventListener("focus", handleFocus);

      window.clearInterval(intervalId);
    };
  }, [dispatch, queryClient, token]);

  return null;
}

export default PermissionSync;
