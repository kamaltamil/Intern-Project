import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { fetchMe } from "../api/queries";
import { updateUserProfile } from "../store/slices/authSlice";

function PermissionSync() {
  const dispatch = useDispatch();
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    const syncPermissions = async () => {
      try {
        const data = await fetchMe();
        if (cancelled || !data?.user) return;

        dispatch(
          updateUserProfile({
            user: data.user,
            role: data.role,
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
  }, [dispatch, token, location.pathname]);

  return null;
}

export default PermissionSync;
