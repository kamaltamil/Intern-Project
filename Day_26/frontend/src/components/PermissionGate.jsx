import { usePermission } from "../hooks/usePermission";

/**
 * PermissionGate
 *
 * Renders children only when the current user has the required permission.
 * If permission is denied, renders `fallback` (default: null).
 *
 * This is a FRONTEND UI control only.
 * Backend authorization must ALWAYS be enforced independently.
 *
 * Usage:
 * -------
 * <PermissionGate resource="users" action="create">
 *   <Button>Add User</Button>
 * </PermissionGate>
 *
 * <PermissionGate resource="roles" action="delete" fallback={<span>No access</span>}>
 *   <Button danger>Delete Role</Button>
 * </PermissionGate>
 *
 * Props:
 * -------
 * @param {string}  resource  - Module/resource name (e.g. "users", "roles")
 * @param {string}  action    - Action to check: "view" | "create" | "update" | "delete"
 * @param {ReactNode} children - Content to render if permission granted
 * @param {ReactNode} fallback - Content to render if permission denied (default: null)
 */
function PermissionGate({ resource, action, children, fallback = null }) {
  const allowed = usePermission(resource, action);

  console.log(resource, action, allowed)
  if (!allowed) {
    return fallback;
  }

  return children;
}

export default PermissionGate;
