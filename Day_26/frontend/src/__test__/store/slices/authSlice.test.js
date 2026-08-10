import reducer, {
  startLoading, setAuth, setTokens, updateUserProfile, setRolePermissions,
  setTheme, setError, logout
} from "../../../store/slices/authSlice";

const initial = reducer(undefined, { type: "@@init" });

test("returns initial state", () => {
  expect(initial).toMatchObject({ user: null, token: null, role: null, permissions: [], theme: "light", loading: false, error: null });
});

test("handles loading and auth", () => {
  expect(reducer(initial, startLoading())).toMatchObject({ loading: true, error: null });
  const state = reducer(initial, setAuth({
    user: { name: "A", role: "Member" }, token: "t", refreshToken: "r",
    role: "Manager", permissions: [{ resource: "users" }],
  }));
  expect(state).toMatchObject({ user: { name: "A", role: "Member" }, token: "t", refreshToken: "r", role: "Manager", loading: false });
});

test("setAuth uses fallbacks", () => {
  const state = reducer(initial, setAuth({ user: { role: "Member" }, permissions: "bad" }));
  expect(state.user).toEqual({ role: "Member" });
  expect(state.role).toBe("Member");
  expect(state.permissions).toEqual([]);
});

test("updates tokens and optional role/permissions", () => {
  let state = reducer(initial, setTokens({ token: "t", refreshToken: "r", role: "Admin", permissions: [] }));
  expect(state.token).toBe("t");
  state = reducer(state, setTokens({ token: "", refreshToken: "", role: "", permissions: "bad" }));
  expect(state.token).toBe("t");
});

test("updates profile and role forms", () => {
  let state = reducer({ ...initial, user: { name: "A" } }, updateUserProfile({ name: "B", role: { name: "Admin" }, permissions: [] }));
  expect(state.user.name).toBe("B");
  expect(state.role).toBe("Admin");
  state = reducer(state, updateUserProfile({ role: "Manager", permissions: [{ resource: "x" }] }));
  expect(state.role).toBe("Manager");
});

test("sets role permissions, theme and errors", () => {
  let state = reducer(initial, setRolePermissions({ role: "Admin", permissions: [{ resource: "x" }] }));
  expect(state.role).toBe("Admin");
  state = reducer(state, setTheme("dark"));
  expect(state.theme).toBe("dark");
  state = reducer(state, setError("oops"));
  expect(state.error).toBe("oops");
  expect(state.loading).toBe(false);
});

test("logout clears state", () => {
  const state = reducer({
    ...initial, user: { name: "A" }, token: "t", refreshToken: "r", role: "Admin",
    permissions: [{ resource: "x" }], loading: true, error: "x"
  }, logout());
  expect(state).toEqual(initial);
});
