import taskReducer, { setTasksData, clearTasks } from "../../store/taskSlice";

describe("taskSlice.js", () => {
  const initialState = { tasks: [], total: 0 };

  describe("setTasksData reducer", () => {
    test("should set tasks and total", () => {
      const payload = {
        tasks: [{ _id: "1", title: "Task 1" }],
        total: 1,
      };

      const state = taskReducer(initialState, setTasksData(payload));

      expect(state.tasks).toEqual([{ _id: "1", title: "Task 1" }]);
      expect(state.total).toBe(1);
    });

    test("should replace existing tasks", () => {
      const existingState = {
        tasks: [{ _id: "1", title: "Old" }],
        total: 1,
      };

      const payload = {
        tasks: [{ _id: "2", title: "New" }],
        total: 1,
      };

      const state = taskReducer(existingState, setTasksData(payload));

      expect(state.tasks).toEqual([{ _id: "2", title: "New" }]);
    });
  });

  describe("clearTasks reducer", () => {
    test("should reset tasks and total to initial values", () => {
      const existingState = {
        tasks: [{ _id: "1", title: "Task" }],
        total: 5,
      };

      const state = taskReducer(existingState, clearTasks());

      expect(state.tasks).toEqual([]);
      expect(state.total).toBe(0);
    });
  });
});
