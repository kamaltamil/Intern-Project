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

const role = (name, id) => ({
  name,
  _id: id,
  save: jest.fn(),
});

describe("seed", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    bcrypt.hash.mockResolvedValue("hashed");

    Role.updateOne.mockResolvedValue({});
    Role.updateMany.mockResolvedValue({});
    User.create.mockResolvedValue({});
  });

  /* ---------------------------------------------------------------------- */
  /*                              Seed Roles                                */
  /* ---------------------------------------------------------------------- */

  test("seeds roles, permissions and manageable roles", async () => {
    const admin = role("Admin", "a");
    const manager = role("Manager", "m");
    const member = role("Member", "u");

    Role.find.mockResolvedValue([admin, manager, member]);

    Role.findOne.mockImplementation(async ({ name }) => {
      const roles = {
        Admin: admin,
        Manager: manager,
        Member: member,
      };

      return roles[name] || null;
    });

    await seed();

    expect(Role.updateOne).toHaveBeenCalled();

    expect(admin.manageableRoles).toEqual(["a", "m", "u"]);

    expect(manager.manageableRoles).toEqual(["u"]);

    expect(member.manageableRoles).toEqual([]);

    expect(admin.save).toHaveBeenCalled();
    expect(manager.save).toHaveBeenCalled();
    expect(member.save).toHaveBeenCalled();
  });

  /* ---------------------------------------------------------------------- */
  /*                        Multiple Default Roles                          */
  /* ---------------------------------------------------------------------- */

  test("sanitizes multiple defaults preferring Member", async () => {
    const member = role("Member", "m");
    const other = role("Other", "o");

    /*
     * First Role.find() call:
     * - all default roles
     *
     * Second Role.find() call:
     * - all role IDs
     */
    Role.find
      .mockResolvedValueOnce([member, other])
      .mockResolvedValueOnce([member, other]);

    Role.findOne.mockImplementation(async ({ name }) => {
      if (name === "Admin") {
        return role("Admin", "a");
      }

      if (name === "Manager") {
        return role("Manager", "g");
      }

      if (name === "Member") {
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
  /*                         No Default Role                                 */
  /* ---------------------------------------------------------------------- */

  test("assigns Member default when no defaults exist", async () => {
    const member = role("Member", "m");

    /*
     * First find:
     *     default roles => []
     *
     * Second find:
     *     all role IDs
     */
    Role.find.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    Role.findOne.mockImplementation(async ({ name }) => {
      if (name === "Member") {
        return member;
      }

      if (name === "Admin") {
        return role("Admin", "a");
      }

      if (name === "Manager") {
        return role("Manager", "g");
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
  /*                         Existing Test Users                            */
  /* ---------------------------------------------------------------------- */

  test("seeds test users and updates existing users", async () => {
    const admin = role("Admin", "a");
    const manager = role("Manager", "g");
    const member = role("Member", "m");

    const roles = [admin, manager, member];

    Role.find.mockResolvedValue([]);

    Role.findOne.mockImplementation(async ({ name }) => {
      return roles.find((item) => item.name === name) || null;
    });

    const existingAdmin = {
      save: jest.fn(),
    };

    const existingMember = {
      save: jest.fn(),
    };

    /*
     * User calls:
     *
     * 1. admin@gmail.com => existing
     * 2. manager@gmail.com => doesn't exist
     * 3. member@gmail.com => existing
     */
    User.findOne
      .mockResolvedValueOnce(existingAdmin)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingMember);

    await seed();

    expect(bcrypt.hash).toHaveBeenCalledWith("12345", 10);

    expect(User.findOne).toHaveBeenCalledTimes(3);

    expect(User.create).toHaveBeenCalledTimes(1);

    expect(existingAdmin.save).toHaveBeenCalled();
    expect(existingMember.save).toHaveBeenCalled();
  });

  /* ---------------------------------------------------------------------- */
  /*                         Missing Seed Roles                             */
  /* ---------------------------------------------------------------------- */

  test("returns when required seed roles are missing", async () => {
    Role.find.mockResolvedValue([]);

    Role.findOne.mockImplementation(async () => null);

    await seed();

    expect(User.create).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
  });

  /* ---------------------------------------------------------------------- */
  /*                       Direct Seed Success                              */
  /* ---------------------------------------------------------------------- */

  test("runs seed script successfully", async () => {
    jest.resetModules();

    const connectDB = jest.fn().mockResolvedValue();

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    jest.doMock("../config/db", () => connectDB);

    let runSeed;

    jest.isolateModules(() => {
      jest.doMock("../models/role", () => ({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
        updateOne: jest.fn(),
      }));

      jest.doMock("../models/user", () => ({
        findOne: jest.fn(),
        create: jest.fn(),
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
  /*                        Direct Seed Failure                             */
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
