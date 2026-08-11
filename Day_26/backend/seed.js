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

    const rawCreate =
      override.create !== undefined
        ? override.create
        : create;

    const rawUpdate =
      override.update !== undefined
        ? override.update
        : update;

    const rawDelete =
      override.delete !== undefined
        ? override.delete
        : remove;

    const rawView =
      override.view !== undefined
        ? override.view
        : view ||
          rawCreate ||
          rawUpdate ||
          rawDelete;

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
  const defaultRoles = await Role.find({
    isDefault: true,
  });

  if (defaultRoles.length > 1) {
    console.log(
      `  ⚠️ Multiple default roles detected (${defaultRoles.length}). Fixing...`,
    );

    const primary =
      defaultRoles.find(
        (role) => role.name === "Member",
      ) || defaultRoles[0];

    await Role.updateMany(
      {
        _id: {
          $ne: primary._id,
        },
      },
      {
        isDefault: false,
      },
    );

    await Role.updateOne(
      {
        _id: primary._id,
      },
      {
        isDefault: true,
      },
    );

    console.log(
      `  ✓ Sanitized: "${primary.name}" is now the sole default role.`,
    );
  } else if (defaultRoles.length === 0) {
    console.log(
      "  ⚠️ No default role found in database. Assigning 'Member' as default...",
    );

    const memberRole =
      (await Role.findOne({
        name: "Member",
      })) || (await Role.findOne());

    if (memberRole) {
      await Role.updateOne(
        {
          _id: memberRole._id,
        },
        {
          isDefault: true,
        },
      );

      console.log(
        `  ✓ Sanitized: "${memberRole.name}" assigned as default role.`,
      );
    }
  }
};

/* -------------------------------------------------------------------------- */
/*                             Seed System Roles                              */
/* -------------------------------------------------------------------------- */

