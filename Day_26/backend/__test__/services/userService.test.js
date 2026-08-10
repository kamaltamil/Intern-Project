const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

jest.mock("../../models/user", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../../models/role", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
}));

const User = require("../../models/user");
const Role = require("../../models/role");
const svc = require("../../services/userService");

const id1 = new mongoose.Types.ObjectId().toString();
const id2 = new mongoose.Types.ObjectId().toString();

/**
 * Mongoose-like chain used by:
 * find/findById -> populate -> select -> sort
 *
 * The important part is that the final object is thenable, because the
 * service awaits the query after chaining methods.
 */
const query = (value) => {
  const q = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn(() => Promise.resolve(value)),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
    catch: (reject) => Promise.resolve(value).catch(reject),
  };
  return q;
};

const leanQuery = (value) => ({
  lean: jest.fn(() => Promise.resolve(value)),
});

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue("hashed");
  });

  test("gets all users without requester", async () => {
    User.find.mockReturnValue(query(["u"]));

    await expect(svc.getAllUsers()).resolves.toEqual(["u"]);
    expect(User.find).toHaveBeenCalledWith();
  });

  test("gets all users for Admin", async () => {
    Role.findById.mockReturnValue(leanQuery({ name: "Admin" }));
    User.find.mockReturnValue(query(["admin-visible-user"]));

    await expect(svc.getAllUsers({ role: id1 }))
      .resolves.toEqual(["admin-visible-user"]);
  });

  test("returns empty users when Manager has no manageable roles", async () => {
    Role.findById.mockReturnValue(
      leanQuery({ name: "Manager", manageableRoles: [] })
    );

    await expect(svc.getAllUsers({ role: id1 })).resolves.toEqual([]);
    expect(User.find).not.toHaveBeenCalled();
  });

  test("gets users scoped to manageable roles", async () => {
    Role.findById.mockReturnValue(
      leanQuery({
        name: "Manager",
        manageableRoles: [{ _id: id2 }, id1],
      })
    );
    User.find.mockReturnValue(query(["managed-user"]));

    await expect(svc.getAllUsers({ role: id1 }))
      .resolves.toEqual(["managed-user"]);

    expect(User.find).toHaveBeenCalledWith({
      role: { $in: [id2, id1] },
    });
  });

  test("gets user by id", async () => {
    User.findById.mockReturnValue(query({ id: "u" }));

    await expect(svc.getUserById("u")).resolves.toEqual({ id: "u" });
    expect(User.findById).toHaveBeenCalledWith("u");
  });

  test("create validates required fields", async () => {
    await expect(svc.createUser({}))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test("create rejects a missing role", async () => {
    Role.findById.mockReturnValue(leanQuery(null));
    Role.findOne.mockReturnValue(leanQuery(null));

    await expect(
      svc.createUser({
        name: "n",
        email: "e",
        username: "u",
        password: "p",
        role: "Nope",
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("create enforces manageable roles", async () => {
    const role = { _id: id2, name: "Member" };

    Role.findById.mockReturnValue(leanQuery(role));

    // requestingUser.role is "Manager", so resolveRole uses findOne().lean().
    Role.findOne.mockReturnValue(
      leanQuery({
        name: "Manager",
        manageableRoles: [id1],
      })
    );

    await expect(
      svc.createUser({
        name: "n",
        email: "e",
        username: "u",
        password: "p",
        role: id2,
        requestingUser: { role: "Manager" },
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("create rejects duplicate email or username", async () => {
    const role = { _id: id2, name: "Member" };

    Role.findById.mockReturnValue(leanQuery(role));

    // First findOne = resolve requesting role.
    // Second findOne = duplicate user lookup.
    Role.findOne
      .mockReturnValueOnce(
        leanQuery({
          name: "Manager",
          manageableRoles: [id2],
        })
      );

    User.findOne.mockResolvedValue({ _id: "existing-user" });

    await expect(
      svc.createUser({
        name: "n",
        email: "e",
        username: "u",
        password: "p",
        role: id2,
        requestingUser: { role: "Manager" },
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test("creates user and returns populated user", async () => {
    const role = { _id: id2, name: "Member" };
    const created = { _id: id1 };
    const returnedUser = { id: id1 };

    Role.findById.mockReturnValue(leanQuery(role));
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(created);
    User.findById.mockReturnValue(query(returnedUser));

    await expect(
      svc.createUser({
        name: " N ",
        email: " E ",
        username: " U ",
        password: "p",
        role: id2,
      })
    ).resolves.toEqual(returnedUser);

    expect(bcrypt.hash).toHaveBeenCalledWith("p", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "N",
      email: "e",
      username: "u",
      password: "hashed",
      role: id2,
      createdBy: null,
    });
  });

  test("update returns 404 for missing user", async () => {
    User.findById.mockResolvedValue(null);

    await expect(svc.updateUser("u", {}))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  test("update enforces manageable current role", async () => {
    const user = { role: id2, save: jest.fn() };

    User.findById.mockResolvedValue(user);
    Role.findOne.mockReturnValue(
      leanQuery({
        name: "Manager",
        manageableRoles: [id1],
      })
    );

    await expect(
      svc.updateUser("u", {}, { role: "Manager" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("updates all supported fields", async () => {
    const user = {
      _id: id1,
      role: id2,
      save: jest.fn(),
    };
    const returnedUser = { id: id1 };

    User.findById
      .mockResolvedValueOnce(user)
      .mockReturnValueOnce(query(returnedUser));

    User.findOne.mockResolvedValue(null);
    Role.findById.mockReturnValue(
      leanQuery({ _id: id2, name: "Member" })
    );

    await expect(
      svc.updateUser(id1, {
        name: "N",
        username: " U ",
        email: " E ",
        role: id2,
        password: "p",
        isActive: false,
        profileImage: "/x",
      })
    ).resolves.toEqual(returnedUser);

    expect(user.name).toBe("N");
    expect(user.username).toBe("u");
    expect(user.email).toBe("e");
    expect(user.role).toBe(id2);
    expect(user.isActive).toBe(false);
    expect(user.profileImage).toBe("/x");
    expect(bcrypt.hash).toHaveBeenCalledWith("p", 10);
    expect(user.save).toHaveBeenCalled();
  });

  test("update rejects duplicate username", async () => {
    const user = { _id: id1, role: id2, save: jest.fn() };

    User.findById.mockResolvedValue(user);
    User.findOne.mockResolvedValue({ _id: "other-user" });

    await expect(
      svc.updateUser(id1, { username: "u" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

 test("update rejects duplicate email", async () => {
  const user = {
    _id: id1,
    role: id2,
    save: jest.fn(),
  };

  // IMPORTANT:
  // updateUser() uses User.findById(...).populate(...)
  User.findById.mockReturnValue({
    populate: jest.fn().mockResolvedValue(user),
  });

  // Existing email found => duplicate
  User.findOne.mockResolvedValue({
    _id: id2,
    email: "e",
  });

  await expect(
    svc.updateUser(id1, {
      email: "e",
    })
  ).rejects.toMatchObject({
    statusCode: 409,
  });
});

  test("update rejects a missing role", async () => {
    const user = { _id: id1, role: id2, save: jest.fn() };

    User.findById.mockResolvedValue(user);
    Role.findById.mockReturnValue(leanQuery(null));
    Role.findOne.mockReturnValue(leanQuery(null));

    await expect(
      svc.updateUser(id1, { role: "Nope" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("delete prevents deleting yourself", async () => {
    await expect(svc.deleteUser(id1, id1))
      .rejects.toMatchObject({ statusCode: 400 });

    expect(User.findById).not.toHaveBeenCalled();
  });

  test("delete returns 404 when user does not exist", async () => {
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(svc.deleteUser(id1))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  test("delete enforces manageable roles", async () => {
    const member = {
      role: { _id: id2, name: "Member" },
    };

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(member),
    });

    Role.findOne.mockReturnValue(
      leanQuery({
        name: "Manager",
        manageableRoles: [],
      })
    );

    await expect(
      svc.deleteUser(id1, null, { role: "Manager" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("delete blocks the last Admin", async () => {
    const admin = {
      role: { _id: id2, name: "Admin" },
    };

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(admin),
    });
    Role.findOne.mockResolvedValue({ _id: id2 });
    User.countDocuments.mockResolvedValue(1);

    await expect(svc.deleteUser(id1))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test("delete succeeds when more than one Admin exists", async () => {
    const admin = {
      role: { _id: id2, name: "Admin" },
    };

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(admin),
    });
    Role.findOne.mockResolvedValue({ _id: id2 });
    User.countDocuments.mockResolvedValue(2);
    User.findByIdAndDelete.mockResolvedValue(admin);

    await expect(svc.deleteUser(id1)).resolves.toBe(true);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(id1);
  });
});
