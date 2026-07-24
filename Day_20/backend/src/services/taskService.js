const Task = require("../models/task");

const getTasks = async ({ userId, search = "", page = 1, limit = 5 }) => {
  page = Number(page);
  limit = Number(limit);

  const query = {
    isDeleted: false,
    userId,
    title: { $regex: search, $options: "i" },
  };

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { page, limit, total, totalPages: Math.ceil(total / limit), data: tasks };
};

const getTask = async (id, userId) =>
  Task.findOne({ _id: id, userId, isDeleted: false }).populate("userId", "name email");

const addTask = async (taskData) =>
  Task.create({
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    status: taskData.status || "Yet to do",
    userId: taskData.userId,
  });

const editTask = async (id, updatedData, userId) =>
  Task.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    updatedData,
    { new: true, runValidators: true }
  );

const removeTask = async (id, userId) =>
  Task.findOneAndUpdate(
    { _id: id, userId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

const getDashboardStats = async () =>
  Task.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$status",
        // Bug fix: was $sum: 2 — each task was being double-counted.
        count: { $sum: 1 },
      },
    },
  ]);

module.exports = { getTasks, getTask, addTask, editTask, removeTask, getDashboardStats };
