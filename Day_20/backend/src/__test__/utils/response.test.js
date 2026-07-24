const { successResponse, errorResponse } = require("../../utils/response");

describe("response.js", () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("successResponse()", () => {
    test("should return 200 with default message", () => {
      successResponse(mockRes, { name: "Kamal" });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Success",
        data: { name: "Kamal" },
      });
    });

    test("should return custom status and message", () => {
      successResponse(mockRes, { id: 1 }, "Created", 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Created",
        data: { id: 1 },
      });
    });

    test("should return null data", () => {
      successResponse(mockRes, null);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Success",
        data: null,
      });
    });
  });

  describe("errorResponse()", () => {
    test("should return 500 with default message", () => {
      errorResponse(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Something went wrong",
      });
    });

    test("should return custom status and message", () => {
      errorResponse(mockRes, "Not Found", 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Found",
      });
    });
  });
});
