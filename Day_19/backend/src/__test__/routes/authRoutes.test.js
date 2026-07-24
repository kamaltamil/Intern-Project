describe("authRoutes.js", () => {
  test("should export an express router", () => {
    const router = require("../../routes/authRoutes");
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });

  test("should have route stack defined", () => {
    const router = require("../../routes/authRoutes");
    expect(router.stack).toBeDefined();
    expect(Array.isArray(router.stack)).toBe(true);
  });

  test("should have POST /register route", () => {
    const router = require("../../routes/authRoutes");
    const registerRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/register" &&
        layer.route.methods.post
    );
    expect(registerRoute).toBeDefined();
  });

  test("should have POST /login route", () => {
    const router = require("../../routes/authRoutes");
    const loginRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/login" &&
        layer.route.methods.post
    );
    expect(loginRoute).toBeDefined();
  });

  test("should have POST /refresh route", () => {
    const router = require("../../routes/authRoutes");
    const refreshRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/refresh" &&
        layer.route.methods.post
    );
    expect(refreshRoute).toBeDefined();
  });

  test("should have GET /profile route", () => {
    const router = require("../../routes/authRoutes");
    const profileRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/profile" &&
        layer.route.methods.get
    );
    expect(profileRoute).toBeDefined();
  });

  test("should have GET /users route", () => {
    const router = require("../../routes/authRoutes");
    const usersRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/users" &&
        layer.route.methods.get
    );
    expect(usersRoute).toBeDefined();
  });

  test("should have PATCH /users/:id route", () => {
    const router = require("../../routes/authRoutes");
    const patchRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/users/:id" &&
        layer.route.methods.patch
    );
    expect(patchRoute).toBeDefined();
  });

  test("should have DELETE /users/:id route", () => {
    const router = require("../../routes/authRoutes");
    const deleteRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/users/:id" &&
        layer.route.methods.delete
    );
    expect(deleteRoute).toBeDefined();
  });
});
