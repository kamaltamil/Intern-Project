import { store, persistor } from "../../store/store";

test("creates the persisted Redux store", () => {
  const state = store.getState();
  expect(state).toHaveProperty("auth");
  expect(state).toHaveProperty("dashboard");
  expect(state).toHaveProperty("booking");
  expect(state).toHaveProperty("user");
  expect(state).toHaveProperty("role");
  expect(persistor).toBeDefined();
});
