import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import { fetchMyPermissions } from "../api/queries";
import { setRolePermissions } from "../store/slices/authSlice";

function PermissionSync() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const token = useSelector((state) => state.auth.token);

  const { data } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchMyPermissions,

    enabled: Boolean(token),

    // Check for role/permission changes every 30 seconds.
    refetchInterval: 30000,

    // Continue checking even when the browser tab is in the background.
    refetchIntervalInBackground: true,

    // Check again when the user returns to the browser.
    refetchOnWindowFocus: true,

    // Check again after reconnecting to the internet.
    refetchOnReconnect: true,

    // Don't keep old permission data considered fresh.
    staleTime: 0,

    retry: 2,
  });

  useEffect(() => {
    if (!data) return;

    dispatch(
      setRolePermissions({
        role: data.role?.name || data.role,
        roleColor: data.roleColor || data.user?.roleColor,
        roleDoc: data.roleDoc,
        dashboardConfig:
          data.dashboardConfig || data.roleDoc?.dashboardConfig,
        user: data.user,
        permissions: data.permissions || [],
      })
    );

    queryClient.setQueryData(["me"], data);
  }, [data, dispatch, queryClient]);

  return null;
}

export default PermissionSync;