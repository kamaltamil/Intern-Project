const {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
  getDashboardStats,
} = require("../services/taskService");

const { successResponse, errorResponse } = require("../utils/response");

const getAllTasks = async (req, res) => {
  // Derived once — avoids repeating req.user?._id || req.user?.id in every handler.
  const userId = req.user._id;

  try {
    const result = await getTasks({
      userId,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getTaskById = async (req, res) => {
  const userId = req.user._id;

  try {
    const task = await getTask(req.params.id, userId);

    if (!task) return errorResponse(res, "Task not found", 404);

    return successResponse(res, task);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const createTask = async (req, res) => {
  const userId = req.user._id;

  try {
    const task = await addTask({ ...req.body, userId });
    return successResponse(res, task, "Task created successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateTask = async (req, res) => {
  const userId = req.user._id;

  try {
    const task = await editTask(req.params.id, req.body, userId);

    if (!task) return errorResponse(res, "Task not found", 404);

    return successResponse(res, task, "Task updated successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteTask = async (req, res) => {
  const userId = req.user._id;

  try {
    const task = await removeTask(req.params.id, userId);

    if (!task) return errorResponse(res, "Task not found", 404);

    return successResponse(res, null, "Task deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const dashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    const result = {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      yetToDoTasks: 0,
    };

    stats.forEach((item) => {
      result.totalTasks += item.count;

      if (item._id === "Completed") result.completedTasks = item.count;
      if (item._id === "In Progress") result.inProgressTasks = item.count;
      if (item._id === "Yet to do") result.yetToDoTasks = item.count;
    });

    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, dashboardStats };