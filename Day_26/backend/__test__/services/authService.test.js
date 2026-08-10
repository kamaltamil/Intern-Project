jest.mock("../../models/user", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock("../../models/role", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));
const mongoose = require("mongoose");
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return { ...actual, Types: actual.Types };
});
const User = require("../../models/user"),
  Role = require("../../models/role"),
  bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const svc = require("../../services/authService");
const role = {
  _id: "507f1f77bcf86cd799439011",
  name: "Member",
  color: "#123",
  permissions: [{ resource: "users", action: { view: true, create: true } }],
};
const user = {
  _id: "507f1f77bcf86cd799439012",
  name: "John",
  email: "JOHN@EXAMPLE.COM",
  username: "john",
  password: "hashed",
  role,
  profileImage: "/x",
};
const chain = (resolved) => {
  const p = { populate: jest.fn(), lean: jest.fn(), select: jest.fn() };
  p.populate.mockReturnValue(p);
  p.select.mockReturnValue(p);
  p.lean.mockResolvedValue(resolved);
  return p;
};

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue("hashed");
    bcrypt.compare.mockResolvedValue(true);
    User.findByIdAndUpdate.mockResolvedValue({});
  });
  test("creates JWT tokens", () => {
    expect(svc.createAccessToken("u", "Member")).toEqual(expect.any(String));
    expect(svc.createRefreshToken("u")).toEqual(expect.any(String));
  });
  test("gets role document from object, id, name and missing", async () => {
    expect(await svc.getRoleDocument(role)).toBe(role);
    expect(await svc.getRoleDocument()).toBeNull();
    const id = "507f1f77bcf86cd799439011";
    Role.findById.mockReturnValue(chain(role));
    await expect(svc.getRoleDocument(id)).resolves.toBe(role);
    Role.findOne.mockReturnValue(chain(role));
    await expect(svc.getRoleDocument("Member")).resolves.toBe(role);
    Role.findById.mockReturnValue(chain(null));
    Role.findOne.mockReturnValue(chain(role));
    await expect(svc.getRoleDocument(id)).resolves.toBe(role);
  });
  test('normalizes legacy actions permission field', async () => {Role.findOne.mockReturnValue(chain({name:'Member',permissions:[{resource:'users',actions:{view:true,delete:true}}]}));await expect(svc.getRolePermissions('Member')).resolves.toEqual([{resource:'users',action:{view:true,create:false,update:false,delete:true}}]);});
  test("gets normalized role permissions", async () => {
    Role.findOne.mockReturnValue(chain(role));
    await expect(svc.getRolePermissions("Member")).resolves.toEqual([
      {
        resource: "users",
        action: { view: true, create: true, update: false, delete: false },
      },
    ]);
    await expect(svc.getRolePermissions(null)).resolves.toEqual([]);
    Role.findOne.mockReturnValue(chain(null));
    await expect(svc.getRolePermissions("x")).resolves.toEqual([]);
  });
  test("register validates input and duplicate", async () => {
    await expect(svc.registerUser({})).rejects.toMatchObject({
      message: "Name, email, username and password are required",
      statusCode: 400,
    });
    User.findOne.mockResolvedValue({});
    await expect(
      svc.registerUser({ name: "A", email: "a", username: "a", password: "p" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
  test("register uses supplied role and normalizes fields", async () => {
    User.findOne.mockResolvedValue(null);
    Role.findById.mockReturnValue(chain(role));
    User.create.mockResolvedValue({
      _id: "u",
      name: "John",
      email: "john",
      username: "john",
    });
    await expect(
      svc.registerUser({
        name: " John ",
        email: " JOHN ",
        username: " John ",
        password: "pw",
        role: role._id,
      }),
    ).resolves.toEqual({
      _id: "u",
      name: "John",
      email: "john",
      username: "john",
      role: "Member",
      roleColor: "#123",
    });
  });
  test("register falls back to default then Member and errors when no role", async () => {
    User.findOne.mockResolvedValue(null);
    Role.findOne.mockReturnValueOnce(chain(role));
    User.create.mockResolvedValue({
      _id: "u",
      name: "J",
      email: "e",
      username: "u",
    });
    await expect(
      svc.registerUser({ name: "J", email: "e", username: "u", password: "p" }),
    ).resolves.toHaveProperty("role", "Member");
    Role.findOne.mockReturnValue(chain(null));
    await expect(
      svc.registerUser({ name: "J", email: "e", username: "u", password: "p" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
  test("login validates and rejects unknown/wrong password", async () => {
    await expect(svc.loginUser()).rejects.toMatchObject({ statusCode: 400 });
    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
    await expect(svc.loginUser("x", "p")).rejects.toMatchObject({
      statusCode: 401,
    });
    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(user),
    });
    bcrypt.compare.mockResolvedValue(false);
    await expect(svc.loginUser("x", "p")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
  test('login uses default role color when missing', async () => {const noColorRole={...role,color:undefined};const noColorUser={...user,role:noColorRole};User.findOne.mockReturnValue({populate:jest.fn().mockResolvedValue(noColorUser)});bcrypt.compare.mockResolvedValue(true);await expect(svc.loginUser('john','password')).resolves.toMatchObject({user:{roleColor:'#722ed1'}});});
  test("login succeeds and stores tokens", async () => {
    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(user),
    });
    bcrypt.compare.mockResolvedValue(true);
    await expect(svc.loginUser(" John ", "pw")).resolves.toMatchObject({
      role: "Member",
      permissions: [
        {
          resource: "users",
          action: { view: true, create: true, update: false, delete: false },
        },
      ],
    });
    expect(User.findByIdAndUpdate).toHaveBeenCalled();
  });
  test("refresh validates, verifies and rotates tokens", async () => {
    await expect(svc.refreshAccessToken()).rejects.toMatchObject({
      statusCode: 400,
    });
    const good = svc.createRefreshToken("u");
    const decoded = jwt.decode(good);
    User.findById.mockReturnValue({
      populate: jest
        .fn()
        .mockResolvedValue({ ...user, refreshToken: "stored" }),
    });
    bcrypt.compare.mockResolvedValue(true);
    await expect(svc.refreshAccessToken(good)).resolves.toHaveProperty(
      "role",
      "Member",
    );
    expect(decoded.userId).toBe("u");
    await expect(svc.refreshAccessToken("bad")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
  test("refresh rejects missing payload, missing user, missing stored token and mismatch", async () => {
    const fake = jwt.sign({ foo: "bar" }, "dev-refresh-secret");
    await expect(svc.refreshAccessToken(fake)).rejects.toMatchObject({
      statusCode: 401,
    });
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
    const good = svc.createRefreshToken("u");
    await expect(svc.refreshAccessToken(good)).rejects.toMatchObject({
      statusCode: 401,
    });
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ ...user, refreshToken: null }),
    });
    await expect(svc.refreshAccessToken(good)).rejects.toMatchObject({
      statusCode: 401,
    });
    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ ...user, refreshToken: "x" }),
    });
    bcrypt.compare.mockResolvedValue(false);
    await expect(svc.refreshAccessToken(good)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
  test("profile returns null or normalized profile", async () => {
    User.findById.mockReturnValue(chain(null));
    await expect(svc.getProfile("u")).resolves.toBeNull();
    User.findById.mockReturnValue(chain(user));
    await expect(svc.getProfile("u")).resolves.toMatchObject({
      role: "Member",
      user: { name: "John" },
    });
  });
  test("generateAndStoreTokens stores hash", async () => {
    await expect(svc.generateAndStoreTokens("u", "Member")).resolves.toEqual({
      token: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(bcrypt.hash).toHaveBeenCalled();
  });
  test("handles invalid permissions format", async () => {
    Role.findOne.mockReturnValue(
      chain({
        name: "Member",
        permissions: null,
      }),
    );

    await expect(svc.getRolePermissions("Member")).resolves.toEqual([]);
  });

  test("register falls back to Member when no default role exists", async () => {
    User.findOne.mockResolvedValue(null);

    Role.findOne
      .mockReturnValueOnce(chain(null)) // default role
      .mockReturnValueOnce(chain(role)); // Member role

    User.create.mockResolvedValue({
      _id: "u",
      name: "John",
      email: "john",
      username: "john",
    });

    await expect(
      svc.registerUser({
        name: "John",
        email: "john",
        username: "john",
        password: "password",
      }),
    ).resolves.toMatchObject({
      role: "Member",
    });
  });

  test("login resolves role when populated role is missing", async () => {
    const userWithoutRoleName = {
      ...user,
      role: "Member",
    };

    User.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(userWithoutRoleName),
    });

    Role.findOne.mockReturnValue(chain(role));
    bcrypt.compare.mockResolvedValue(true);

    await expect(svc.loginUser("john", "password")).resolves.toMatchObject({
      role: "Member",
    });
  });

  test('refresh uses default role color path', async () => {const refreshToken=svc.createRefreshToken('u');const noColorRole={...role,color:undefined};const noColorUser={...user,role:noColorRole,refreshToken:'stored'};User.findById.mockReturnValue({populate:jest.fn().mockResolvedValue(noColorUser)});bcrypt.compare.mockResolvedValue(true);await expect(svc.refreshAccessToken(refreshToken)).resolves.toMatchObject({role:'Member'});});

  test("refresh resolves role when populated role is missing", async () => {
    const refreshToken = svc.createRefreshToken("u");

    const userWithoutRoleName = {
      ...user,
      role: "Member",
      refreshToken: "stored-refresh-token",
    };

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(userWithoutRoleName),
    });

    Role.findOne.mockReturnValue(chain(role));

    bcrypt.compare.mockResolvedValue(true);

    await expect(svc.refreshAccessToken(refreshToken)).resolves.toMatchObject({
      role: "Member",
    });
  });

  test('profile uses default role color when missing', async () => {const noColorRole={...role,color:undefined};const noColorUser={...user,role:noColorRole};User.findById.mockReturnValue(chain(noColorUser));await expect(svc.getProfile('u')).resolves.toMatchObject({user:{roleColor:'#722ed1'}});});

  test("profile resolves role when populated role is missing", async () => {
    const userWithoutRoleName = {
      ...user,
      role: "Member",
    };

    User.findById.mockReturnValue(chain(userWithoutRoleName));

    Role.findOne.mockReturnValue(chain(role));

    await expect(svc.getProfile("u")).resolves.toMatchObject({
      role: "Member",
    });
  });
});
