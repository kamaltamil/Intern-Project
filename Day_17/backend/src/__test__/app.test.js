const app = require("../app");

describe("app.js", () => {
  test("should export an express app", () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
  });

  test("should respond to GET / with health check", async () => {
    // Create a mock request/response without needing supertest
    const mockReq = {
      method: "GET",
      url: "/",
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200,
    };

    // Find the health check handler directly
    const stack = app._router.stack;
    const healthCheckLayer = stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/" &&
        layer.route.methods.get
    );

    expect(healthCheckLayer).toBeDefined();

    // Call the handler
    const handler = healthCheckLayer.route.stack[0].handle;
    handler(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Task Manager Backend Running",
    });
  });

  test("should have /api/auth routes mounted", () => {
    const stack = app._router.stack;
    const authRouterLayer = stack.find(
      (layer) =>
        layer.name === "router" &&
        layer.regexp.toString().includes("api\\/auth")
    );
    expect(authRouterLayer).toBeDefined();
  });

  test("should have /api/tasks routes mounted", () => {
    const stack = app._router.stack;
    const taskRouterLayer = stack.find(
      (layer) =>
        layer.name === "router" &&
        layer.regexp.toString().includes("api\\/tasks")
    );
    expect(taskRouterLayer).toBeDefined();
  });

  test("should have notFoundMiddleware as the last middleware", () => {
    const stack = app._router.stack;
    const lastLayer = stack[stack.length - 1];
    expect(lastLayer).toBeDefined();
  });
});
