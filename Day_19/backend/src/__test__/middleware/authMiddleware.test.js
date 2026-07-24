const jwt = require("jsonwebtoken");

const authMiddleware = require("../../middleware/authMiddleware");

describe("authMiddleware.js", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.JWT_ACCESS_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return 401 when no authorization header", async () => {
    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Access token is required",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("should return 401 when authorization header lacks Bearer prefix", async () => {
    mockReq.headers.authorization = "Token abc123";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Access token is required",
    });
  });

  test("should return 401 for invalid token", async () => {
    mockReq.headers.authorization = "Bearer invalid-token";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
  });

  test("should return 401 for expired token", async () => {
    const expiredToken = jwt.sign(
      { userId: "u1", role: "Member" },
      "test-secret",
      { expiresIn: "0s" }
    );

    // Wait a moment for the token to expire
    await new Promise((r) => setTimeout(r, 1100));

    mockReq.headers.authorization = `Bearer ${expiredToken}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expired",
    });
  });

  test("should return 401 when token payload lacks userId", async () => {
    const token = jwt.sign({ role: "Member" }, "test-secret", {
      expiresIn: "1h",
    });

    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token payload",
    });
  });

  test("should set req.user and call next() for valid token", async () => {
    const token = jwt.sign(
      { userId: "u1", sub: "sub1", role: "Admin" },
      "test-secret",
      { expiresIn: "1h" }
    );

    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.user).toEqual({
      _id: "u1",
      id: "sub1",
      role: "Admin",
    });
  });

  test("should use default role Member when role is not in token", async () => {
    const token = jwt.sign(
      { userId: "u2" },
      "test-secret",
      { expiresIn: "1h" }
    );

    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.user.role).toBe("Member");
  });

  test("should use userId as id fallback when sub is not present", async () => {
    const token = jwt.sign(
      { userId: "u3" },
      "test-secret",
      { expiresIn: "1h" }
    );

    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user.id).toBe("u3");
  });

  test("should return 500 for unexpected errors", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      const err = new Error("Unexpected error");
      err.name = "UnexpectedError";
      throw err;
    });

    mockReq.headers.authorization = "Bearer some-token";

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected error",
    });
  });
});
