import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoleByName } from '../api/queries';
import { setRolePermissions } from '../store/slices/authSlice';

/**
 * useLoadRolePermissions
 *
 * After login (or on app rehydration), fetches the current user's
 * role permissions from the backend and caches them in Redux
 * (auth.rolePermissions).
 *
 * - Works for ALL roles including Admin (Admin permissions now seeded in DB).
 * - ProtectedRoute still bypasses the permission check for Admin (full access
 *   regardless of DB state), but fetching Admin permissions populates the
 *   sidebar correctly.
 * - Re-fetches whenever the role changes (e.g. admin changes a user's role).
 */
export function useLoadRolePermissions() {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const prevRoleRef = useRef(null);

  useEffect(() => {
    // Not logged in — nothing to load
    if (!token || !role) return;

    // Avoid re-fetching for the same role within the same session
    if (prevRoleRef.current === role) return;

    let cancelled = false;

    const load = async () => {
      try {
        const roleData = await fetchRoleByName(role);
        if (!cancelled) {
          // roleData.permissions is an array of populated { resource, action } docs
          dispatch(setRolePermissions(roleData?.permissions || []));
          prevRoleRef.current = role;
        }
      } catch (err) {
        console.warn(
          '[useLoadRolePermissions] Failed to load role permissions:',
          err?.message
        );
        if (!cancelled) {
          dispatch(setRolePermissions([]));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token, role, dispatch]);
}
