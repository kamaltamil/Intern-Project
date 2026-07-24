const {
  register,
  login,
  getProfile,
  listUsers,
  deleteUser,
  changeUserData,
  refresh,
} = require("../../controllers/authController");

jest.mock("../../services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getUserProfile: jest.fn(),
  getAllUsers: jest.fn(),
  deleteUserProfile: jest.fn(),
  changeUserDetails: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  deleteUserProfile,
  changeUserDetails,
  refreshAccessToken,
} = require("../../services/authService");

describe("authController.js", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ── register ──────────────────────────────────────────────────

  describe("register()", () => {
    test("should register user successfully", async () => {
      mockReq = { body: { name: "Kamal", email: "k@g.com", password: "123456" } };
      registerUser.mockResolvedValue({ user: { name: "Kamal" }, token: "tok" });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Registration successful",
        data: { user: { name: "Kamal" }, token: "tok" },
      });
    });

    test("should return 400 on registration error", async () => {
      mockReq = { body: { name: "Kamal" } };
      registerUser.mockRejectedValue(new Error("User already exists"));

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User already exists",
      });
    });
  });

  // ── login ─────────────────────────────────────────────────────

  describe("login()", () => {
    test("should login user successfully", async () => {
      mockReq = { body: { email: "k@g.com", password: "123456" } };
      loginUser.mockResolvedValue({ user: { name: "Kamal" }, token: "tok" });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: { user: { name: "Kamal" }, token: "tok" },
      });
    });

    test("should return 401 on login error", async () => {
      mockReq = { body: { email: "wrong@g.com", password: "wrong" } };
      loginUser.mockRejectedValue(new Error("Invalid email or password"));

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password",
      });
    });
  });

  // ── getProfile ────────────────────────────────────────────────

  describe("getProfile()", () => {
    test("should return user profile", async () => {
      mockReq = { user: { _id: "u1" } };
      getUserProfile.mockResolvedValue({ name: "Kamal", email: "k@g.com" });

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { name: "Kamal", email: "k@g.com" },
      });
    });

    test("should return 404 when user not found", async () => {
      mockReq = { user: { _id: "u999" } };
      getUserProfile.mockResolvedValue(null);

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    test("should return 500 on error", async () => {
      mockReq = { user: { _id: "u1" } };
      getUserProfile.mockRejectedValue(new Error("DB error"));

      await getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── listUsers ─────────────────────────────────────────────────

  describe("listUsers()", () => {
    test("should return all users", async () => {
      mockReq = {};
      getAllUsers.mockResolvedValue([{ name: "Kamal" }]);

      await listUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [{ name: "Kamal" }],
      });
    });

    test("should return 500 on error", async () => {
      mockReq = {};
      getAllUsers.mockRejectedValue(new Error("DB error"));

      await listUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── deleteUser ────────────────────────────────────────────────

  describe("deleteUser()", () => {
    test("should delete user successfully", async () => {
      mockReq = { params: { _id: "u2" } };
      deleteUserProfile.mockResolvedValue({ _id: "u2" });
      getAllUsers.mockResolvedValue([{ name: "Kamal" }]);

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        data: [{ name: "Kamal" }],
      });
    });

    test("should return 404 when user not found", async () => {
      mockReq = { params: { _id: "u999" } };
      deleteUserProfile.mockResolvedValue(null);

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should return 500 on error", async () => {
      mockReq = { params: { _id: "u2" } };
      deleteUserProfile.mockRejectedValue(new Error("DB error"));

      await deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── changeUserData ────────────────────────────────────────────

  describe("changeUserData()", () => {
    test("should update user successfully with name and email", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: "Updated", email: "updated@g.com" },
      };
      changeUserDetails.mockResolvedValue({ name: "Updated" });

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "User data updated successfully",
        data: { name: "Updated" },
      });
    });

    test("should update user with role only", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { role: "Admin" },
      };
      changeUserDetails.mockResolvedValue({ role: "Admin" });

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("should return 400 when no fields to update", async () => {
      mockReq = {
        params: { id: "u1" },
        body: {},
      };

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Provide at least one field to update",
      });
    });

    test("should return 400 when name is whitespace only", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: "   " },
      };

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 when email is whitespace only", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { email: "   " },
      };

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 when user not found", async () => {
      mockReq = {
        params: { id: "u999" },
        body: { name: "Test" },
      };
      changeUserDetails.mockResolvedValue(null);

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should return 400 for ValidationError", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: "Test" },
      };
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      changeUserDetails.mockRejectedValue(error);

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 500 for other errors", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: "Test" },
      };
      changeUserDetails.mockRejectedValue(new Error("DB error"));

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test("should handle non-string name gracefully", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: 123, email: "valid@g.com" },
      };
      changeUserDetails.mockResolvedValue({ email: "valid@g.com" });

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("should handle non-string email gracefully", async () => {
      mockReq = {
        params: { id: "u1" },
        body: { name: "Valid", email: 123 },
      };
      changeUserDetails.mockResolvedValue({ name: "Valid" });

      await changeUserData(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ── refresh ───────────────────────────────────────────────────

  describe("refresh()", () => {
    test("should refresh token successfully", async () => {
      mockReq = { body: { refreshToken: "old-refresh" } };
      refreshAccessToken.mockResolvedValue({ token: "new-token" });

      await refresh(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Token refreshed successfully",
        data: { token: "new-token" },
      });
    });

    test("should return 401 on refresh error", async () => {
      mockReq = { body: {} };
      refreshAccessToken.mockRejectedValue(new Error("Refresh token is required"));

      await refresh(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
