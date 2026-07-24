const {
  buildLoginQuery,
  normalizeRegistrationInput,
  loginUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  changeUserDetails,
  deleteUserProfile,
  refreshAccessToken,
} = require("../../services/authService");

jest.mock("../../models/user");
const User = require("../../models/user");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("authService.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "access-secret";
    process.env.JWT_REFRESH_SECRET = "refresh-secret";
  });

  // ── buildLoginQuery ───────────────────────────────────────────

  describe("buildLoginQuery()", () => {
    test("should build query with email", () => {
      const result = buildLoginQuery({ email: "k@g.com" });
      expect(result.$or).toEqual([
        { email: "k@g.com" },
        { username: "k@g.com" },
      ]);
    });

    test("should build query with username when email is absent", () => {
      const result = buildLoginQuery({ username: "kamal" });
      expect(result.$or).toEqual([
        { email: "kamal" },
        { username: "kamal" },
      ]);
    });

    test("should prefer email over username", () => {
      const result = buildLoginQuery({ email: "k@g.com", username: "kamal" });
      expect(result.$or[0].email).toBe("k@g.com");
    });
  });

  // ── normalizeRegistrationInput ────────────────────────────────

  describe("normalizeRegistrationInput()", () => {
    test("should normalize with all fields", () => {
      const result = normalizeRegistrationInput({
        name: "Kamal",
        email: "k@g.com",
        password: "123456",
        username: "kamal",
      });
      expect(result).toEqual({
        name: "Kamal",
        email: "k@g.com",
        password: "123456",
        username: "kamal",
      });
    });

    test("should use username as name fallback", () => {
      const result = normalizeRegistrationInput({
        email: "k@g.com",
        password: "123456",
        username: "kamal",
      });
      expect(result.name).toBe("kamal");
    });

    test("should use 'user' as name when no name or username", () => {
      const result = normalizeRegistrationInput({
        email: "k@g.com",
        password: "123456",
      });
      expect(result.name).toBe("user");
    });

    test("should generate email from username when email is absent", () => {
      const result = normalizeRegistrationInput({
        name: "Kamal",
        password: "123456",
        username: "kamal",
      });
      expect(result.email).toBe("kamal@local.dev");
    });

    test("should use name as username when username is absent", () => {
      const result = normalizeRegistrationInput({
        name: "Kamal",
        email: "k@g.com",
        password: "123456",
      });
      expect(result.username).toBe("Kamal");
    });
  });

  // ── registerUser ──────────────────────────────────────────────

  describe("registerUser()", () => {
    test("should register a new user successfully", async () => {
      User.findOne.mockResolvedValueOnce(null); // No existing user
      User.findOne.mockResolvedValueOnce(null); // ensureUniqueUsername
      bcrypt.hash.mockResolvedValueOnce("hashed-password"); // password hash
      User.create.mockResolvedValue({ _id: "u1", role: "Member" });
      jwt.sign.mockReturnValueOnce("access-token"); // access token
      jwt.sign.mockReturnValueOnce("refresh-token"); // refresh token
      bcrypt.hash.mockResolvedValueOnce("hashed-refresh"); // refresh hash
      User.findByIdAndUpdate.mockResolvedValue({});
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u1", name: "Kamal" }),
      });

      const result = await registerUser({
        name: "Kamal",
        email: "k@g.com",
        password: "123456",
        username: "kamal",
      });

      expect(result.token).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user).toEqual({ _id: "u1", name: "Kamal" });
    });

    test("should throw error if user already exists", async () => {
      User.findOne.mockResolvedValueOnce({ _id: "u1" });

      await expect(
        registerUser({
          name: "Kamal",
          email: "k@g.com",
          password: "123456",
        })
      ).rejects.toThrow("User already exists");
    });

    test("should generate unique username when conflict exists", async () => {
      User.findOne.mockResolvedValueOnce(null); // No existing user for $or check
      User.findOne.mockResolvedValueOnce({ username: "kamal" }); // First call: conflict on base
      User.findOne.mockResolvedValueOnce({ username: "kamal1" }); // Second call: conflict on kamal1
      User.findOne.mockResolvedValueOnce(null); // Third call: kamal2 is free
      bcrypt.hash.mockResolvedValueOnce("hashed-pw");
      User.create.mockResolvedValue({ _id: "u1", role: "Member" });
      jwt.sign.mockReturnValueOnce("at").mockReturnValueOnce("rt");
      bcrypt.hash.mockResolvedValueOnce("hrt");
      User.findByIdAndUpdate.mockResolvedValue({});
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u1" }),
      });

      const result = await registerUser({
        name: "Kamal",
        email: "k@g.com",
        password: "123456",
        username: "kamal",
      });

      expect(result).toBeDefined();
    });

    test("should handle missing username in registration (falsy username cover)", async () => {
      User.findOne.mockResolvedValueOnce(null); // No existing user check
      User.findOne.mockResolvedValueOnce(null); // Unique check for default username "user"
      bcrypt.hash.mockResolvedValueOnce("hashed-pw");
      User.create.mockResolvedValue({ _id: "u2", role: "Member" });
      jwt.sign.mockReturnValueOnce("at").mockReturnValueOnce("rt");
      bcrypt.hash.mockResolvedValueOnce("hrt");
      User.findByIdAndUpdate.mockResolvedValue({});
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u2" }),
      });

      const result = await registerUser({
        name: undefined,
        email: "k@g.com",
        password: "123456",
        username: undefined,
      });

      expect(result).toBeDefined();
    });
  });

  // ── loginUser ─────────────────────────────────────────────────

  describe("loginUser()", () => {
    test("should login successfully", async () => {
      User.findOne.mockResolvedValue({
        _id: "u1",
        password: "hashed",
        role: "Admin",
      });
      bcrypt.compare.mockResolvedValueOnce(true); // password match
      jwt.sign.mockReturnValueOnce("access-token");
      jwt.sign.mockReturnValueOnce("refresh-token");
      bcrypt.hash.mockResolvedValueOnce("hashed-refresh");
      User.findByIdAndUpdate.mockResolvedValue({});
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u1", name: "Kamal" }),
      });

      const result = await loginUser({
        email: "k@g.com",
        password: "123456",
      });

      expect(result.token).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    test("should throw when user not found", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        loginUser({ email: "wrong@g.com", password: "123456" })
      ).rejects.toThrow("Invalid email or password");
    });

    test("should throw when password is invalid", async () => {
      User.findOne.mockResolvedValue({
        _id: "u1",
        password: "hashed",
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        loginUser({ email: "k@g.com", password: "wrong" })
      ).rejects.toThrow("Invalid email or password");
    });
  });

  // ── getUserProfile ────────────────────────────────────────────

  describe("getUserProfile()", () => {
    test("should return user profile", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "u1", name: "Kamal" }),
      });

      const result = await getUserProfile("u1");
      expect(result).toEqual({ _id: "u1", name: "Kamal" });
    });

    test("should return null when user not found", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await getUserProfile("u999");
      expect(result).toBeNull();
    });
  });

  // ── getAllUsers ────────────────────────────────────────────────

  describe("getAllUsers()", () => {
    test("should return all users sorted by createdAt", async () => {
      const mockSort = jest.fn().mockResolvedValue([{ name: "Kamal" }]);
      const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
      User.find.mockReturnValue({ select: mockSelect });

      const result = await getAllUsers();
      expect(result).toEqual([{ name: "Kamal" }]);
      expect(User.find).toHaveBeenCalledWith({});
    });
  });

  // ── changeUserDetails ─────────────────────────────────────────

  describe("changeUserDetails()", () => {
    test("should update user with object updates", async () => {
      const mockSelect = jest.fn().mockResolvedValue({ _id: "u1", name: "Updated" });
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      const result = await changeUserDetails("u1", { name: "Updated" });
      expect(result).toEqual({ _id: "u1", name: "Updated" });
    });

    test("should handle string name and email arguments", async () => {
      const mockSelect = jest.fn().mockResolvedValue({ _id: "u1" });
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await changeUserDetails("u1", "NewName", "new@g.com");

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        { name: "NewName", email: "new@g.com" },
        { new: true, runValidators: true }
      );
    });
  });

  // ── deleteUserProfile ─────────────────────────────────────────

  describe("deleteUserProfile()", () => {
    test("should delete user", async () => {
      User.findOneAndDelete.mockResolvedValue({ _id: "u1" });

      const result = await deleteUserProfile("u1");
      expect(result).toEqual({ _id: "u1" });
    });

    test("should return null when user not found", async () => {
      User.findOneAndDelete.mockResolvedValue(null);

      const result = await deleteUserProfile("u999");
      expect(result).toBeNull();
    });
  });

  // ── refreshAccessToken ────────────────────────────────────────

  describe("refreshAccessToken()", () => {
    test("should refresh access token successfully", async () => {
      jwt.verify.mockReturnValue({ userId: "u1" });
      User.findById.mockResolvedValueOnce({
        _id: "u1",
        refreshToken: "hashed-refresh",
        role: "Admin",
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce("new-access-token");
      User.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ _id: "u1", name: "Kamal" }),
      });

      const result = await refreshAccessToken({ refreshToken: "old-refresh" });

      expect(result.token).toBe("new-access-token");
    });

    test("should throw when refreshToken is missing", async () => {
      await expect(
        refreshAccessToken({})
      ).rejects.toThrow("Refresh token is required");
    });

    test("should throw when user not found", async () => {
      jwt.verify.mockReturnValue({ userId: "u999" });
      User.findById.mockResolvedValueOnce(null);

      await expect(
        refreshAccessToken({ refreshToken: "some-token" })
      ).rejects.toThrow("Invalid refresh token");
    });

    test("should throw when refresh token comparison fails", async () => {
      jwt.verify.mockReturnValue({ userId: "u1" });
      User.findById.mockResolvedValueOnce({
        _id: "u1",
        refreshToken: "hashed",
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        refreshAccessToken({ refreshToken: "wrong-token" })
      ).rejects.toThrow("Invalid refresh token");
    });
  });
});
