const mongoose = require("mongoose");

describe("User Model", () => {
  test("should export a mongoose model", () => {
    const User = require("../../models/user");
    expect(User).toBeDefined();
    expect(User.modelName).toBe("User");
  });

  test("should have the correct schema fields", () => {
    const User = require("../../models/user");
    const schemaPaths = User.schema.paths;

    expect(schemaPaths.name).toBeDefined();
    expect(schemaPaths.email).toBeDefined();
    expect(schemaPaths.username).toBeDefined();
    expect(schemaPaths.password).toBeDefined();
    expect(schemaPaths.refreshToken).toBeDefined();
    expect(schemaPaths.role).toBeDefined();
  });

  test("should have timestamps enabled", () => {
    const User = require("../../models/user");
    const schemaPaths = User.schema.paths;

    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.updatedAt).toBeDefined();
  });

  test("should have default role of Member", () => {
    const User = require("../../models/user");
    const roleField = User.schema.paths.role;

    expect(roleField.defaultValue).toBe("Member");
  });

  test("should have role enum values", () => {
    const User = require("../../models/user");
    const roleField = User.schema.paths.role;

    expect(roleField.enumValues).toContain("Member");
    expect(roleField.enumValues).toContain("Admin");
  });
});
