import {
  hasPermission,
  hasAnyPermission,
  canView,
  canCreate,
  canUpdate,
  canDelete,
} from "../../utils/hasPermission";

const permissions = [
  { resource: "users", action: { view: true, create: true, update: false, delete: false } },
  { resource: "roles", action: { view: false, create: false, update: true, delete: true } },
];

test("checks exact permissions case-insensitively", () => {
  expect(hasPermission(permissions, "USERS", "view")).toBe(true);
  expect(hasPermission(permissions, "users", "create")).toBe(true);
  expect(hasPermission(permissions, "users", "update")).toBe(false);
  expect(hasPermission(permissions, "missing", "view")).toBe(false);
});

test("handles invalid permission inputs", () => {
  expect(hasPermission(null, "users", "view")).toBe(false);
  expect(hasPermission([], "", "view")).toBe(false);
  expect(hasPermission(permissions, "users", "")).toBe(false);
  expect(hasPermission([{ resource: "x" }], "x", "view")).toBe(false);
  expect(hasPermission([{ resource: null, action: {} }], "x", "view")).toBe(false);
});

test("checks whether any action exists", () => {
  expect(hasAnyPermission(permissions, "roles")).toBe(true);
  expect(hasAnyPermission(permissions, "users")).toBe(true);
  expect(hasAnyPermission(permissions, "missing")).toBe(false);
  expect(hasAnyPermission(null, "users")).toBe(false);
  expect(hasAnyPermission(permissions, "")).toBe(false);
  expect(hasAnyPermission([{ resource: "x" }], "x")).toBe(false);
});

test("exposes CRUD helpers", () => {
  expect(canView(permissions, "users")).toBe(true);
  expect(canCreate(permissions, "users")).toBe(true);
  expect(canUpdate(permissions, "users")).toBe(false);
  expect(canDelete(permissions, "roles")).toBe(true);
});
