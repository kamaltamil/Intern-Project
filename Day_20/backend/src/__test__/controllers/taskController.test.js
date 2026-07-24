const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  dashboardStats,
} = require("../../controllers/taskController");

jest.mock("../../services/taskService", () => ({
  getTasks: jest.fn(),
  getTask: jest.fn(),
  addTask: jest.fn(),
  editTask: jest.fn(),
  removeTask: jest.fn(),
  getDashboardStats: jest.fn(),
}));

const {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
  getDashboardStats,
} = require("../../services/taskService");

describe("taskController.js", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ── getAllTasks ────────────────────────────────────────────────

  describe("getAllTasks()", () => {
    test("should return tasks successfully", async () => {
      mockReq = {
        user: { _id: "u1" },
        query: { search: "react", page: "1", limit: "5" },
      };
      getTasks.mockResolvedValue({
        data: [{ title: "Test" }],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      });

      await getAllTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [{ title: "Test" }],
          total: 1,
        })
      );
    });

    test("should use user.id fallback when _id is missing", async () => {
      mockReq = {
        user: { id: "u2" },
        query: {},
      };
      getTasks.mockResolvedValue({ data: [], total: 0 });

      await getAllTasks(mockReq, mockRes);

      expect(getTasks).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "u2" })
      );
    });

    test("should return 500 on error", async () => {
      mockReq = {
        user: { _id: "u1" },
        query: {},
      };
      getTasks.mockRejectedValue(new Error("DB error"));

      await getAllTasks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getTaskById ───────────────────────────────────────────────

  describe("getTaskById()", () => {
    test("should return task successfully", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { _id: "u1" },
      };
      getTask.mockResolvedValue({ _id: "t1", title: "Test" });

      await getTaskById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "t1", title: "Test" },
      });
    });

    test("should return 404 when task not found", async () => {
      mockReq = {
        params: { id: "t999" },
        user: { _id: "u1" },
      };
      getTask.mockResolvedValue(null);

      await getTaskById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should use user.id fallback", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { id: "u2" },
      };
      getTask.mockResolvedValue({ _id: "t1" });

      await getTaskById(mockReq, mockRes);

      expect(getTask).toHaveBeenCalledWith("t1", "u2");
    });

    test("should return 500 on error", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { _id: "u1" },
      };
      getTask.mockRejectedValue(new Error("DB error"));

      await getTaskById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createTask ────────────────────────────────────────────────

  describe("createTask()", () => {
    test("should create task successfully", async () => {
      mockReq = {
        body: { title: "New Task" },
        user: { _id: "u1" },
      };
      addTask.mockResolvedValue({ _id: "t1", title: "New Task" });

      await createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Task created successfully",
        data: { _id: "t1", title: "New Task" },
      });
    });

    test("should use user.id fallback", async () => {
      mockReq = {
        body: { title: "Task" },
        user: { id: "u2" },
      };
      addTask.mockResolvedValue({ _id: "t2" });

      await createTask(mockReq, mockRes);

      expect(addTask).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "u2" })
      );
    });

    test("should return 500 on error", async () => {
      mockReq = {
        body: { title: "Task" },
        user: { _id: "u1" },
      };
      addTask.mockRejectedValue(new Error("DB error"));

      await createTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── updateTask ────────────────────────────────────────────────

  describe("updateTask()", () => {
    test("should update task successfully", async () => {
      mockReq = {
        params: { id: "t1" },
        body: { title: "Updated" },
        user: { _id: "u1" },
      };
      editTask.mockResolvedValue({ _id: "t1", title: "Updated" });

      await updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Task updated successfully",
        data: { _id: "t1", title: "Updated" },
      });
    });

    test("should return 404 when task not found", async () => {
      mockReq = {
        params: { id: "t999" },
        body: { title: "Updated" },
        user: { _id: "u1" },
      };
      editTask.mockResolvedValue(null);

      await updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should use user.id fallback", async () => {
      mockReq = {
        params: { id: "t1" },
        body: { title: "Updated" },
        user: { id: "u2" },
      };
      editTask.mockResolvedValue({ _id: "t1" });

      await updateTask(mockReq, mockRes);

      expect(editTask).toHaveBeenCalledWith("t1", { title: "Updated" }, "u2");
    });

    test("should return 500 on error", async () => {
      mockReq = {
        params: { id: "t1" },
        body: { title: "Updated" },
        user: { _id: "u1" },
      };
      editTask.mockRejectedValue(new Error("DB error"));

      await updateTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── deleteTask ────────────────────────────────────────────────

  describe("deleteTask()", () => {
    test("should delete task successfully", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { _id: "u1" },
      };
      removeTask.mockResolvedValue({ _id: "t1" });

      await deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Task deleted successfully",
      });
    });

    test("should return 404 when task not found", async () => {
      mockReq = {
        params: { id: "t999" },
        user: { _id: "u1" },
      };
      removeTask.mockResolvedValue(null);

      await deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test("should use user.id fallback", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { id: "u2" },
      };
      removeTask.mockResolvedValue({ _id: "t1" });

      await deleteTask(mockReq, mockRes);

      expect(removeTask).toHaveBeenCalledWith("t1", "u2");
    });

    test("should return 500 on error", async () => {
      mockReq = {
        params: { id: "t1" },
        user: { _id: "u1" },
      };
      removeTask.mockRejectedValue(new Error("DB error"));

      await deleteTask(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // ── dashboardStats ────────────────────────────────────────────

  describe("dashboardStats()", () => {
    test("should return dashboard stats", async () => {
      mockReq = {};
      getDashboardStats.mockResolvedValue([
        { _id: "Completed", count: 5 },
        { _id: "In Progress", count: 3 },
        { _id: "Yet to do", count: 2 },
      ]);

      await dashboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalTasks: 10,
          completedTasks: 5,
          inProgressTasks: 3,
          yetToDoTasks: 2,
        },
      });
    });

    test("should return zeros when no stats", async () => {
      mockReq = {};
      getDashboardStats.mockResolvedValue([]);

      await dashboardStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          yetToDoTasks: 0,
        },
      });
    });

    test("should handle unknown status types", async () => {
      mockReq = {};
      getDashboardStats.mockResolvedValue([
        { _id: "Unknown", count: 1 },
      ]);

      await dashboardStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalTasks: 1,
          completedTasks: 0,
          inProgressTasks: 0,
          yetToDoTasks: 0,
        },
      });
    });

    test("should return 500 on error", async () => {
      mockReq = {};
      getDashboardStats.mockRejectedValue(new Error("DB error"));

      await dashboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
