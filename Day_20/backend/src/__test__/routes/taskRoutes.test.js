describe("taskRoutes.js", () => {
  test("should export an express router", () => {
    const router = require("../../routes/taskRoutes");
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });

  test("should have route stack defined", () => {
    const router = require("../../routes/taskRoutes");
    expect(router.stack).toBeDefined();
    expect(Array.isArray(router.stack)).toBe(true);
  });

  test("should have GET / route", () => {
    const router = require("../../routes/taskRoutes");
    const getRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/" &&
        layer.route.methods.get
    );
    expect(getRoute).toBeDefined();
  });

  test("should have GET /dashboard route", () => {
    const router = require("../../routes/taskRoutes");
    const dashRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/dashboard" &&
        layer.route.methods.get
    );
    expect(dashRoute).toBeDefined();
  });

  test("should have GET /:id route", () => {
    const router = require("../../routes/taskRoutes");
    const getByIdRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/:id" &&
        layer.route.methods.get
    );
    expect(getByIdRoute).toBeDefined();
  });

  test("should have POST / route", () => {
    const router = require("../../routes/taskRoutes");
    const postRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/" &&
        layer.route.methods.post
    );
    expect(postRoute).toBeDefined();
  });

  test("should have PUT /:id route", () => {
    const router = require("../../routes/taskRoutes");
    const putRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/:id" &&
        layer.route.methods.put
    );
    expect(putRoute).toBeDefined();
  });

  test("should have DELETE /:id route", () => {
    const router = require("../../routes/taskRoutes");
    const deleteRoute = router.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === "/:id" &&
        layer.route.methods.delete
    );
    expect(deleteRoute).toBeDefined();
  });
});
