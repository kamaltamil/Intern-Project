const {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
  getDashboardStats,
} = require("../../services/taskService");

jest.mock("../../models/task");
const Task = require("../../models/task");

describe("taskService.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getTasks ──────────────────────────────────────────────────

  describe("getTasks()", () => {
    test("should return paginated tasks", async () => {
      Task.countDocuments.mockResolvedValue(10);

      const mockLimit = jest.fn().mockResolvedValue([{ title: "Task 1" }]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      Task.find.mockReturnValue({ populate: mockPopulate });

      const result = await getTasks({
        userId: "u1",
        search: "Task",
        page: 1,
        limit: 5,
      });

      expect(result.total).toBe(10);
      expect(result.data).toEqual([{ title: "Task 1" }]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(2);
    });

    test("should use default values for page, limit, and search", async () => {
      Task.countDocuments.mockResolvedValue(0);

      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      Task.find.mockReturnValue({ populate: mockPopulate });

      const result = await getTasks({ userId: "u1" });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
    });
  });

  // ── getTask ───────────────────────────────────────────────────

  describe("getTask()", () => {
    test("should return a single task", async () => {
      const mockPopulate = jest.fn().mockResolvedValue({ _id: "t1", title: "Test" });
      Task.findOne.mockReturnValue({ populate: mockPopulate });

      const result = await getTask("t1", "u1");
      expect(result).toEqual({ _id: "t1", title: "Test" });
      expect(Task.findOne).toHaveBeenCalledWith({
        _id: "t1",
        userId: "u1",
        isDeleted: false,
      });
    });

    test("should return null when task not found", async () => {
      const mockPopulate = jest.fn().mockResolvedValue(null);
      Task.findOne.mockReturnValue({ populate: mockPopulate });

      const result = await getTask("t999", "u1");
      expect(result).toBeNull();
    });
  });

  // ── addTask ───────────────────────────────────────────────────

  describe("addTask()", () => {
    test("should create a new task", async () => {
      Task.create.mockResolvedValue({
        _id: "t1",
        title: "New Task",
        status: "Yet to do",
      });

      const result = await addTask({
        title: "New Task",
        description: "Desc",
        priority: "High",
        userId: "u1",
      });

      expect(result._id).toBe("t1");
      expect(Task.create).toHaveBeenCalledWith({
        title: "New Task",
        description: "Desc",
        priority: "High",
        status: "Yet to do",
        userId: "u1",
      });
    });

    test("should use provided status", async () => {
      Task.create.mockResolvedValue({ _id: "t2", status: "In Progress" });

      await addTask({
        title: "Task",
        status: "In Progress",
        userId: "u1",
      });

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "In Progress" })
      );
    });
  });

  // ── editTask ──────────────────────────────────────────────────

  describe("editTask()", () => {
    test("should update task", async () => {
      Task.findOneAndUpdate.mockResolvedValue({ _id: "t1", title: "Updated" });

      const result = await editTask("t1", { title: "Updated" }, "u1");

      expect(result).toEqual({ _id: "t1", title: "Updated" });
      expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "t1", userId: "u1", isDeleted: false },
        { title: "Updated" },
        { new: true, runValidators: true }
      );
    });

    test("should return null when task not found", async () => {
      Task.findOneAndUpdate.mockResolvedValue(null);

      const result = await editTask("t999", {}, "u1");
      expect(result).toBeNull();
    });
  });

  // ── removeTask ────────────────────────────────────────────────

  describe("removeTask()", () => {
    test("should soft-delete task", async () => {
      Task.findOneAndUpdate.mockResolvedValue({
        _id: "t1",
        isDeleted: true,
      });

      const result = await removeTask("t1", "u1");

      expect(result.isDeleted).toBe(true);
      expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "t1", userId: "u1", isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
    });

    test("should return null when task not found", async () => {
      Task.findOneAndUpdate.mockResolvedValue(null);

      const result = await removeTask("t999", "u1");
      expect(result).toBeNull();
    });
  });

  // ── getDashboardStats ─────────────────────────────────────────

  describe("getDashboardStats()", () => {
    test("should return aggregated stats", async () => {
      Task.aggregate.mockResolvedValue([
        { _id: "Completed", count: 5 },
        { _id: "In Progress", count: 3 },
      ]);

      const result = await getDashboardStats();

      expect(result).toEqual([
        { _id: "Completed", count: 5 },
        { _id: "In Progress", count: 3 },
      ]);
    });

    test("should return empty array when no tasks", async () => {
      Task.aggregate.mockResolvedValue([]);

      const result = await getDashboardStats();
      expect(result).toEqual([]);
    });
  });
});
