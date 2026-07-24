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

const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateTaskQuery,
} = require("../middleware/validators/taskValidator");
const handleValidationErrors = require("../middleware/validators/validationHandler");

const { authenticatedLimiter } = require("../config/rateLimitConfig");

// All task routes require authentication
router.use(authMiddleware);

router.get("/", authenticatedLimiter, validateTaskQuery, handleValidationErrors, getAllTasks);
router.get("/dashboard", authenticatedLimiter, dashboardStats);
router.get("/:id", authenticatedLimiter, validateTaskId, handleValidationErrors, getTaskById);
router.post("/", authenticatedLimiter, validateCreateTask, handleValidationErrors, createTask);
router.put("/:id", authenticatedLimiter, validateTaskId, validateUpdateTask, handleValidationErrors, updateTask);
router.delete("/:id", authenticatedLimiter, validateTaskId, handleValidationErrors, deleteTask);

module.exports = router;