jest.mock("../models/role", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock("../models/user", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

const Role = require("../models/role");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const seed = require("../seed");

const createRole = (name, id, extra = {}) => ({
  name,
  _id: id,
  save: jest.fn(),
  ...extra,
});

describe("seed", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    bcrypt.hash.mockResolvedValue("hashed");

    Role.find.mockResolvedValue([]);
    Role.findOne.mockResolvedValue(null);
    Role.updateMany.mockResolvedValue({});
    Role.updateOne.mockResolvedValue({});

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({});
  });

  /* ---------------------------------------------------------------------- */
  /*                         SYSTEM ROLE SEEDING                            */
  /* ---------------------------------------------------------------------- */

  test("seeds roles, permissions and manageable roles", async () => {
    const admin = createRole("Admin", "a");
    const manager = createRole("Manager", "m");
    const member = createRole("Member", "u");

    Role.find.mockImplementation(async (query) => {
      if (query?.isDefault === true) {
        return [member];
      }

      return [admin, manager, member];
    });

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Admin") {
        return admin;
      }

      if (query?.name === "Manager") {
        return manager;
      }

      if (query?.name === "Member") {
        return member;
      }

      return null;
    });

    await seed();

    expect(Role.updateOne).toHaveBeenCalled();

    expect(admin.manageableRoles).toEqual(["a", "m", "u"]);
    expect(manager.manageableRoles).toEqual(["u"]);
    expect(member.manageableRoles).toEqual([]);

    expect(admin.save).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledTimes(1);
    expect(member.save).toHaveBeenCalledTimes(1);
  });

  /* ---------------------------------------------------------------------- */
  /*                     MULTIPLE DEFAULT ROLES                             */
  /* ---------------------------------------------------------------------- */

  test("sanitizes multiple default roles and prefers Member", async () => {
    const member = createRole("Member", "m");
    const other = createRole("Other", "o");

    Role.find
      .mockResolvedValueOnce([member, other])
      .mockResolvedValueOnce([member, other]);

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Admin") {
        return createRole("Admin", "a");
      }

      if (query?.name === "Manager") {
        return createRole("Manager", "g");
      }

      if (query?.name === "Member") {
        return member;
      }

      return null;
    });

    await seed();

    expect(Role.updateMany).toHaveBeenCalledWith(
      {
        _id: {
          $ne: "m",
        },
      },
      {
        isDefault: false,
      },
    );

    expect(Role.updateOne).toHaveBeenCalledWith(
      {
        _id: "m",
      },
      {
        isDefault: true,
      },
    );
  });

  /* ---------------------------------------------------------------------- */
  /*                 MULTIPLE DEFAULT WITHOUT MEMBER                       */
  /* ---------------------------------------------------------------------- */

  test("sanitizes multiple defaults using first role when Member is absent", async () => {
    const admin = createRole("Admin", "a");
    const other = createRole("Other", "o");

    Role.find
      .mockResolvedValueOnce([admin, other])
      .mockResolvedValueOnce([admin, other]);

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Admin") {
        return admin;
      }

      if (query?.name === "Manager") {
        return createRole("Manager", "g");
      }

      if (query?.name === "Member") {
        return null;
      }

      return null;
    });

    await seed();

    expect(Role.updateMany).toHaveBeenCalledWith(
      {
        _id: {
          $ne: "a",
        },
      },
      {
        isDefault: false,
      },
    );

    expect(Role.updateOne).toHaveBeenCalledWith(
      {
        _id: "a",
      },
      {
        isDefault: true,
      },
    );
  });

  /* ---------------------------------------------------------------------- */
  /*                         NO DEFAULT ROLE                                 */
  /* ---------------------------------------------------------------------- */

  test("assigns Member as default when no default role exists", async () => {
    const member = createRole("Member", "m");

    Role.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Member") {
        return member;
      }

      if (query?.name === "Admin") {
        return createRole("Admin", "a");
      }

      if (query?.name === "Manager") {
        return createRole("Manager", "g");
      }

      return null;
    });

    await seed();

    expect(Role.updateOne).toHaveBeenCalledWith(
      {
        _id: "m",
      },
      {
        isDefault: true,
      },
    );
  });

  /* ---------------------------------------------------------------------- */
  /*               NO DEFAULT + MEMBER FALLBACK TO ANY ROLE                */
  /* ---------------------------------------------------------------------- */

  test("uses another role when Member cannot be found as default", async () => {
    const fallbackRole = createRole("Fallback", "f");

    Role.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    let findOneCall = 0;

    Role.findOne.mockImplementation(async (query) => {
      findOneCall += 1;

      if (query?.name === "Admin") {
        return createRole("Admin", "a");
      }

      if (query?.name === "Manager") {
        return createRole("Manager", "g");
      }

      if (query?.name === "Member") {
        return null;
      }

      /*
       * seed.js executes:
       *
       * Role.findOne({ name: "Member" }) || Role.findOne()
       *
       * Therefore query === undefined represents the fallback call.
       */
      if (query === undefined) {
        return fallbackRole;
      }

      return null;
    });

    await seed();

    expect(findOneCall).toBeGreaterThanOrEqual(4);

    expect(Role.updateOne).toHaveBeenCalledWith(
      {
        _id: "f",
      },
      {
        isDefault: true,
      },
    );
  });

  /* ---------------------------------------------------------------------- */
  /*               MANAGER WITHOUT MEMBER ROLE                              */
  /* ---------------------------------------------------------------------- */

  test("assigns empty manageableRoles to Manager when Member is missing", async () => {
    const admin = createRole("Admin", "a");
    const manager = createRole("Manager", "g");

    Role.find.mockImplementation(async (query) => {
      if (query?.isDefault === true) {
        return [manager];
      }

      return [admin, manager];
    });

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Admin") {
        return admin;
      }

      if (query?.name === "Manager") {
        return manager;
      }

      if (query?.name === "Member") {
        return null;
      }

      return null;
    });

    await seed();

    expect(manager.manageableRoles).toEqual([]);
    expect(manager.save).toHaveBeenCalledTimes(1);

    expect(admin.manageableRoles).toEqual(["a", "g"]);
    expect(admin.save).toHaveBeenCalledTimes(1);
  });

  /* ---------------------------------------------------------------------- */
  /*                         EXISTING TEST USERS                            */
  /* ---------------------------------------------------------------------- */

  test("updates existing users and creates missing users", async () => {
    const admin = createRole("Admin", "a");
    const manager = createRole("Manager", "g");
    const member = createRole("Member", "m");

    Role.find.mockResolvedValue([]);

    Role.findOne.mockImplementation(async (query) => {
      if (query?.name === "Admin") {
        return admin;
      }

      if (query?.name === "Manager") {
        return manager;
      }

      if (query?.name === "Member") {
        return member;
      }

      return null;
    });

    const existingAdmin = {
      save: jest.fn(),
    };

    const existingMember = {
      save: jest.fn(),
    };

    User.findOne
      .mockResolvedValueOnce(existingAdmin)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingMember);

    await seed();

    expect(bcrypt.hash).toHaveBeenCalledWith("12345", 10);

    expect(User.findOne).toHaveBeenCalledTimes(3);

    expect(User.create).toHaveBeenCalledTimes(1);

    expect(existingAdmin.name).toBe("admin");
    expect(existingAdmin.username).toBe("admin");
    expect(existingAdmin.role).toBe("a");
    expect(existingAdmin.password).toBe("hashed");
    expect(existingAdmin.isActive).toBe(true);

    expect(existingMember.name).toBe("member");
    expect(existingMember.username).toBe("member");
    expect(existingMember.role).toBe("m");
    expect(existingMember.password).toBe("hashed");
    expect(existingMember.isActive).toBe(true);

    expect(existingAdmin.save).toHaveBeenCalledTimes(1);
    expect(existingMember.save).toHaveBeenCalledTimes(1);

    expect(User.create).toHaveBeenCalledWith({
      name: "manager",
      username: "manager",
      email: "manager@gmail.com",
      password: "hashed",
      role: "g",
      isActive: true,
    });
  });

  /* ---------------------------------------------------------------------- */
  /*                     MISSING SEED ROLES                                 */
  /* ---------------------------------------------------------------------- */

  test("returns when required seed roles are missing", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    Role.updateOne.mockResolvedValue({});
    Role.find.mockResolvedValue([]);

    Role.findOne.mockImplementation(async ({ name } = {}) => {
      if (name === "Admin") {
        return null;
      }

      if (name === "Manager") {
        return null;
      }

      if (name === "Member") {
        return null;
      }

      return null;
    });

    await seed();

    expect(User.create).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "  ❌ Roles not found during user seeding",
    );

    consoleErrorSpy.mockRestore();
  });

  /* ---------------------------------------------------------------------- */
  /*                       DIRECT RUN SUCCESS                               */
  /* ---------------------------------------------------------------------- */

  test("runs seed script successfully", async () => {
    jest.resetModules();

    const connectDB = jest.fn().mockResolvedValue();

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    jest.doMock("../config/db", () => connectDB);

    let runSeed;

    jest.isolateModules(() => {
      /*
       * IMPORTANT:
       * The successful run must provide all three roles.
       *
       * Previously these mocks returned null from findOne(),
       * which caused seedTestUsers() to execute:
       *
       * console.error(
       *   "  ❌ Roles not found during user seeding"
       * );
       *
       * That made the successful run noisy even though the test passed.
       */

      const adminRole = {
        name: "Admin",
        _id: "admin-id",
        save: jest.fn().mockResolvedValue(),
      };

      const managerRole = {
        name: "Manager",
        _id: "manager-id",
        save: jest.fn().mockResolvedValue(),
      };

      const memberRole = {
        name: "Member",
        _id: "member-id",
        save: jest.fn().mockResolvedValue(),
      };

      const roleFind = jest.fn().mockImplementation(async (query) => {
        /*
         * seedRoles() calls:
         *
         * Role.find({}, "_id")
         *
         * and ensureSingleDefaultRole() calls:
         *
         * Role.find({ isDefault: true })
         */

        if (query?.isDefault === true) {
          return [memberRole];
        }

        return [
          {
            _id: "admin-id",
          },
          {
            _id: "manager-id",
          },
          {
            _id: "member-id",
          },
        ];
      });

      const roleFindOne = jest.fn().mockImplementation(async (query) => {
        if (query?.name === "Admin") {
          return adminRole;
        }

        if (query?.name === "Manager") {
          return managerRole;
        }

        if (query?.name === "Member") {
          return memberRole;
        }

        return null;
      });

      jest.doMock("../models/role", () => ({
        find: roleFind,
        findOne: roleFindOne,
        updateMany: jest.fn().mockResolvedValue({}),
        updateOne: jest.fn().mockResolvedValue({}),
      }));

      jest.doMock("../models/user", () => ({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      }));

      jest.doMock("bcrypt", () => ({
        hash: jest.fn().mockResolvedValue("hashed"),
      }));

      const seedModule = require("../seed");

      runSeed = seedModule.runSeed;
    });

    await runSeed();

    expect(connectDB).toHaveBeenCalledTimes(1);

    expect(logSpy).toHaveBeenCalledWith("Seeding process started...");

    expect(logSpy).toHaveBeenCalledWith("Seeding completed successfully.");

    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
    logSpy.mockRestore();
  });

  /* ---------------------------------------------------------------------- */
  /*                        DIRECT RUN FAILURE                              */
  /* ---------------------------------------------------------------------- */

  test("handles seed script database failure", async () => {
    jest.resetModules();

    const dbError = new Error("database connection failed");

    const connectDB = jest.fn().mockRejectedValue(dbError);

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.doMock("../config/db", () => connectDB);

    let runSeed;

    jest.isolateModules(() => {
      jest.doMock("../models/role", () => ({
        find: jest.fn(),
        findOne: jest.fn(),
        updateMany: jest.fn(),
        updateOne: jest.fn(),
      }));

      jest.doMock("../models/user", () => ({
        findOne: jest.fn(),
        create: jest.fn(),
      }));

      jest.doMock("bcrypt", () => ({
        hash: jest.fn(),
      }));

      const seedModule = require("../seed");

      runSeed = seedModule.runSeed;
    });

    await runSeed();

    expect(connectDB).toHaveBeenCalledTimes(1);

    expect(errorSpy).toHaveBeenCalledWith("Seeding failed:", dbError);

    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
