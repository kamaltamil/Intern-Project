const bcrypt = require("bcrypt");

const Role = require("./models/role");
const User = require("./models/user");
const MODULES = require("./constants/modules");

/* -------------------------------------------------------------------------- */
/*                         Default Permission Builder                         */
/* -------------------------------------------------------------------------- */

const createPermissions = ({
  view = false,
  create = false,
  update = false,
  delete: remove = false,
  overrides = {},
}) => {
  return Object.values(MODULES).map((resource) => {
    const override = overrides[resource] || {};

    const rawCreate = override.create !== undefined ? override.create : create;
    const rawUpdate = override.update !== undefined ? override.update : update;
    const rawDelete = override.delete !== undefined ? override.delete : remove;

    const rawView =
      override.view !== undefined
        ? override.view
        : view || rawCreate || rawUpdate || rawDelete;

    return {
      resource,
      action: {
        view: rawView,
        create: rawCreate,
        update: rawUpdate,
        delete: rawDelete,
      },
    };
  });
};

/* -------------------------------------------------------------------------- */
/*                     Sanitize & Ensure Single Default Role                 */
/* -------------------------------------------------------------------------- */

const ensureSingleDefaultRole = async () => {
  const defaultRoles = await Role.find({ isDefault: true });

  if (defaultRoles.length > 1) {
    console.log(`  ⚠️ Multiple default roles detected (${defaultRoles.length}). Fixing...`);
    const primary = defaultRoles.find((r) => r.name === "Member") || defaultRoles[0];
    await Role.updateMany({ _id: { $ne: primary._id } }, { isDefault: false });
    await Role.updateOne({ _id: primary._id }, { isDefault: true });
    console.log(`  ✓ Sanitized: "${primary.name}" is now the sole default role.`);
  } else if (defaultRoles.length === 0) {
    console.log("  ⚠️ No default role found in database. Assigning 'Member' as default...");
    const memberRole = (await Role.findOne({ name: "Member" })) || (await Role.findOne());
    if (memberRole) {
      await Role.updateOne({ _id: memberRole._id }, { isDefault: true });
      console.log(`  ✓ Sanitized: "${memberRole.name}" assigned as default role.`);
    }
  }
};

/* -------------------------------------------------------------------------- */
/*                             Seed System Roles                              */
/* -------------------------------------------------------------------------- */

const seedRoles = async () => {
  console.log("Seeding system roles...");

  const rolesData = [
    {
      name: "Admin",
      description: "System Administrator — full access to all modules",
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
      description: "Hotel Manager — can view all, manage bookings and reports",
      color: "#fa8c16",
      isSystem: true,
      isDefault: false,
      permissions: createPermissions({
        view: true,
        create: false,
        update: false,
        delete: false,
        overrides: {
          [MODULES.USERS]:    { view: true, create: false, update: false, delete: false },
          [MODULES.BOOKINGS]: { view: true, create: true, update: true, delete: false },
          [MODULES.APPROVAL]: { view: true, create: true, update: true, delete: false },
          [MODULES.REPORTS]:  { view: true, create: true, update: false, delete: false },
          [MODULES.PROFILE]:  { view: true, create: false, update: true, delete: false },
        },
      }),
    },

    {
      name: "Member",
      description: "Default user — can view dashboard, manage own bookings and profile",
      color: "#1677ff",
      isSystem: true,
      isDefault: true,
      permissions: createPermissions({
        view: false,
        create: false,
        update: false,
        delete: false,
        overrides: {
          [MODULES.DASHBOARD]: { view: true, create: false, update: false, delete: false },
          [MODULES.BOOKINGS]:  { view: true, create: true, update: false, delete: false },
          [MODULES.PROFILE]:   { view: true, create: false, update: true, delete: false },
        },
      }),
    },
  ];

  for (const roleData of rolesData) {
    await Role.updateOne(
      { name: roleData.name },
      { $set: roleData },
      { upsert: true }
    );

    console.log(`  ✓ Role "${roleData.name}" upserted`);
  }

  // Fetch populated role documents to assign manageableRoles ObjectIds
  const adminRole = await Role.findOne({ name: "Admin" });
  const managerRole = await Role.findOne({ name: "Manager" });
  const memberRole = await Role.findOne({ name: "Member" });

  const allRoleIds = (await Role.find({}, "_id")).map((r) => r._id);

  if (adminRole) {
    adminRole.manageableRoles = allRoleIds;
    await adminRole.save();
  }

  if (managerRole) {
    managerRole.manageableRoles = [memberRole._id];
    await managerRole.save();
  }

  if (memberRole) {
    memberRole.manageableRoles = [];
    await memberRole.save();
  }

  await ensureSingleDefaultRole();

  console.log("System roles seeded and manageableRoles assigned successfully.\n");
};

/* -------------------------------------------------------------------------- */
/*                            Seed Test Users                                 */
/* -------------------------------------------------------------------------- */

const seedTestUsers = async () => {
  console.log("Seeding test users...");

  const adminRole = await Role.findOne({ name: "Admin" });
  const managerRole = await Role.findOne({ name: "Manager" });
  const memberRole = await Role.findOne({ name: "Member" });

  if (!adminRole || !managerRole || !memberRole) {
    console.error("  ❌ Roles not found during user seeding");
    return;
  }

  const hashedPassword = await bcrypt.hash("12345", 10);

  const testUsers = [
    {
      name: "admin",
      username: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: adminRole._id,
      isActive: true,
    },
    {
      name: "manager",
      username: "manager",
      email: "manager@gmail.com",
      password: hashedPassword,
      role: managerRole._id,
      isActive: true,
    },
    {
      name: "member",
      username: "member",
      email: "member@gmail.com",
      password: hashedPassword,
      role: memberRole._id,
      isActive: true,
    },
  ];

  for (const userData of testUsers) {
    const existing = await User.findOne({ email: userData.email });

    if (existing) {
      existing.name = userData.name;
      existing.username = userData.username;
      existing.role = userData.role;
      existing.password = userData.password;
      existing.isActive = true;
      await existing.save();
      console.log(`  ✓ User "${userData.email}" updated (Role ID: ${userData.role})`);
    } else {
      await User.create(userData);
      console.log(`  ✓ User "${userData.email}" created (Role ID: ${userData.role})`);
    }
  }

  console.log("Test users seeded successfully.\n");
};

/* -------------------------------------------------------------------------- */
/*                              Main Seed Function                            */
/* -------------------------------------------------------------------------- */

const seedRolesAndAdmin = async () => {
  await seedRoles();
  await seedTestUsers();
};

module.exports = seedRolesAndAdmin;

if (require.main === module) {
  require("dotenv").config();
  const connectDB = require("./config/db");
  connectDB().then(async () => {
    console.log("Seeding process started...");
    await seedRolesAndAdmin();
    console.log("Seeding completed successfully.");
    process.exit(0);
  }).catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}