const {
  canAccessTaskActions,
  canAccessUserManagement,
  userManagementMiddleware,
} = require("../../utils/rbac");

describe("rbac.js", () => {
  describe("canAccessTaskActions()", () => {
    test("should return true for Member", () => {
      expect(canAccessTaskActions("Member")).toBe(true);
    });

    test("should return true for Admin", () => {
      expect(canAccessTaskActions("Admin")).toBe(true);
    });

    test("should return false for unknown role", () => {
      expect(canAccessTaskActions("Guest")).toBe(false);
    });

    test("should return false for undefined role", () => {
      expect(canAccessTaskActions(undefined)).toBe(false);
    });
  });

  describe("canAccessUserManagement()", () => {
    test("should return true for Admin", () => {
      expect(canAccessUserManagement("Admin")).toBe(true);
    });

    test("should return false for Member", () => {
      expect(canAccessUserManagement("Member")).toBe(false);
    });

    test("should return false for unknown role", () => {
      expect(canAccessUserManagement("Guest")).toBe(false);
    });
  });

  describe("userManagementMiddleware()", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    test("should call next() for Admin users", () => {
      mockReq = { user: { role: "Admin" } };

      userManagementMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should return 403 for Member users", () => {
      mockReq = { user: { role: "Member" } };

      userManagementMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized access",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return 403 when user is null", () => {
      mockReq = { user: null };

      userManagementMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test("should return 403 when user.role is undefined", () => {
      mockReq = { user: {} };

      userManagementMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
