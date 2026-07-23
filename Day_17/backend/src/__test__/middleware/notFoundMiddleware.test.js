const notFoundMiddleware = require("../../middleware/notFoundMiddleware");

describe("notFoundMiddleware.js", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return 404 with route in message", () => {
    mockReq = { originalUrl: "/api/unknown" };

    notFoundMiddleware(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Route /api/unknown not found",
    });
  });

  test("should handle root route", () => {
    mockReq = { originalUrl: "/" };

    notFoundMiddleware(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Route / not found",
    });
  });
});
