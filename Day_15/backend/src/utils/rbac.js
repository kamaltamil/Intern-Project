const ROLE_HIERARCHY = {
  Member: 1,
  Admin: 2,
};


const canAccessUserManagement = (role) => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.Admin;
};

const userManagementMiddleware = (req, res, next) => {
  if (!canAccessUserManagement(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  next();
}

module.exports = {
  canAccessTaskActions,
  canAccessUserManagement,
  userManagementMiddleware,
};
