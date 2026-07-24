const mongoose = require("mongoose");

describe("Task Model", () => {
  test("should export a mongoose model", () => {
    const Task = require("../../models/task");
    expect(Task).toBeDefined();
    expect(Task.modelName).toBe("Task");
  });

  test("should have the correct schema fields", () => {
    const Task = require("../../models/task");
    const schemaPaths = Task.schema.paths;

    expect(schemaPaths.title).toBeDefined();
    expect(schemaPaths.description).toBeDefined();
    expect(schemaPaths.priority).toBeDefined();
    expect(schemaPaths.status).toBeDefined();
    expect(schemaPaths.userId).toBeDefined();
    expect(schemaPaths.isDeleted).toBeDefined();
  });

  test("should have timestamps enabled", () => {
    const Task = require("../../models/task");
    const schemaPaths = Task.schema.paths;

    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.updatedAt).toBeDefined();
  });

  test("should have default priority of Medium", () => {
    const Task = require("../../models/task");
    const priorityField = Task.schema.paths.priority;

    expect(priorityField.defaultValue).toBe("Medium");
  });

  test("should have priority enum values", () => {
    const Task = require("../../models/task");
    const priorityField = Task.schema.paths.priority;

    expect(priorityField.enumValues).toContain("Low");
    expect(priorityField.enumValues).toContain("Medium");
    expect(priorityField.enumValues).toContain("High");
  });

  test("should have status enum values", () => {
    const Task = require("../../models/task");
    const statusField = Task.schema.paths.status;

    expect(statusField.enumValues).toContain("Yet to do");
    expect(statusField.enumValues).toContain("In Progress");
    expect(statusField.enumValues).toContain("Completed");
  });

  test("should default isDeleted to false", () => {
    const Task = require("../../models/task");
    const isDeletedField = Task.schema.paths.isDeleted;

    expect(isDeletedField.defaultValue).toBe(false);
  });

  test("should default status to 'Yet to do'", () => {
    const Task = require("../../models/task");
    const statusField = Task.schema.paths.status;

    expect(statusField.defaultValue).toBe("Yet to do");
  });
});
