import {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";

import api from "../api/axios";
import { store } from "../store";

jest.mock("../api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../store", () => ({
  store: {
    getState: jest.fn(),
  },
}));

const API_URL = "http://localhost:8080/api";

describe("taskApi.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    store.getState.mockReturnValue({
      auth: {
        token: "fake-task-token",
      },
    });
  });

  describe("getTasks()", () => {
    test("should fetch tasks with default parameters and token", async () => {
      api.get.mockResolvedValue({
        data: {
          tasks: [],
          total: 0,
        },
      });

      const result = await getTasks();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith(`${API_URL}/tasks`, {
        params: {
          page: 1,
          limit: 5,
          search: "",
        },
        headers: {
          Authorization: "Bearer fake-task-token",
        },
      });

      expect(result).toEqual({
        tasks: [],
        total: 0,
      });
    });

    test("should fetch tasks with custom parameters and no token", async () => {
      store.getState.mockReturnValue({
        auth: {
          token: null,
        },
      });

      api.get.mockResolvedValue({
        data: { tasks: [{ id: 1, title: "Test Task" }] },
      });

      const result = await getTasks(2, 10, "react");

      expect(api.get).toHaveBeenCalledWith(`${API_URL}/tasks`, {
        params: {
          page: 2,
          limit: 10,
          search: "react",
        },
        headers: {},
      });

      expect(result).toEqual({
        tasks: [{ id: 1, title: "Test Task" }],
      });
    });
  });

  describe("getTaskById()", () => {
    test("should fetch a single task by id", async () => {
      api.get.mockResolvedValue({
        data: {
          id: "123",
          title: "Learn Testing",
        },
      });

      const result = await getTaskById("123");

      expect(api.get).toHaveBeenCalledWith(`${API_URL}/tasks/123`, {
        headers: {
          Authorization: "Bearer fake-task-token",
        },
      });

      expect(result).toEqual({
        id: "123",
        title: "Learn Testing",
      });
    });
  });

  describe("addTask()", () => {
    test("should add a new task successfully", async () => {
      const newTask = { title: "New Task", description: "Jest and React" };

      api.post.mockResolvedValue({
        data: {
          success: true,
          task: { id: "456", ...newTask },
        },
      });

      const result = await addTask(newTask);

      expect(api.post).toHaveBeenCalledWith(`${API_URL}/tasks`, newTask, {
        headers: {
          Authorization: "Bearer fake-task-token",
        },
      });

      expect(result).toEqual({
        success: true,
        task: { id: "456", ...newTask },
      });
    });
  });

  describe("updateTask()", () => {
    test("should update an existing task by id", async () => {
      const updatedData = { title: "Updated Task Title" };

      api.put.mockResolvedValue({
        data: {
          success: true,
        },
      });

      const result = await updateTask("123", updatedData);

      expect(api.put).toHaveBeenCalledWith(
        `${API_URL}/tasks/123`,
        updatedData,
        {
          headers: {
            Authorization: "Bearer fake-task-token",
          },
        }
      );

      expect(result).toEqual({
        success: true,
      });
    });
  });

  describe("deleteTask()", () => {
    test("should delete a task by id", async () => {
      api.delete.mockResolvedValue({
        data: {
          message: "Task deleted successfully",
        },
      });

      const result = await deleteTask("123");

      expect(api.delete).toHaveBeenCalledWith(`${API_URL}/tasks/123`, {
        headers: {
          Authorization: "Bearer fake-task-token",
        },
      });

      expect(result).toEqual({
        message: "Task deleted successfully",
      });
    });
  });
});