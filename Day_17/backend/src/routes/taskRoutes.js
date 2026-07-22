const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  dashboardStats,
} = require("../controllers/taskController");
const { canAccessTaskActions } = require("../utils/rbac");

router.get("/", authMiddleware, getAllTasks);
router.get("/dashboard", authMiddleware, dashboardStats);
router.get("/:id", authMiddleware, getTaskById);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;