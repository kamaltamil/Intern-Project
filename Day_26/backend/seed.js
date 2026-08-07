const Role = require("./models/role");
const MODULES = require("./constants/modules");

const createPermissions = ({
  view = false,
  create = false,
  update = false,
  delete: remove = false,
}) => {
  return Object.values(MODULES).map((resource) => ({
    resource,
    action: {
      view,
      create,
      update,
      delete: remove,
    },
  }));
};

const seedRoles = async () => {
  try {
    const count = await Role.countDocuments();

    if (count > 0) {
      console.log("Roles already seeded.");
      return;
    }

    const roles = [
      {
        name: "Admin",
        description: "System Administrator",
        color: "#f5222d",
        isSystem: true,
        isDefault: false,
        permissions: createPermissions({
          view: true,
          create: true,
          update: true,
          delete: true,
        }),
      },

      {
        name: "Manager",
        description: "Hotel Manager",
        color: "#fa8c16",
        isSystem: true,
        isDefault: false,
        permissions: Object.values(MODULES).map((resource) => ({
          resource,
          action: {
            view: true,
            create:
              resource === MODULES.BOOKINGS ||
              resource === MODULES.REPORTS,
            update:
              resource === MODULES.BOOKINGS ||
              resource === MODULES.PROFILE,
            delete: false,
          },
        })),
      },

      {
        name: "Member",
        description: "Default User",
        color: "#1677ff",
        isSystem: true,
        isDefault: true,
        permissions: Object.values(MODULES).map((resource) => ({
          resource,
          action: {
            view:
              resource === MODULES.PROFILE ||
              resource === MODULES.BOOKINGS,
            create:
              resource === MODULES.BOOKINGS,
            update:
              resource === MODULES.PROFILE,
            delete: false,
          },
        })),
      },
    ];

    await Role.insertMany(roles);

    console.log("System roles seeded successfully.");
  } catch (error) {
    console.error("Error seeding roles:", error.message);
  }
};

module.exports = seedRoles;