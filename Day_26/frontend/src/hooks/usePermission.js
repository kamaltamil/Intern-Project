import { useSelector } from "react-redux";
import { hasPermission } from "../utils/hasPermission";

/**
 * usePermission(resource, action?)
 *
 * Reads RBAC permissions from Redux state and returns helpers
 * for checking view/create/update/delete access based strictly on database permissions.
 *
 * Usage — object form (full CRUD):
 * -----------------------------------
 * const { canView, canCreate, canUpdate, canDelete } = usePermission("users");
 *
 * Usage — single action form:
 * -----------------------------------
 * const canCreate = usePermission("users", "create");
 *
 * @param {string} resource - The resource/module key (e.g. "users", "roles")
 * @param {string} [action] - Optional single action. If provided, returns boolean.
 * @returns {{ canView, canCreate, canUpdate, canDelete } | boolean}
 */
export function usePermission(resource, action) {
  const permissions = useSelector((state) => state.auth.permissions);

  // Single-action shorthand: usePermission("users", "create") → boolean
  if (action) {
    return hasPermission(permissions, resource, action);
  }

  // Full CRUD object
  return {
    canView:   hasPermission(permissions, resource, "view"),
    canCreate: hasPermission(permissions, resource, "create"),
    canUpdate: hasPermission(permissions, resource, "update"),
    canDelete: hasPermission(permissions, resource, "delete"),
  };
}

export default usePermission;
