/**
 * __test__/routes/api/v1/api.test.js
 *
 * Tests:
 * - API v1 router mounts all route modules
 * - Correct mount paths
 * - Correct middleware/router ordering
 * - Exports the Express router instance
 */

describe("api router", () => {
  let mockRouter;
  let router;

  const authRouter = jest.fn();
  const usersRouter = jest.fn();
  const bookingRouter = jest.fn();
  const roomsRouter = jest.fn();
  const rolesRouter = jest.fn();

  const rateLimiter = jest.fn();
  const authenticateToken = jest.fn();

  beforeEach(() => {
    jest.resetModules();

    // Create a fresh router for every test.
    mockRouter = {
      use: jest.fn(),
    };

    // Mock Express before loading api.js.
    jest.doMock("express", () => ({
      Router: jest.fn(() => mockRouter),
    }));

    // Mock API route modules.
    jest.doMock("../../../../routes/api/v1/auth", () => authRouter);
    jest.doMock("../../../../routes/api/v1/users", () => usersRouter);
    jest.doMock("../../../../routes/api/v1/booking", () => bookingRouter);
    jest.doMock("../../../../routes/api/v1/rooms", () => roomsRouter);
    jest.doMock("../../../../routes/api/v1/roles", () => rolesRouter);

    // Mock middleware used by api.js.
    jest.doMock("../../../../middleware/auth", () => ({
      authenticateToken,
    }));

    jest.doMock("../../../../config/rateLimiting", () => ({
      rateLimiter,
    }));

    // IMPORTANT:
    // api.js must be required AFTER all mocks are registered.
    router = require("../../../../routes/api/v1/api");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("mounts all API modules", () => {
    expect(mockRouter.use).toHaveBeenCalledTimes(5);

    expect(
      mockRouter.use.mock.calls.map((call) => call[0])
    ).toEqual([
      "/users",
      "/manage/users",
      "/booking",
      "/rooms",
      "/roles",
    ]);
  });

  test("mounts users API", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      "/users",
      authRouter
    );
  });

  test("mounts manage users API", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      "/manage/users",
      rateLimiter,
      authenticateToken,
      usersRouter
    );
  });

  test("mounts booking API", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      "/booking",
      rateLimiter,
      authenticateToken,
      bookingRouter
    );
  });

  test("mounts rooms API", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      "/rooms",
      rateLimiter,
      authenticateToken,
      roomsRouter
    );
  });

  test("mounts roles API", () => {
    expect(mockRouter.use).toHaveBeenCalledWith(
      "/roles",
      rateLimiter,
      authenticateToken,
      rolesRouter
    );
  });

  test("uses rate limiter for protected APIs", () => {
    const calls = mockRouter.use.mock.calls;

    expect(calls[1]).toEqual([
      "/manage/users",
      rateLimiter,
      authenticateToken,
      usersRouter,
    ]);

    expect(calls[2]).toEqual([
      "/booking",
      rateLimiter,
      authenticateToken,
      bookingRouter,
    ]);

    expect(calls[3]).toEqual([
      "/rooms",
      rateLimiter,
      authenticateToken,
      roomsRouter,
    ]);

    expect(calls[4]).toEqual([
      "/roles",
      rateLimiter,
      authenticateToken,
      rolesRouter,
    ]);
  });

  test("exports the same Express router", () => {
    expect(router).toBe(mockRouter);
  });
});