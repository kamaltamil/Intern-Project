const MODULE_LIST = require('./modules');

// Human-readable labels for each module, shown in the Role Management UI.
const MODULE_LABELS = {
  [MODULE_LIST.DASHBOARD]: 'Dashboard',
  [MODULE_LIST.USERS]:     'User Management',
  [MODULE_LIST.ROLES]:     'Role Management',
  [MODULE_LIST.BOOKINGS]:  'Bookings',
  [MODULE_LIST.ROOMS]:     'Rooms',
  [MODULE_LIST.APPROVAL]:  'Booking Approval',
  [MODULE_LIST.REPORTS]:   'Reports',
  [MODULE_LIST.PROFILE]:   'Profile',
};

module.exports = MODULE_LABELS;