const seedRoles = async () => {
  console.log("Seeding system roles...");

  const rolesData = [
    /* ---------------------------------------------------------------------- */
    /*                                ADMIN                                   */
    /* ---------------------------------------------------------------------- */

    {
      name: "Admin",

      description:
        "System Administrator — full access to all modules",

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

    /* ---------------------------------------------------------------------- */
    /*                               MANAGER                                  */
    /* ---------------------------------------------------------------------- */

    {
      name: "Manager",

      description:
        "Hotel Manager — can view all, manage bookings and reports",

      color: "#fa8c16",

      isSystem: true,

      isDefault: false,

      permissions: createPermissions({
        view: true,

        create: false,

        update: false,

        delete: false,

        overrides: {
          /* -------------------------------------------------------------- */
          /* User Management                                                */
          /* -------------------------------------------------------------- */

          [MODULES.USERS]: {
            view: true,
            create: false,
            update: false,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Bookings                                                       */
          /* -------------------------------------------------------------- */

          [MODULES.BOOKINGS]: {
            view: true,
            create: true,
            update: true,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Booking Approval                                               */
          /* -------------------------------------------------------------- */

          [MODULES.APPROVAL]: {
            view: true,
            create: true,
            update: true,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Reports                                                        */
          /* -------------------------------------------------------------- */

          [MODULES.REPORTS]: {
            view: true,
            create: true,
            update: false,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Profile                                                        */
          /* -------------------------------------------------------------- */

          [MODULES.PROFILE]: {
            view: true,
            create: false,
            update: true,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Rooms                                                          */
          /* -------------------------------------------------------------- */

          [MODULES.ROOMS]: {
            view: true,
            create: false,
            update: false,
            delete: false,
          },
        },
      }),
    },

    /* ---------------------------------------------------------------------- */
    /*                                MEMBER                                  */
    /* ---------------------------------------------------------------------- */

    {
      name: "Member",

      description:
        "Default user — can view dashboard, manage own bookings and profile",

      color: "#1677ff",

      isSystem: true,

      isDefault: true,

      permissions: createPermissions({
        view: false,

        create: false,

        update: false,

        delete: false,

        overrides: {
          /* -------------------------------------------------------------- */
          /* Dashboard                                                      */
          /* -------------------------------------------------------------- */

          [MODULES.DASHBOARD]: {
            view: true,
            create: false,
            update: false,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Bookings                                                       */
          /* -------------------------------------------------------------- */
          /*
           * Member can create their own booking.
           */

          [MODULES.BOOKINGS]: {
            view: true,
            create: true,
            update: false,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Profile                                                        */
          /* -------------------------------------------------------------- */

          [MODULES.PROFILE]: {
            view: true,
            create: false,
            update: true,
            delete: false,
          },

          /* -------------------------------------------------------------- */
          /* Rooms                                                          */
          /* -------------------------------------------------------------- */
          /*
           * Member does not manage rooms.
           *
           * Rooms are managed by Admin.
           * Member uses the Booking module to book rooms.
           */

          [MODULES.ROOMS]: {
            view: false,
            create: false,
            update: false,
            delete: false,
          },
        },
      }),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                         Upsert System Roles                            */
  /* ---------------------------------------------------------------------- */

  for (const roleData of rolesData) {
    await Role.updateOne(
      {
        name: roleData.name,
      },
      {
        $set: roleData,
      },
      {
        upsert: true,
      },
    );

    console.log(
      `  ✓ Role "${roleData.name}" upserted`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                    Fetch Roles After Upsert                            */
  /* ---------------------------------------------------------------------- */

  const adminRole = await Role.findOne({
    name: "Admin",
  });

  const managerRole = await Role.findOne({
    name: "Manager",
  });

  const memberRole = await Role.findOne({
    name: "Member",
  });

  /* ---------------------------------------------------------------------- */
  /*                       Assign Manageable Roles                          */
  /* ---------------------------------------------------------------------- */

  const allRoleIds = (
    await Role.find({}, "_id")
  ).map((role) => role._id);

  /* ---------------------------------------------------------------------- */
  /*                                ADMIN                                   */
  /* ---------------------------------------------------------------------- */

  if (adminRole) {
    adminRole.manageableRoles = allRoleIds;

    await adminRole.save();
  }

  /* ---------------------------------------------------------------------- */
  /*                               MANAGER                                  */
  /* ---------------------------------------------------------------------- */

  if (managerRole) {
    managerRole.manageableRoles = memberRole
      ? [memberRole._id]
      : [];

    await managerRole.save();
  }

  /* ---------------------------------------------------------------------- */
  /*                               MEMBER                                   */
  /* ---------------------------------------------------------------------- */

  if (memberRole) {
    memberRole.manageableRoles = [];

    await memberRole.save();
  }

  /* ---------------------------------------------------------------------- */
  /*                       Ensure One Default Role                          */
  /* ---------------------------------------------------------------------- */

  await ensureSingleDefaultRole();

  console.log(
    "System roles seeded and manageableRoles assigned successfully.\n",
  );
};

/* -------------------------------------------------------------------------- */
/*                            Seed Test Users                                 */
/* -------------------------------------------------------------------------- */

const seedTestUsers = async () => {
  console.log("Seeding test users...");

  const adminRole = await Role.findOne({
    name: "Admin",
  });

  const managerRole = await Role.findOne({
    name: "Manager",
  });

  const memberRole = await Role.findOne({
    name: "Member",
  });

  if (
    !adminRole ||
    !managerRole ||
    !memberRole
  ) {
    console.error(
      "  ❌ Roles not found during user seeding",
    );

    return;
  }

  const hashedPassword =
    await bcrypt.hash("12345", 10);

  const testUsers = [
    /* -------------------------------------------------------------------- */
    /* Admin                                                                */
    /* -------------------------------------------------------------------- */

    {
      name: "admin",

      username: "admin",

      email: "admin@gmail.com",

      password: hashedPassword,

      role: adminRole._id,

      isActive: true,
    },

    /* -------------------------------------------------------------------- */
    /* Manager                                                              */
    /* -------------------------------------------------------------------- */

    {
      name: "manager",

      username: "manager",

      email: "manager@gmail.com",

      password: hashedPassword,

      role: managerRole._id,

      isActive: true,
    },

    /* -------------------------------------------------------------------- */
    /* Member                                                               */
    /* -------------------------------------------------------------------- */

    {
      name: "member",

      username: "member",

      email: "member@gmail.com",

      password: hashedPassword,

      role: memberRole._id,

      isActive: true,
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                         Upsert Test Users                              */
  /* ---------------------------------------------------------------------- */

  for (const userData of testUsers) {
    const existing = await User.findOne({
      email: userData.email,
    });

    if (existing) {
      existing.name =
        userData.name;

      existing.username =
        userData.username;

      existing.role =
        userData.role;

      existing.password =
        userData.password;

      existing.isActive =
        true;

      await existing.save();

      console.log(
        `  ✓ User "${userData.email}" updated (Role ID: ${userData.role})`,
      );
    } else {
      await User.create(
        userData,
      );

      console.log(
        `  ✓ User "${userData.email}" created (Role ID: ${userData.role})`,
      );
    }
  }

  console.log(
    "Test users seeded successfully.\n",
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main Seed Function                            */
/* -------------------------------------------------------------------------- */

const seedRolesAndAdmin = async () => {
  await seedRoles();

  await seedTestUsers();
};

/* -------------------------------------------------------------------------- */
/*                              Standalone Runner                             */
/* -------------------------------------------------------------------------- */

/*
 * This function is separated from the require.main block so Jest can
 * directly test both the successful and failed database connection paths.
 */

const runSeed = async () => {
  require("dotenv").config();

  const connectDB =
    require("./config/db");

  try {
    await connectDB();

    console.log(
      "Seeding process started...",
    );

    await seedRolesAndAdmin();

    console.log(
      "Seeding completed successfully.",
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Seeding failed:",
      error,
    );

    process.exit(1);
  }
};

/* -------------------------------------------------------------------------- */
/*                                Exports                                     */
/* -------------------------------------------------------------------------- */

module.exports =
  seedRolesAndAdmin;

module.exports.runSeed =
  runSeed;

/* -------------------------------------------------------------------------- */
/*                          Execute When Run Directly                         */
/* -------------------------------------------------------------------------- */

/* istanbul ignore next -- process entrypoint is exercised through runSeed in Jest */

if (
  require.main === module
) {
  runSeed();
}