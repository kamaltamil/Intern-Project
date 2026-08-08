/**
 * Check whether a user has a specific permission for a resource.
 *
 * @param {Array} permissions - Permissions stored in Redux auth state
 * @param {String} resource - Module/resource name
 * @param {String} action - view | create | update | delete
 * @returns {Boolean}
 */
export const hasPermission = (permissions, resource, action) => {
  if (!Array.isArray(permissions) || !resource || !action) {
    return false;
  }

  const permission = permissions.find(
    (item) =>
      item?.resource?.toLowerCase() === resource.toLowerCase()
  );

  if (!permission) {
    return false;
  }

  return permission.action?.[action] === true;
};

/**
 * Check whether the user has at least one permission
 * for a resource.
 */
export const hasAnyPermission = (permissions, resource) => {
  if (!Array.isArray(permissions) || !resource) {
    return false;
  }

  const permission = permissions.find(
    (item) =>
      item?.resource?.toLowerCase() === resource.toLowerCase()
  );

  if (!permission?.action) {
    return false;
  }

  return Object.values(permission.action).some(
    (value) => value === true
  );
};

/**
 * Check whether the user can perform CRUD operations.
 */
export const canView = (permissions, resource) =>
  hasPermission(permissions, resource, "view");

export const canCreate = (permissions, resource) =>
  hasPermission(permissions, resource, "create");

export const canUpdate = (permissions, resource) =>
  hasPermission(permissions, resource, "update");

export const canDelete = (permissions, resource) =>
  hasPermission(permissions, resource, "delete");