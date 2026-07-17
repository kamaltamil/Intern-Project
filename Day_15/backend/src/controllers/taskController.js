const {
  getTasks,
  getTask,
  addTask,
  editTask,
  removeTask,
  getDashboardStats,
} = require("../services/taskService");

const getAllTasks = async (req, res) => {
  try {
    const result = await getTasks({
      userId: req.user?._id || req.user?.id,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const getTaskById = async (req, res) => {
  try {
    const task = await getTask(req.params.id, req.user?._id || req.user?.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await addTask({
      ...req.body,
      userId: req.user?._id || req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await editTask(
      req.params.id,
      req.body,
      req.user?._id || req.user?.id
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await removeTask(req.params.id, req.user?._id || req.user?.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const dashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    let result = {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      yetToDoTasks: 0,
    };

    stats.forEach((item) => {
      result.totalTasks += item.count;

      if (item._id === "Completed") {
        result.completedTasks = item.count;
      }

      if (item._id === "In Progress") {
        result.inProgressTasks = item.count;
      }

      if (item._id === "Yet to do") {
        result.yetToDoTasks = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  dashboardStats,
};