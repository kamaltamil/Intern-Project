import { store, persistor } from "../../store";

describe("store/index.js", () => {
  test("should export a store object", () => {
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe("function");
    expect(typeof store.dispatch).toBe("function");
  });

  test("should have auth reducer", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
  });

  test("should have tasks reducer", () => {
    const state = store.getState();
    expect(state).toHaveProperty("tasks");
  });

  test("should have users reducer", () => {
    const state = store.getState();
    expect(state).toHaveProperty("users");
  });

  test("should export a persistor object", () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe("function");
  });
});
